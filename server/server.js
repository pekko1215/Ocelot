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


// var room = new Room({
//     name: "豚小屋", //ルーム名
//     createBy: new Player({name:"もちもち手裏剣"}), //作成者のPlayerインスタンス
//     isStarted: false, //ゲームがスタートしているか
//     game: null
// })
// var game = new Game({
//     bordSize: 15,
//     emitter:io
// })
// room.setGame(game);
// ["pekko1215", "猫丸", "🍣野郎", "アルギン酸ナトリウム", "ゴリラ植松"].forEach((name) => {
//     var player = new Player({
//         name: name
//     })
//     Players[player.id] = player;
//     room.game.addPlayer(player);
// })
// Rooms[room.id] = room;

// var room = new Room({
//     name: "豚小屋1", //ルーム名
//     createBy: new Player({name:"もちもち手裏剣1"}), //作成者のPlayerインスタンス
//     isStarted: false, //ゲームがスタートしているか
//     game: null
// })
// var game = new Game({
//     bordSize: 15,
//     emitter:io
// })
// room.setGame(game);
// ["pekko1215", "猫丸", "🍣野郎", "アルギン酸ナトリウム", "ゴリラ植松"].forEach((name) => {
//     var player = new Player({
//         name: name
//     })
//     Players[player.id] = player;
//     room.game.addPlayer(player);
// })
// Rooms[room.id] = room;

io.on('connection', (socket) => {
    //引数：なし
    //戻り値：[{
    //  name:ルーム名,
    //  createBy:作成者のプレイヤー名,
    //  isStarted:ゲームがスタートしてるか,
    //  id:ルームID,
    //  players:プレイヤーオブジェクトの配列
    //}]
    //説明：現在、作成されているルーム一覧を取得する
    socket.on('getRooms', () => {
        var arr = [];
        arr = Object.keys(Rooms).map((roomId) => {
            var room = Rooms[roomId]
            return {
                name: room.name,
                createBy: room.createBy.name,
                isStarted: room.isStarted,
                id: room.id,
                players: room.game.toObject().players
            }
        })
        socket.emit('returnRooms', arr);
    })

    //プレイヤーの作成
    //引数：プレイヤー名
    //戻り値：{
    //  id:プレイヤーID,
    //  color:プレイヤカラー
    //}
    //説明：名前からプレイヤーを作成する。
    socket.on('createPlayer', (data) => {
        var player = new Player({
            name: data,
            socket: socket
        })
        Players[player.id] = player;
        console.log(`Create Player ${data} -> ${player.id}`)
        socket.emit('returnPlayer', { id: player.id, color: player.color });
    })

    //ルームの作成
    //{
    //  name:"ルーム名",
    //  createBy:"作成者のユーザID",
    //  option:{ //オプション
    //      ...
    //  }
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
            emitter: socket
        })
        room.setGame(game);
        Rooms[room.id] = room;
        console.log(`Create Room ${room.name} by ${room.createBy.name}`)
        socket.emit('returnRoom', room.id);
    })

    socket.on('joinRoom', (data) => {
        Rooms[data.room].game.addPlayer(Players[data.player]);
        console.log(`Join Room ${Players[data.player].name} to ${Rooms[data.room].name}`)
        socket.emit('joinedRoom', Rooms[data.room].toObject())
    })

    //引数：ルームID
    //戻り値：returnFireイベント
    // - 現在のゲームの情報
    //説明：定期的に呼び出して、同期を行う。
    socket.on('fire', (roomId) => {
        socket.emit('returnFire', Rooms[roomId].game.toObject());
    })

    //   //引数：ルームID
    //   //
    //   socket.on('getRoom',(roomId)=>{
    // socket.emit('returnRoom',Rooms[roomId].map((r)=>{return r.toObject()}));
    //   })


    //引数：{
    //  playerId:プレイヤーID,
    //  prepared:準備完了かどうか(boolean)
    //}
    //戻り値
    //：１returnChangePrepareイベント
    // - Player情報を返却
    //：２changePlayerIndoイベント
    // - Player情報を返却
    // 説明：プレイヤーが準備完了どうかを変更する。
    socket.on("changePrepare", (data) => {
        Players[data.playerId].prepared = data.prepared;
        socket.emit('returnChangePrepare', Players[data.playerId]);
        socket.emit('changePlayerInfo', Players[data.playerId]);
    })

    //引数：ルームID
    //戻り値：returnGameStartイベント
    // - ゲーム情報を返却
    //説明：ゲームをスタートする。全員が準備完了状態になる必要がある。
    socket.on('gameStart', (roomId) => {
        var room = Rooms[roomId];
        if (room.isAllPrepared()) {
            Rooms[roomId].game.GameStart();
            socket.emit('returnGameStart', Rooms[roomId].game.toObject());
        }else{
            socket.emit('returnGameStart',false);
        }
    })

    //引数：{
    //  playerId:プレイヤーID,
    //  pos:座標
    //}
    //戻り値：なし
    //説明：プレイヤーの移動を行う
    socket.on('changePos', (data) => {
        // console.log(data)
        Rooms[data.roomId].game.setPos({
            playerId: data.playerId,
            pos: data.pos,
        });
        console.log(`${Players[data.playerId].name} move to ${data.pos.x},${data.pos.y}`)
    })
});

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

//WU0lTD0AW2