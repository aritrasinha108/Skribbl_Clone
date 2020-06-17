var express = require("express");
var app = express();
const http = require('http').Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + '/public'));
function onConnection(socket) {
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data);
    });
}
io.on('connection', onConnection);
const port = process.env.PORT || 80;
http.listen(port, () => { console.log('Listening at' + port) });