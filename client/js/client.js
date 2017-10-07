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

var userId;
var userName;

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
        socket = io('http://192.168.0.9');
        input.onkeypress = null;
        socket.once('returnPlayer', (e) => {
            input.readOnly = "true";
            userId = e;
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
                    RoomStatusRender();
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
    function keyboard(keyCode) {
        var key = {}
        key.code = keyCode
        key.isDown = false
        key.isUp = true
        key.press = undefined
        key.release = undefined
        //The `downHandler`
        key.downHandler = function(event) {
            if (event.keyCode === key.code) {
                //console.log(key);
                if (key.isUp && key.press) { key.press(); }
                key.isDown = true
                key.isUp = false
            }
            event.preventDefault()
        }
        //The `upHandler`
        key.upHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) { key.release() }
                key.isDown = false
                key.isUp = true
            }
            event.preventDefault()
        }
        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        )
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        )
        return key
    }

    //var keyObject = keyboard(asciiKeyCodeNumber)

    // キーボード
    var left = keyboard(37)
    var up = keyboard(38)
    var right = keyboard(39)
    var down = keyboard(40)

    var moveHor = 0;
    var moveVer = 0;

    function VecHor(vx) {
        return function() {
            moveHor = vx;
        }
    }

    function VecVer(vy) {
        return function() {
            moveVer = vy;
        }
    }

    right.press = VecHor(-5);
    left.press = VecHor(5);
    up.press = VecVer(5);
    down.press = VecVer(-5);

    right.release = VecHor(0);
    left.release = VecHor(0);
    up.release = VecVer(0);
    down.release = VecVer(0);

    if (getDevice != 'other') {
        var startPos = {}
        stage.interactive = true;
        stage.once('touchstart', function start(e) {
            startPos = {
                x: e.data.global.x,
                y: e.data.global.y
            }
            var BaseControl = new PIXI.Graphics();
            BaseControl.lineStyle(1);
            BaseControl.beginFill(0xffffff, 0.8);
            BaseControl.drawCircle(startPos.x, startPos.y, 50);
            stage.addChild(BaseControl);

            var defControl = new PIXI.Graphics();
            defControl.lineStyle(1);
            defControl.beginFill(0xffffff, 0.9);
            defControl.drawCircle(0, 0, 30);
            defControl.x = startPos.x;
            defControl.y = startPos.y;
            stage.addChild(defControl);

            function move(e) {
                var nowPos = {
                    x: e.data.global.x,
                    y: e.data.global.y
                }
                var length = Math.sqrt(Math.pow(startPos.x - nowPos.x, 2) + Math.pow(startPos.y - nowPos.y, 2));
                if (length > 50 - 30 / 2) {
                    var def = {
                        x: nowPos.x - startPos.x,
                        y: nowPos.y - startPos.y
                    }
                    def.x *= (50 - 30 / 2) / length
                    def.y *= (50 - 30 / 2) / length;
                    nowPos.x = def.x + startPos.x;
                    nowPos.y = def.y + startPos.y;
                }
                var def = {
                    x: nowPos.x - startPos.x,
                    y: nowPos.y - startPos.y
                }
                moveHor = def.x/15
                moveVer = def.y/15
                defControl.x = nowPos.x;
                defControl.y = nowPos.y;
            }

            function end() {
                stage.removeChild(defControl);
                stage.removeChild(BaseControl);
                moveHor = 0
                moveVer = 0
                stage.once('touchstart', start);
            }
            stage.on('touchmove', move);
            stage.on('touchend', end);
        })
    }


    // オブジェクトを作る

    //--ボードの生成----------------

    //--仮ボードデータ作成
    var Horizontal = 30;
    var Vertical = 30;

    var bord = [...Array(Horizontal).fill([...Array(Vertical).fill(0)])];
    //------------------

    var bordAxis = new PIXI.Container(); //ボードを動かすための基点

    var bordSquares = [...Array(Horizontal).fill(0).map(() => { return [...Array(Vertical)] })];
    var squareWidth = 40;
    var squareHeight = 40;
    bord.forEach(function(bordLine, index1) {
        bordLine.forEach(function(square, index2) {
            //console.log(index1 + " , " + index2);
            bordSquares[index1][index2] = new PIXI.Graphics();
            switch (square) {
                case 0:
                    //console.log(bordSquares[index1][index2]);
                    bordSquares[index1][index2].beginFill(0xffffff, 1);
                    bordSquares[index1][index2].tint = 0xccccccc;
                    break;
                case 1:
                    bordSquares[index1][index2].beginFill(0xccffcc, 1);
                    break;
            }
            bordSquares[index1][index2].lineStyle(2, 0x000000);
            bordSquares[index1][index2].drawRect(0, 0, squareWidth, squareHeight);
            bordSquares[index1][index2].endFill();
            bordSquares[index1][index2].position.x = index1 * squareWidth;
            bordSquares[index1][index2].position.y = index2 * squareHeight;
            bordAxis.addChild(bordSquares[index1][index2]);
        })
    })
    //----------------------------

    //--プレイヤーの生成-----------
    var PlayerPoint = new PIXI.Graphics();
    PlayerPoint.lineStyle(0);
    PlayerPoint.beginFill(0xccccff, 1);
    PlayerPoint.drawCircle(width / 2, height / 2, 10);
    PlayerPoint.endFill();


    //----------------------------


    // オブジェクトをステージに乗せる
    stage.addChild(bordAxis);
    stage.addChild(PlayerPoint);

    // 次のアニメーションフレームでanimate()を呼び出してもらう
    animate();

    // アニメーション関数を定義する
    // setInterval(()=>console.log(bordSquares[1][2].x),1000);
    function animate() {

        requestAnimationFrame(animate); // 次の描画タイミングでanimateを呼び出す
        //bordSquares[5][0].position.x += 1;
        bordAxis.position.x += moveHor * 3;
        bordAxis.position.y += moveVer * 3;

        bord.forEach(function(bordLine, index1) {
            bord.forEach(function(square, index2) {
                var globx = bordSquares[index1][index2].position.x + bordAxis.position.x + squareWidth / 2;
                var globy = bordSquares[index1][index2].position.y + bordAxis.position.y + squareHeight / 2;

                var playerx = width / 2;
                var playery = height / 2;


                switch (true) {
                    case Math.abs(globx - playerx) <= (squareWidth / 2) &&
                    Math.abs(globy - playery) <= (squareHeight / 2):
                        // console.log("にょ");
                        bord[index1][index2] = 1;
                        break;
                    default:
                        bord[index1][index2] = 0;
                }
                switch (bord[index1][index2]) {
                    case 0:
                        bordSquares[index1][index2].tint = 0x55cc55;
                        break;
                    case 1:
                        bordSquares[index1][index2].tint = 0xccffcc;
                        //console.log(bordSquares[index1][index2].tint)
                        break;
                    default:
                        bordSquares[index1][index2].tint = 0x555555;
                        console.log("zoba")
                }
            })
        })
        renderer.render(stage); // 描画する

    }

    renderer.render(stage);
}