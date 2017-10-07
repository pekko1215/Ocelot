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
        this[key] = this.option[key] || define[key];
    })
}

Room.prototype.setGame = function(game){
	this.game = game;
}

function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}
