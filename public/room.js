var socket = io();
var room = "";
var name = "";

const { username, roomname } = Qs.parse(window.location.search, {
    ignoreQueryPrefix: true
});
console.log(username + " " + roomname, + " are used");
socket.emit('joinRoom', { username, roomname });

socket.on('message', message => {
    console.log(message);
});
socket.on('roomUsers', ({ room, users }) => {
    console.log(room);
    console.log(users);
});
