const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Game = require('./Game');

const PORT = process.env.app_port || 80;

app.get(`/`, (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var Games = [];

io.on('connection', (socket) => {

});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

//WU0lTD0AW2