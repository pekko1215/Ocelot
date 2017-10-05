var EventEmitter = require('events').EventEmitter;

module.exports = Game = function(option) {
    option = option || {};
    this.option = option;
    var define = {}

    Object.keys(define).forEach((key) => {
        this[key] = this.option[key] || define[key];
    })
    this.status = 'wait';
    this.bord = JSON.parse(JSON.stringify(Array(option.bordSize).fill(Array(option.bordSize).fill(-1))));
    this.players = [];
    this.bordSize = option.bordSize
}

Game.prototype.addPlayer = function(player) {
    while (this.players.find((p) => {
            return p.color === player.color;
        }))
        player.color = Math.floor(Math.random() * 0xffffff);
    this.players.push(player);
    return player
};

Game.prototype.getPlayers = function() {
    return this.players;
}

Game.prototype.GameStart = function() {
    if (this.status !== "wait") { return false; }
    if (this.players.length === 0) { return false; }
    var emitter = new EventEmitter;

    emitter.on('setPos',(e)=>this.setPos(e))
    emitter.on('setOthello', (e)=>this.setOthello(e))

    this.emitter = emitter;
    return emitter;
}


Game.prototype.setPos = function(e) {
    this.players[e.player].pos = e.pos;
}

Game.prototype.setOthello = function(e){
	e.pos.y = [e.pos.x,e.pos.x = e.pos.y][0];
	this.bord[e.pos.x][e.pos.y] = e.color;
	this.reverse({
		pos:e.pos,
		color:e.color,
		bordSize:this.bordSize
	})
}

Game.prototype.reverse = function(e){
	var bordSize = this.bordSize
	for(var x=-1;x<=1;x++){
		for(var y=-1;y<=1;y++){
			if(x==0&&y==0){continue}
			(function(obj){
				if( (obj.pos.x+obj.def.x)<0||
					(obj.pos.y+obj.def.y)<0||
					(obj.pos.x+obj.def.x)>=bordSize||
					(obj.pos.y+obj.def.y)>=bordSize){return false}
				switch(obj.bord[obj.pos.x+obj.def.x][obj.pos.y+obj.def.y]){
					case -1:
						return false;
					break;
					case obj.color:
						return true;
					break;
					default:
						if(arguments.callee({
							pos:{
								x:obj.pos.x+obj.def.x,
								y:obj.pos.y+obj.def.y
							},
							def:obj.def,
							bord:obj.bord,
							color:e.color
						})){
							obj.bord[obj.pos.x+obj.def.x][obj.pos.y+obj.def.y] = e.color;
							return true;
						};
						return false;
					break;
				}
			})({
				pos:e.pos,
				def:{x:x,y:y},
				bord:this.bord,
				color:e.color
			})
		}
	}
}