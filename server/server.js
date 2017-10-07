const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Game = require('./Game');
const Player = require('./Player')
const Room = require('./Room')

const PORT = process.env.app_port || 80;

app.get(`/`, (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var Rooms = {};
var Players = {};

io.on('connection', (socket) => {
	//ルーム情報の送信
	socket.on('getRooms',()=>{
		socket.emit('returnRooms',Rooms);
	})

	//プレイヤーの作成
	//{
	//  name:"名前",
	//}
	socket.on('createPlayer',(data)=>{
		var player = new Player({
			name:data.name
		})
		Players[player.id] = player;
		socket.emit('returnPlayer',player.id);
	})

	//ルームの作成
	//{
	//	name:"ルーム名",
	//	createBy:"作成者のユーザID",
	//	option:{ //オプション
	//		...
	//	}
	//}
	socket.on('createRoom',(data)=>{
		var room = new Room({
			name: data.name,//ルーム名
			createBy:Players[data.createBy],//作成者のPlayerインスタンス
			option:data.option,
			isStarted:false,//ゲームがスタートしているか
			game:null
		})
		var game = new Game({
			bordSize:data.bordSize||15
		})
		game.addPlayer(Players[data.createBy])
		room.setGame(game);
		Rooms[room.id] = room;
		socket.emit('returnRoom',room.id);
	})
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

//WU0lTD0AW2