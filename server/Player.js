/*
Playerが持っておくべき情報
name:名前
pos:座標
color:色
 */

module.exports = function Player(option){
	option = option || {};
	this.option = option;

	var define = {
		color:Math.floor(Math.random()*0xffffff),
		name:'No_Name',
		pos:{
			x:0,
			y:0
		}
	}

	Object.keys(define).forEach((key)=>{
		this[key] = this.option[key]||define[key];
	})
}