var socket = io();
function joinRoom() {
    var name = document.getElementById('myName');
    var id = document.getElementById('myId');
    console.log(id.value + " " + name.value);
    socket.emit('create', id);

}