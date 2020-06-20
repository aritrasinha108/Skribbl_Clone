var socket = io();
var room = "";
var name = "";

// const { username, roomname } = Qs.parse(window.location.search, {
//     ignoreQueryPrefix: true
// });
var queryObjects = window.location.href.split('?')[1];
console.log(queryObjects);
var params = queryObjects.split('&');
var details = [];

params.forEach(element => {
    details.push(element.split("=")[1]);
});
console.log(details);
var username = details[0];
var roomname = details[1];
console.log(details[0] + " " + details[1], + " are used");
socket.emit('joinRoom', { username, roomname });

socket.on('message', message => {
    console.log(message);
});
socket.on('roomUsers', ({ room, users }) => {
    console.log(room);
    console.log(users);
});