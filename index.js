var express = require("express");
var app = express();
const http = require('http').Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + '/public'));
function onConnection(socket) {
    socket.on('create', (room) => {
        socket.join(room);
        console.log("Joined room" + __dirname);
        app.get('/game', function (req, res) {
            console.log("Routing into the game");

            res.sendFile(__dirname + '/public/game.html');
        });
    });
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data);
    });
}
io.on('connection', onConnection);
const port = process.env.PORT || 80;
http.listen(port, () => { console.log('Listening at' + port) });