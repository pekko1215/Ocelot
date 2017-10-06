## Socket.ioのイベント
### 登録系
#####プレイヤーの登録
***createPlayer***  
プレイヤーを登録します。
```javascript
socket.emit('createPlayer',{
	name:"ユーザ名",
});
```
動作が完了すると***returnPlayer***イベントが発生します。
playerIdがemitされます
```javascript
socket.on('returnPlayer',(userId)=>{
	console.log(userId);
})
```
---
***createRoom***  
ルームを登録します。
```javascript
	socket.emit('createRoom',{
		name:"ルーム名",
		createBy:"作成者のユーザID",
		option:{ //オプション
			hidden:true //ルーム一覧に表示するか
		}
	})
```

動作が完了すると***returnRoom***イベントが発生します。
roomIdがemitされます
```javascript
socket.on('returnRoom',(userId)=>{
	console.log(userId);
})
```
---