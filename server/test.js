const Game = require('./Game');
const Player = require('./Player');

var players = [
new Player({
	name:"hidehohi"
}),
new Player({
	name:"pekko1215"
})]

var game = new Game({
	bordSize:15
})

players.forEach(player=>{
	game.addPlayer(player);
})

var listener = game.GameStart();
listener.emit('setPos',{
	pos:{
		x:15,
		y:2
	},
	player:0,
})

listener.emit('setOthello',{
	pos:{
		x:1,
		y:0
	},
	color:0
})
listener.emit('setOthello',{
	pos:{
		x:2,
		y:0
	},
	color:0
})
listener.emit('setOthello',{
	pos:{
		x:3,
		y:0
	},
	color:0
})

listener.emit('setOthello',{
	pos:{
		x:4,
		y:0
	},
	color:2
})

listener.emit('setOthello',{
	pos:{
		x:0,
		y:0
	},
	color:2
})
console.log(game)
