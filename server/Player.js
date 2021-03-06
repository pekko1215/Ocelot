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
		},
		id:getUniqueStr()
	}

	Object.keys(define).forEach((key)=>{
		this[key] = this.option[key]||define[key];
	})
}

function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}