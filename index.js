const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utilities/users.js');

app.use(express.static(__dirname + '/public'));

function onConnection(socket) {
    socket.on("joinRoom", ({ username, roomname }) => {
        const user = userJoin(socket.id, username, roomname);

        socket.join(roomname);
        //Welcoming the user that joined
        socket.emit("message", `Welcome to the room: ${roomname}`);

        //Notifying others in the room
        socket.broadcast.to(roomname).emit("message", `${username} has joined the room`);



        socket.on("drawing", (data) => {
            console.log(username + " is derawing");
            socket.broadcast.to(roomname).emit('drawing', data);
        });
        // Send users and room info
        io.to(roomname).emit('roomUsers', {
            room: roomname,
            users: getRoomUsers(roomname)
        });
    });





    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.roomname).emit(
                'message',
                `${user.username} has left the room`
            );

            // Send users and room info
            io.to(user.roomname).emit('roomUsers', {
                room: user.roomname,
                users: getRoomUsers(user.roomname)
            });
        }
    });



}


io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));