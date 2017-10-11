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


var room = new Room({
    name: "豚小屋", //ルーム名
    createBy: new Player({name:"もちもち手裏剣"}), //作成者のPlayerインスタンス
    isStarted: false, //ゲームがスタートしているか
    game: null
})
var game = new Game({
    bordSize: 15,
    emitter:io
})
room.setGame(game);
["pekko1215", "猫丸", "🍣野郎", "アルギン酸ナトリウム", "ゴリラ植松"].forEach((name) => {
    var player = new Player({
        name: name
    })
    Players[player.id] = player;
    room.game.addPlayer(player);
})
Rooms[room.id] = room;

var room = new Room({
    name: "豚小屋1", //ルーム名
    createBy: new Player({name:"もちもち手裏剣1"}), //作成者のPlayerインスタンス
    isStarted: false, //ゲームがスタートしているか
    game: null
})
var game = new Game({
    bordSize: 15,
    emitter:io
})
room.setGame(game);
["pekko1215", "猫丸", "🍣野郎", "アルギン酸ナトリウム", "ゴリラ植松"].forEach((name) => {
    var player = new Player({
        name: name
    })
    Players[player.id] = player;
    room.game.addPlayer(player);
})
Rooms[room.id] = room;

io.on('connection', (socket) => {
    //ルーム情報の送信
    socket.on('getRooms', () => {
        var arr = [];
        arr = Object.keys(Rooms).map((roomId) => {
			var room = Rooms[roomId]
            return {
                name: room.name,
                createBy: room.createBy.name,
                isStarted: room.isStarted,
                id: room.id,
                players: room.game.getPlayers()
            }
        })
        socket.emit('returnRooms', arr);
    })

    //プレイヤーの作成
    //{
    //  name:"名前",
    //}
    socket.on('createPlayer', (data) => {
        if (!("name" in data)) {
            socket.emit('returnPlayer', false);
            return;
        }
        var player = new Player({
            name: data.name
        })
        Players[player.id] = player;
        console.log(`Create Player ${data.name} -> ${player.id}`)
        socket.emit('returnPlayer', {id:player.id,color:player.color});
    })

    //ルームの作成
    //{
    //	name:"ルーム名",
    //	createBy:"作成者のユーザID",
    //	option:{ //オプション
    //		...
    //	}
    //}
    socket.on('createRoom', (data) => {
        var room = new Room({
            name: data.name, //ルーム名
            createBy: Players[data.createBy], //作成者のPlayerインスタンス
            option: data.option,
            isStarted: false, //ゲームがスタートしているか
            game: null
        })
        var game = new Game({
            bordSize: data.bordSize || 15,
            emitter:socket
        })
        game.addPlayer(Players[data.createBy])
        room.setGame(game);
        Rooms[room.id] = room;
        console.log(`Create Room ${room.name} by ${room.createBy.name}`)
        socket.emit('returnRoom', room.id);
    })

    socket.on('joinRoom', (data) => {
        Rooms[data.room].game.addPlayer(Players[data.player]);
        console.log(`Join Room ${Players[data.player].name} to ${Rooms[data.room].name}`)
		socket.emit('joinedRoom')
    })

    socket.on('getRoom',(roomId)=>{
		socket.emit('returnRoom',Rooms[roomId]);
    })

    socket.on('changePos',(data)=>{
		// console.log(data)
		Rooms[data.roomId].game.setPos({
			playerId:data.playerId,
			pos:data.pos,
		});
		console.log(`${Players[data.playerId].name} move to ${data.pos.x},${data.pos.y}`)
    })
});

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

//WU0lTD0AW2