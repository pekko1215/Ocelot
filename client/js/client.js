var width = document.getElementById('pixiview').offsetWidth
var height = document.getElementById('pixiview').offsetHeight
var socket;
var getDevice = (function() {
    var ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        return 'sp';
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
        return 'tab';
    } else {
        return 'other';
    }
})();
var width = document.getElementById('pixiview').offsetWidth
var height = document.getElementById('pixiview').offsetHeight
if (getDevice != 'other') {
    width = window.innerWidth;
    height = window.innerHeight;
}

var playerId;
var userName;
var roomId;
var roomName;
var playerColor;
var roomPlayers;

["resize", "orientationchange"].forEach((ev) => {
    window.addEventListener(ev, () => {
        width = document.getElementById('pixiview').offsetWidth
        height = document.getElementById('pixiview').offsetHeight
        if (getDevice != 'other') {
            width = screen.width;
            height = screen.height;
            var angle = (screen && screen.orientation && screen.orientation.angle) || window.orientation || 0;
            if (angle % 180 != 0) {
                width = [height, height = width][0]
            }
        }

        renderer.resize(width, height)
    })
})



// ステージを作る
var stage = new PIXI.Graphics();
stage.beginFill(0x000000, 0); //完全透明の四角形を作る
stage.drawRect(0, 0, width, height); //キャンバスと同じサイズ
// レンダラーを作る
var renderer = new PIXI.WebGLRenderer(width, height, { backgroundColor: 0x000000 });

// レンダラーのviewをDOMに追加する
document.getElementById("pixiview").appendChild(renderer.view);

function LoginRender() {
    var label = new PIXI.Text('ユーザ名を入力してください', {
        fill: 0xffffff,
        align: 'right'
    });
    label.height = height / 4;
    label.scale.x = label.scale.y
    label.position.x = (width - label.width) / 2;
    label.position.y = height / 4;

    stage.addChild(label)
    renderer.render(stage); // 描画する

    var input = document.createElement('input');
    input.id = "nameInput";

    input.style.width = width / 4 * 3 + "px"
    input.style.top = label.position.y + 80 + "px";
    input.style.left = (width - width / 4 * 3) / 2 + "px"

    document.body.appendChild(input);

    (function animate() {
        label.height = height / 20;
        label.scale.x = label.scale.y
        label.position.x = (width - label.width) / 2;
        label.position.y = height / 4;

        input.style.width = width / 4 * 3 + "px"
        input.style.top = label.position.y + 80 + "px";
        input.style.left = (width - width / 4 * 3) / 2 + "px"
        renderer.render(stage); // 描画する
        requestAnimationFrame(animate);
    })()

    input.onkeypress = (e) => {
        e.keyCode == 13 && pushCreateUser();
    }

    function pushCreateUser() {
        socket = io('http://ocelot.cloudno.de');
        input.onkeypress = null;
        socket.once('returnPlayer', (e) => {
            input.readOnly = "true";
            playerId = e.id;
            playerColor = e.color;
            var clearCount = 20;
            input.style.opacity = 1
            var inter = setInterval(() => {
                label.alpha -= 1. / clearCount;
                input.style.opacity -= 1. / clearCount;
                if (label.alpha <= 0) {
                    clearInterval(inter)
                    document.body.removeChild(input)
                    stage.removeChild(label)
                    RoomsRender();
                }
            }, 50)
        });
        userName = input.value
        socket.emit('createPlayer', {
            name: input.value
        })
    }

}

