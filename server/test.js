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
console.log(listener)
listener.emit('setPos',{
	pos:{
		x:15,
		y:2
	},
	player:0,
})

listener.emit('setOthello',{
	pos:{
		x:0,
		y:0
	},
	color:0
})
