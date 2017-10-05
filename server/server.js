const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.app_port || 80;

app.get(`/`, (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('echo',(msg)=>{
	console.log(msg);
  })
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

//WU0lTD0AW2