function RoomsRender() {
    function createRoomPIXI(obj) {
        var ret = new PIXI.Container();
        var box = new PIXI.Graphics();
        box.beginFill(0x002200, 1);
        box.lineStyle(2, 0xffffff);
        box.drawRect(5, 5, width / 4 * 3 - 5, height / 5 - 5);
        box.endFill();
        box.position.x = width / 4

        box.interactive = true;
        box.buttonMode = true;

        function tevnt() {
            if (obj.isStarted) { return }
            var clearCount = 40;
            var count = 0;
            stage.children.forEach((e) => {
                e.interactive = false;
            })
            var inter = setInterval(() => {
                stage.children.forEach((e) => {
                    e.alpha -= 1. / clearCount
                })
                if (count++ > clearCount) {
                    clearInterval(inter)
                    while (stage.children[0]) { stage.removeChild(stage.children[0]); }
                    socket.emit('joinRoom', {
                        room: roomId = obj.id,
                        player: playerId
                    })
                    socket.once('joinedRoom', () => {
                        roomId = obj.id;
                        roomName = obj.name
                        roomPlayers = obj.players.map((p) => {
                            return {
                                id: p.id,
                                name: p.name,
                                color: p.color
                            }
                        })
                        console.log(roomPlayers)
                        RoomStatusRender();
                    })
                }
            }, 5)
        }
        box.on('click', tevnt);
        box.on('touchend', tevnt);

        ret.addChild(box)

        var NameLabel = new PIXI.Text(obj.name, { fontSize: "45pt", fill: obj.isStarted ? "#888888" : "#ffffff" });
        NameLabel.x = width / 4 + 10;
        NameLabel.y = 10
        ret.addChild(NameLabel)

        var CreateByLabel = new PIXI.Text(`by ${obj.createBy}`, { font: "13px Arial", fill: "#999999" })
        CreateByLabel.x = width - 10 - CreateByLabel.width;
        CreateByLabel.y = 10;
        ret.addChild(CreateByLabel)

        var indexx = width / 4 + 10;
        var indexy = 10 + NameLabel.height + 5;
        obj.players.some((player) => {
            var label = new PIXI.Text(player.name, {
                font: "18px Arial",
                fill: player.color,
                strokeThickness: 2
            })
            label.x = indexx;
            label.y = indexy;
            ret.addChild(label)
            indexx += label.width + 2;
            if (indexx >= box.width) {
                indexy += label.height + 2;
                indexx = width / 4 + 10;
            }
            if (indexy >= box.height) {
                return true;
            }
        })

        return ret;
    }
    socket.once('returnRooms', (data) => {
        data.forEach((d, i) => {
            var tmp = createRoomPIXI(d);
            tmp.y = i * tmp.height;
            stage.addChild(tmp);
        })
    })
    socket.emit('getRooms');
    renderer.render(stage);
    (function animate() {
        renderer.render(stage);
        requestAnimationFrame(animate);
    })()
}

function RoomStatusRender() {
    GameRender()
}

