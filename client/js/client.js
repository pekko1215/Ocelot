var width = 600;
var height = 400;

// ステージを作る
var stage = new PIXI.Stage(0xFF0000);

// レンダラーを作る
var renderer = PIXI.autoDetectRenderer(width, height);

// レンダラーのviewをDOMに追加する
document.getElementById("pixiview").appendChild(renderer.view);

// テキストオブジェクトを作る
var word = "Hello World!";
var style = {font:'bold 60pt Arial', fill:'white'};
var textobj = new PIXI.Text(word, style);
textobj.position.x = 60;
textobj.position.y = height / 2;
var bordSquares = new PIXI.Rectangle(1.0,1.0,1.0,1.0);
//var bordSquares = new PIXI.Text("zoba")
console.log(bordSquares);

// オブジェクトをステージに乗せる

stage.addChild(textobj);
stage.addChild(bordSquares);


// アニメーション関数を定義する
function animate(){
    requestAnimFrame(animate); // 次の描画タイミングでanimateを呼び出す
    //textobj.rotation += 0.01; // テキストを回転する
    renderer.render(stage);   // 描画する
}

// 次のアニメーションフレームでanimate()を呼び出してもらう
requestAnimFrame(animate);
