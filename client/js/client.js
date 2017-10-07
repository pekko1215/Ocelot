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
var stage = new PIXI.Container();

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
        alert(input.value);
        socket = io('http://localhost');
        socket.on('connection', (socket) => {
            console.log("con")
        });
    }

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


    // オブジェクトを作る

    //--ボードの生成----------------

    //--仮ボードデータ作成
    var Horizontal = 30;
    var Vertical = 30;

    var bord = [...Array(Horizontal).fill([...Array(Vertical).fill(0)])];
    //------------------

    var bordAxis = new PIXI.DisplayObjectContainer(); //ボードを動かすための基点

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
        bordAxis.position.x += moveHor;
        bordAxis.position.y += moveVer;

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