var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var colors = document.getElementsByClassName('colorOptions');
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
var drawing = false;
var socket = io();
ctx.lineWidth = 5;
var current = {
    color: 'black',
    cap: 'round',
    width: 2
};
//Code for Room.js start



var queryObjects = window.location.href.split('?')[1];
// console.log(queryObjects);
var params = queryObjects.split('&');
var details = [];

params.forEach(element => {
    details.push(element.split("=")[1]);
});
// console.log(details);
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
socket.on('drawing', otherDraws);
//Code for room.js end






canvas.addEventListener("mousemove", onMouseDrag, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseout", onMouseUp, false);




function colorUpdate(event) {
    current.color = event.target.id;
    console.log(`Changing color to ${current.color}`);
    if (current.color == 'white') {
        current.width = 10;
    }
    else
        current.width = 2;
}

function draw(a, b, c, d, color = current.color, emit, lineWidth = current.width, lineCap = current.cap) {
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;

    ctx.stroke();

    if (!emit)
        return;
    socket.emit('drawing', {
        a: a, //Initial x
        b: b, //Initial y
        c: c, //Final x
        d: d,  //Final y
        color: color,
        width: lineWidth,
        cap: lineCap
    });
}
function onMouseUp() {
    if (drawing)
        drawing = false;
    return;
}
function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;

}
function onMouseDrag(e) {
    if (!drawing) return;
    else {
        draw(current.x, current.y, e.clientX, e.clientY, current.color, true, current.width, current.cap);
        current.x = e.clientX;
        current.y = e.clientY;
    }


}
function otherDraws(data) {
    draw(data.a, data.b, data.c, data.d, data.color, false, data.width, data.cap);
}