LoginRender();
// GameRender();
function GameRender() {

    //キーコード
    function keyBoardListener() {
        this.listeners = {};
        this.onChange = null;
    }
    keyBoardListener.prototype.setListener = function(keycode, label) {
        this.listeners[label] = false
        window.addEventListener("keydown", e => {
            if (e.keyCode == keycode) {
                this.listeners[label] = true;
                this.onChange && this.onChange(this.listeners);
            }
        })
        window.addEventListener("keyup", e => {
            if (e.keyCode == keycode) {
                this.listeners[label] = false;
                this.onChange && this.onChange(this.listeners);
            }
        })
    }
    var keyListener = new keyBoardListener;

    keyListener.setListener(37, "left");
    keyListener.setListener(38, "up");
    keyListener.setListener(39, "right");
    keyListener.setListener(40, "down");

    var moveHor = 0;
    var moveVer = 0;
    keyListener.onChange = (e) => {
        moveHor = 0;
        moveVer = 0;
        Object.keys(e).forEach((label) => {
            if(!e[label]){return}
            switch (label) {
                case 'left':
                    moveHor++;
                break;
                case 'right':
                    moveHor--;
                break;
                case 'up':
                    moveVer++;
                break;
                case 'down':
                    moveVer--;
                break;
            }
        })
    }


    if (getDevice != 'other') {
        var startPos = {}

        var largeSize = 50;
        var smallSize = 30;

        stage.interactive = true;
        stage.once('touchstart', function start(e) {
            startPos = {
                x: e.data.global.x,
                y: e.data.global.y
            }
            var BaseControl = new PIXI.Graphics();
            BaseControl.lineStyle(1);
            BaseControl.beginFill(0xffffff, 0.2);
            BaseControl.drawCircle(startPos.x, startPos.y, largeSize);
            stage.addChild(BaseControl);

            var defControl = new PIXI.Graphics();
            defControl.lineStyle(1);
            defControl.beginFill(0xffffff, 0.4);
            defControl.drawCircle(0, 0, smallSize);
            defControl.x = startPos.x;
            defControl.y = startPos.y;
            stage.addChild(defControl);

            function move(e) {
                var nowPos = {
                    x: e.data.global.x,
                    y: e.data.global.y
                }
                var length = Math.sqrt(Math.pow(startPos.x - nowPos.x, 2) + Math.pow(startPos.y - nowPos.y, 2));
                if (length > largeSize - smallSize / 2) {
                    var def = {
                        x: nowPos.x - startPos.x,
                        y: nowPos.y - startPos.y
                    }
                    def.x *= (largeSize - smallSize / 2) / length
                    def.y *= (largeSize - smallSize / 2) / length;
                    nowPos.x = def.x + startPos.x;
                    nowPos.y = def.y + startPos.y;
                }
                var def = {
                    x: nowPos.x - startPos.x,
                    y: nowPos.y - startPos.y
                }
                moveHor = def.x / (largeSize - smallSize / 2)
                moveVer = def.y / (largeSize - smallSize / 2)
                moveVer *= 1.5;
                moveHor *= 1.5
                defControl.x = nowPos.x;
                defControl.y = nowPos.y;
            }

            function end() {
                stage.removeChild(defControl);
                stage.removeChild(BaseControl);
                moveHor = 0
                moveVer = 0
                stage.off('touchmove', move);
                stage.off('touchend', end);
                stage.once('touchstart', start);
            }
            stage.on('touchmove', move);
            stage.on('touchend', end);
        })
    }


    // オブジェクトを作る

    //--ボードの生成----------------

    //--仮ボードデータ作成
    var Horizontal = 15;
    var Vertical = 15;

    var bord = [...Array(Horizontal).fill(0).map(() => { return [...Array(Vertical).fill(0)] })];
    //------------------

    var bordAxis = new PIXI.Container(); //ボードを動かすための基点

    var squareWidth = 40;
    var squareHeight = 40;
    var BordObj = new PIXI.Graphics();
    var oldBordData = [...Array(Horizontal).fill(0).map(() => { return [...Array(Vertical).fill(1)] })];

    var bordFirst = true;

    function drawBord() {
        BordObj.lineStyle(2, 0x000000);
        bord.some(function(bordLine, index1) {
            return bordLine.some(function(square, index2) {
                if (!(
                        (bordFirst) ||
                        (oldBordData[index1][index2]) ||
                        (oldBordData[index1 - 1] && oldBordData[index1 - 1][index2]) ||
                        (oldBordData[index1 + 1] && oldBordData[index1 + 1][index2]) ||
                        (oldBordData[index1][index2 + 1]) ||
                        (oldBordData[index1][index2 - 1]) ||
                        (oldBordData[index1 - 1] && oldBordData[index1 - 1][index2 + 1]) ||
                        (oldBordData[index1 - 1] && oldBordData[index1 - 1][index2 - 1]) ||
                        (oldBordData[index1 + 1] && oldBordData[index1 + 1][index2 + 1]) ||
                        (oldBordData[index1 + 1] && oldBordData[index1 + 1][index2 - 1])
                    )) {
                    return
                }
                var globx = BordObj.position.x + squareWidth * index1 + squareWidth / 2 - 5;
                var globy = BordObj.position.y + squareHeight * index2 + squareHeight / 2 - 5;

                var playerx = width / 2;
                var playery = height / 2;
                switch (true) {
                    case Math.abs(globx - playerx) <= (squareWidth / 2) &&
                         Math.abs(globy - playery) <= (squareHeight / 2):
                        bord[index1][index2] = 1;
                        if (oldBordData[index1][index2] == 0) {
                            BordObj.beginFill(0xccffcc, 1);
                        } else {
                            return;
                        }
                        // oldBordData[index1][index2] = 1;
                        break;
                    default:
                        bord[index1][index2] = 0;
                        if (oldBordData[index1][index2] == 1) {
                            BordObj.beginFill(0x004400, 1);
                        } else {
                            return
                        }
                        // oldBordData[index1][index2] = 0;
                }
                BordObj.drawRect(index1 * squareWidth, index2 * squareHeight, squareWidth, squareHeight);
                BordObj.endFill();
            })
        })
        oldBordData = JSON.parse(JSON.stringify(bord));
    }
    window.oldBordData = oldBordData
    stage.addChild(BordObj);
    drawBord()
    bordFirst = false
    //----------------------------

    //--プレイヤーの生成-----------
    var PlayerPoint = new PIXI.Graphics();
    PlayerPoint.lineStyle(0);
    PlayerPoint.beginFill(0xccccff, 1);
    PlayerPoint.drawCircle(width / 2, height / 2, 10);
    PlayerPoint.endFill();


    //----------------------------

    //ｰｰパネル作成-----------------
    var UiContainer = new PIXI.Container(); //UIをまとめるコンテナ
    var UiPanel = new PIXI.Graphics();
    var nameWindow = new PIXI.Graphics();
    var timeWindow = new PIXI.Graphics();
    var myOcelo = new PIXI.Graphics();
    var itemWindow = new PIXI.Graphics();
    var menuButton = new PIXI.Graphics();
    var statusWindow = new PIXI.Graphics();
    var map = new PIXI.Graphics();

    //仮値
    var myName = userName;
    var myColor = playerColor;
    var timer = 10;
    // var roomName
    var status = roomPlayers.map((p) => { p.ocelo = 0; return p })
    // [
    //     { name: "エターナルロア", color: 0x3333ff, ocelo: 5 },
    //     { name: "けいとりん", color: 0xffffff, ocelo: 18 }
    // ]
    var statusTextName = [];
    var statusTextOcelo = [];
    //----

    //名前とかを乗せるUIの土台
    UiPanel.lineStyle(2, 0xffffff);
    UiPanel.beginFill(0x000000);
    UiPanel.drawRoundedRect(0, height - 60, 300, 45, 20);
    UiPanel.endFill();
    UiContainer.addChild(UiPanel);

    //プレイヤーネームを乗せるウィンドウ
    nameWindow.lineStyle(1, 0x000000);
    nameWindow.beginFill(0x0000ff, 0.8);
    nameWindow.drawRoundedRect(0, height - 40, 300, 22, 12);
    nameWindow.endFill();
    UiPanel.addChild(nameWindow);

    //自分のオセロ色、見た目をどうにかしようとして一緒に枠部分も描いてる
    myOcelo.lineStyle(1, 0x0000000);
    myOcelo.beginFill(0xfffffff, 1);
    myOcelo.drawCircle(25, height - 40, 30);
    myOcelo.endFill();
    myOcelo.lineStyle(3, 0x888888);
    myOcelo.beginFill(myColor, 1);
    myOcelo.drawCircle(25, height - 40, 25);
    myOcelo.endFill();
    UiPanel.addChild(myOcelo);

    //制限時間のためのウィンドウ、整数対応か小数対応か分かんなかったのでとりあえず整数で、てゆかたぶん幅的に整数の方がいいと思われ
    timeWindow.lineStyle(2, 0xffffff);
    timeWindow.beginFill(0x6666ff, 0.8);
    timeWindow.drawRoundedRect(width / 2 - 30, 5, 60, 40, 5);
    timeWindow.endFill();
    UiContainer.addChild(timeWindow);

    //アイテムウィンドウ、ボタン機能をあとから追加することになる？
    itemWindow.lineStyle(2, 0xffffff);
    itemWindow.beginFill(0x000000, 0.8);
    itemWindow.drawRoundedRect(10, height - 130, 55, 55, 15);
    itemWindow.endFill();
    UiContainer.addChild(itemWindow);

    //メニューボタン(仮)、とりあえず置いてみたけどメニュー開く必要あるのだろうか。
    menuButton.lineStyle(2, 0xffffff);
    menuButton.beginFill(0xdddddd);
    menuButton.drawRoundedRect(width - 120, 7, 100, 35, 10);
    menuButton.endFill();
    UiContainer.addChild(menuButton);

    //プレイヤーたちのオセロ数を表示するための枠、プレイヤーの色によっては正直見づらくなる。
    statusWindow.lineStyle(1, 0xffffff, 0.6);
    statusWindow.beginFill(0x000000, 0.6);
    statusWindow.drawRoundedRect(5, 5, 140, 160, 10);
    statusWindow.endFill();
    UiContainer.addChild(statusWindow);

    //マップ、の枠部分、未完成。map.renderableをtrueにすると出現するようになる。
    map.lineStyle(3, 0x000000);
    map.beginFill(0xffff00, 0.6);
    map.drawCircle(width - 60, height - 60, 80);
    map.endFill();
    map.lineStyle(0);
    map.beginFill(0x000000, 0.8);
    map.drawCircle(width - 60, height - 60, 70);
    map.endFill();
    UiContainer.addChild(map);
    map.renderable = false;


    var nameText = new PIXI.Text(myName, { font: 'bold 12pt Arial', fill: 'white' });
    var timeText = new PIXI.Text(timer, { font: 'bold 25pt Arial', fill: 'white' });
    var roomText = new PIXI.Text("部屋名 : " + roomName, { font: 'bold 10pt Arial', fill: 'white' });
    var itemText = new PIXI.Text("ITEM", { font: 'bold 12pt Arial', fill: 'white' });
    var menuText = new PIXI.Text("MENU", { font: 'bold 12pt Arial', fill: 0x888888 });

    //プレイヤーネームのテキスト
    nameText.position.x = 60;
    nameText.position.y = height - 37;
    nameWindow.addChild(nameText);

    //制限時間のテキスト
    timeText.position.x = width / 2 - 20;
    timeText.position.y = 7;
    timeWindow.addChild(timeText);

    //部屋名のテキスト
    roomText.position.x = 55;
    roomText.position.y = height - 55;
    UiPanel.addChild(roomText);

    //ITEMの文字
    itemText.position.x = 19;
    itemText.position.y = height - 150;
    itemWindow.addChild(itemText);

    //MENUの文字
    menuText.position.x = width - 95;
    menuText.position.y = 15;
    menuButton.addChild(menuText);

    //全プレイヤーの名前とオセロ数のテキスト、とりあえず連想配列の入った配列使ってるけどあくまでその場しのぎです。
    status.forEach(function(player, index) {
        statusTextName[index] = new PIXI.Text("●" + player.name, { font: 'bold 8pt Arial', fill: player.color });
        statusTextOcelo[index] = new PIXI.Text(("0".repeat(3) + player.ocelo).slice(-3), { font: 'bold 8pt Arial', fill: 'white' });
        statusTextName[index].position.x = 15;
        statusTextName[index].position.y = 15 + index * 20;
        statusTextOcelo[index].position.x = 120;
        statusTextOcelo[index].position.y = 15 + index * 20;
        statusWindow.addChild(statusTextName[index]);
        statusWindow.addChild(statusTextOcelo[index]);
    })
    //--------------------------------- 

    // オブジェクトをステージに乗せる
    stage.addChild(bordAxis);
    stage.addChild(PlayerPoint);
    stage.addChild(UiContainer);

    // 次のアニメーションフレームでanimate()を呼び出してもらう
    animate();

    // アニメーション関数を定義する
    // setInterval(()=>console.log(bordSquares[1][2].x),1000);
    var sendPosDirty = false;

    function animate() {

        requestAnimationFrame(animate); // 次の描画タイミングでanimateを呼び出す
        //bordSquares[5][0].position.x += 1;
        BordObj.position.x += moveHor * 5;
        BordObj.position.y += moveVer * 5;

        if ((moveHor != 0 || moveVer != 0) && !sendPosDirty) {
            socket.emit('changePos', {
                playerId: playerId,
                roomId: roomId,
                pos: {
                    x: width / 2 - BordObj.position.x,
                    y: height / 2 - BordObj.position.y
                }
            })
            sendPosDirty = true;
            setTimeout(() => sendPosDirty = false, 500)
        }
        drawBord()
        renderer.render(stage); // 描画する

    }

    renderer.render(stage);
}