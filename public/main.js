

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

ctx.fillStyle = "#0000007d";
ctx.strokeStyle = "white";

ctx.fillRect(0, 0, canvas.width, canvas.height);
var drawing = false;
var socket = io();

ctx.lineWidth = 5;
var current = {
    color: 'dark-black'
};


canvas.addEventListener("mousemove", onMouseDrag, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseout", onMouseUp, false);
socket.on('drawing', otherDraws);


function colorUpdate(color) {
    current.color = color
    console.log(`Changing color to ${color}`);
}

function draw(a, b, c, d, color = current.color, emit) {
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.strokeStyle = color;
    ctx.stroke();

    if (!emit)
        return;
    socket.emit('drawing', {
        a: a, //Initial x
        b: b, //Initial y
        c: c, //Final x
        d: d,  //Final y
        color: current.color
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
        draw(current.x, current.y, e.clientX, e.clientY, true);
        current.x = e.clientX;
        current.y = e.clientY;
    }


}
function otherDraws(data) {
    draw(data.a, data.b, data.c, data.d, data.color, false);
}

