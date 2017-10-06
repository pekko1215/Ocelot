var width = 375;
var height = 667;

// ステージを作る
var stage = new PIXI.Container();

// レンダラーを作る
var renderer = new PIXI.WebGLRenderer(width, height, {backgroundColor: 0x000000});

// レンダラーのviewをDOMに追加する
document.getElementById("pixiview").appendChild(renderer.view);


//キーコード
function keyboard(keyCode) {                                                         
    var key     = {}                                                                 
    key.code    = keyCode                                                            
    key.isDown  = false                                                              
    key.isUp    = true                                                               
    key.press   = undefined                                                          
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

//キーボード                                                                     
var left  = keyboard(37)                                                         
var up    = keyboard(38)                                                         
var right = keyboard(39)                                                         
var down  = keyboard(40) 

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
left.press  = VecHor( 5);                                                       
up.press    = VecVer( 5);                                                       
down.press  = VecVer(-5);                                                       
                                                                                    
right.release = VecHor(0);                                                          
left.release  = VecHor(0);                                                          
up.release    = VecVer(0);                                                          
down.release  = VecVer(0);


// オブジェクトを作る

//--ボードの生成----------------

//--仮ボードデータ作成
var Horizontal = 30;
var Vertical = 30;

var bord = [...Array(Horizontal).fill([...Array(Vertical).fill(0)])];
//------------------

var bordAxis = new PIXI.DisplayObjectContainer();     //ボードを動かすための基点

var bordSquares = [...Array(Horizontal).fill([])];
var squareWidth = 40;
var squareHeight = 40;
bord.forEach(function(bordLine,index1){
    bordLine.forEach(function(square,index2){
        //console.log(index1 + " , " + index2);
        bordSquares[index1][index2] = new PIXI.Graphics();
        switch(square){
            case 0:
                //console.log(bordSquares[index1][index2]);
                bordSquares[index1][index2].beginFill(0xffffff,1);
                bordSquares[index1][index2].tint = 0xccccccc;
            break;
            case 1:
                bordSquares[index1][index2].beginFill(0xccffcc,1);
            break;
        }
        bordSquares[index1][index2].lineStyle(2,0x000000);
        bordSquares[index1][index2].drawRect(index1*squareWidth, index2*squareHeight, squareWidth, squareHeight);
        bordSquares[index1][index2].endFill();
        bordAxis.addChild(bordSquares[index1][index2]);
    })
})
//----------------------------

//--プレイヤーの生成-----------
var PlayerPoint = new PIXI.Graphics();
PlayerPoint.lineStyle(0);
PlayerPoint.beginFill(0xccccff,1);
PlayerPoint.drawCircle(width/2, height/2, 10);
PlayerPoint.endFill();


//----------------------------


// オブジェクトをステージに乗せる
stage.addChild(bordAxis);
stage.addChild(PlayerPoint);

// 次のアニメーションフレームでanimate()を呼び出してもらう
animate();

// アニメーション関数を定義する
function animate(){

    requestAnimationFrame(animate); // 次の描画タイミングでanimateを呼び出す
    //bordSquares[5][0].position.x += 1;
    bordAxis.position.x += moveHor;
    bordAxis.position.y += moveVer;
    bord.forEach(function(bordLine, index1){
        bord.forEach(function(square, index2){
            switch(true){
                case bordSquares[index1][index2].position.x >= (width/2) - squareWidth :
                case bordSquares[index1][index2].position.x < width/2 :
                case bordSquares[index1][index2].position.y >= height/2 :
                case bordSquares[index1][index2].position.y < (height/2) - squareHeight :
                   // console.log("にょ");
                    bord[index1][index2] = 1;
                break;
                default :
                    bord[index1][index2] = 0;
            }
            switch(bord[index1][index2]){
                case 0:
                    bordSquares[index1][index2].tint = 0x55cc55;
                break;
                case 1:
                    bordSquares[index1][index2].tint = 0xccffcc;
                    //console.log(bordSquares[index1][index2].tint)
                break;
                default :
                    bordSquares[index1][index2].tint = 0x555555;
                    console.log("zoba")
            }
        })
    })
    renderer.render(stage);   // 描画する
    
}

renderer.render(stage);


