module.exports = Room = function Room(option) {
    option = option || {};

    var define = {
        id: getUniqueStr(),//識別UUID
        name: 'No_Name',//ルーム名
        createBy:null,//作成者のPlayerインスタンス
        option: { //オプション
            hidden: true //一覧に表示するか
        },
        isStarted:false,//ゲームがスタートしているか
        game:null
    }

    Object.keys(define).forEach((key) => {
        this[key] = option[key] || define[key];
    })
}

Room.prototype.setGame = function(game){
	this.game = game;
}

Room.prototype.toObject = function(){
    return {
        id:this.id,
        name:this.name,
        createBy:this.createBy.toObject(),
        isStarted:this.isStarted,
        game:this.game.toObject(),
        players:this.game.players.map((p)=>{
            return p.toObject()
        })
    }
}

Room.prototype.isAllPrepared = function(){
    return !this.game.players.some((p)=>{
        return !p.prepared
    })
}

function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}
