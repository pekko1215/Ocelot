var io = require('socket.io-client');
var url = "localhost";
var options = {
    port: 3000
};

var socket = io.connect(url, options);
socket.on('connection', function(data) {
	socket.emit('echo',"test");
	socket.on('echo',console.log);
});
console.log(socket)