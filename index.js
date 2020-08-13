// Setup and declarations
let words = ["boy", "girl", "cup", "glass", "water", "apple", "steve jobs", "communism", "stab", "julius caesar", "big ben"];
let currentWord = words[2];
var currentDrawing = 0;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
const mongoURI = require('./config/keys').mongoURI;
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utilities/users.js');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(() => {
    console.log('mongoDB connected....');
})
    .catch(err => {
        throw err;
    })

app.use(express.static(__dirname + '/public'));
// Changing the word
function changeWord() {
    var index = Math.floor(Math.random() * words.length);
    currentWord = words[index];
}


async function onConnection(socket) {

    socket.on("joinRoom", async ({ username, roomname }) => {
        const user = await userJoin(socket.id, username, roomname);
        let roomPlayers = await getRoomUsers(roomname);
        let currentUser = roomPlayers[currentDrawing];
        console.log('Drawing: ' + currentUser);
        socket.join(roomname);
        //Welcoming the user that joined

        socket.emit("message", `Welcome to the room: ${roomname}`);

        socket.emit('permit', { currentUser, currentWord });

        //Notifying others in the room
        socket.broadcast.to(roomname).emit("message", `${username} has joined the room`);


        //Details about the drawing
        socket.on("drawing", (data) => {
            // console.log(username + " is derawing");
            socket.broadcast.to(roomname).emit('drawing', data);
        });
        //Details about the message sent by user
        socket.on("chat", async (message) => {
            roomPlayers = await getRoomUsers(roomname);
            let current = roomPlayers[currentDrawing];
            // If the message sent is same as the word
            if (message.message.toUpperCase() == currentWord.toUpperCase() && message.username != current.userName) {
                io.to(roomname).emit("clear", true);
                message.message = `${message.username} has guessed the word`;
                message.username = "Skribble bot"
                io.to(roomname).emit('chat', message);
                // Changing the word
                changeWord();
                console.log(currentWord);
                // Changing the user who is drawing
                var users = await getRoomUsers(roomname);
                if (currentDrawing == users.length - 1) {
                    currentDrawing = 0;
                }
                else {
                    currentDrawing++;
                }
                let currentUser = users[currentDrawing];
                console.log('Drawing: ' + currentUser);
                io.to(roomname).emit('permit', { currentUser, currentWord });



            }
            // If the message sent is just a chat message
            else {
                io.to(roomname).emit('chat', message);
            }



        });
        // Send users and room info
        let roomUsers = await getRoomUsers(user.roomName);

        io.to(roomname).emit('roomUsers', {
            room: roomname,
            users: roomUsers
        });

    });





    socket.on('disconnect', async () => {
        const user = await userLeave(socket.id);
        console.log(user + " left");
        if (user) {
            io.to(user.roomName).emit(
                'message',
                `${user.userName} has left the room`
            );

            // Send users and room info
            let roomUsers = await getRoomUsers(user.roomName);
            io.to(user.roomName).emit('roomUsers', {
                room: user.roomName,
                users: roomUsers
            });
        }
    });



}


io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

