// Setup and declarations
let words = ["boy", "girl", "cup", "glass", "water", "apple", "steve jobs", "communism", "stab", "julius caesar", "big ben"];
let currentWord = words[2];
var currentDrawing = 0;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const mongoURI = require('./config/keys').mongoURI;
const fs=require('fs');
var guessedUsers = [];
app.set('view engine','ejs');
var startTime;
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    addPoints
} = require('./utilities/users.js');
let rounds = 1;

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(() => {
    console.log('mongoDB connected....');
})
    .catch(err => {
        throw err;
    })


app.use(express.urlencoded({extended:false}));    
app.use(express.static('./public'));


let username="";
let roomname="";
app.get('/',(req,res)=>{
    res.render('index');
})
app.get('/canvas/:name&:room',(req,res)=>{
   res.render('game');
});

app.post('/',(req,res)=>{
    console.log(req.body);
    username=req.body.myName;
    roomname=req.body.roomId;
    console.log("inside the post request");
    res.redirect(`/canvas/${username}&${roomname}`);

});
app.get('/results/:roomname',async (req,res)=>{

    let users= await getRoomUsers(req.params.roomname);

    res.render('result',{users:users});


})

// Changing the word
function changeWord() {
    var index = Math.floor(Math.random() * words.length);
    currentWord = words[index];
}
async function changeUser(length, a, room) {

    if (currentDrawing >= length - 1) {
        if (rounds > 1) {
            currentDrawing = 0;
            rounds--;
            console.log("round:" + rounds);
        }
        else {
            let roomPLayers = await getRoomUsers(room);
            io.to(room).emit('results', roomPLayers);
            console.log("Game Over");


        }
    }
    else {
        if (a == 1)
            currentDrawing++;
    }



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
        if (currentUser.userId != socket.id && typeof startTime != 'undefined') {
            socket.emit('start time', startTime);
        }
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
            if (message.message.toUpperCase() == currentWord.toUpperCase() && message.username != current.userName && guessedUsers.find(p => p == message.userName) == null) {
                // io.to(roomname).emit("clear", true);
                guessedUsers.push(message.userName);
                var now = new Date();

                var seconds = 30 - Math.round((now - startTime) / 1000);
                addPoints(seconds, socket.id);
                message.message = `${message.username} has guessed the word`;
                message.username = "Skribble bot"
                io.to(roomname).emit('chat', message);
                roomPlayers = await getRoomUsers(roomname);
                
            }
            // If the message sent is just a chat message
            else {
                io.to(roomname).emit('chat', message);
            }



        });
        socket.on('change', async (time) => {
            // Changing the word
            guessedUsers = [];
            changeWord();
            console.log(currentWord);
            // guessedUsers = [];
            // Changing the user who is drawing
            var users = await getRoomUsers(roomname);

            changeUser(users.length, 1, roomname);
            let currentUser = users[currentDrawing];
            console.log('Drawing: ' + currentUser);
            io.to(roomname).emit('permit', { currentUser, currentWord });
            io.to(roomname).emit('clear', 0);
            // socket.emit('permit', { currentUser, currentWord });
        });
        // Send users and room info
        let roomUsers = await getRoomUsers(user.roomName);

        io.to(roomname).emit('roomUsers', {
            room: roomname,
            users: roomUsers
        });
        socket.on('start', (time) => {
            startTime = new Date(time);
            console.log(time);
            var then = new Date(time);
            socket.broadcast.to(roomname).emit('start time', then);
        })

    });





    socket.on('disconnect', async () => {
        const leftUser = await getCurrentUser(socket.id);
        let thenUsers = await getRoomUsers(leftUser.roomName);
        const user = await userLeave(socket.id);
        let index = thenUsers.findIndex(u => u.userId == leftUser.userId);

        console.log(index);
        console.log(currentDrawing);
        let roomUsers = await getRoomUsers(user.roomName);

        if (index == currentDrawing) {

            changeUser(roomUsers.length, 0, user.roomName);

            console.log(currentDrawing);
            let currentUser = roomUsers[currentDrawing];
            console.log("changed:" + currentUser);

            changeWord();
            guessedUsers = [];
            io.to(leftUser.roomName).emit('permit', { currentUser, currentWord });
            io.to(leftUser.roomName).emit('clear', 0);
        }


        console.log(user + " left");
        if (user) {
            io.to(user.roomName).emit(
                'message',
                `${user.userName} has left the room`
            );

            // Send users and room info

            io.to(user.roomName).emit('roomUsers', {
                room: user.roomName,
                users: roomUsers
            });

        }
    });



}


io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

