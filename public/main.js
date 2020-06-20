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


canvas.addEventListener("mousemove", onMouseDrag, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseout", onMouseUp, false);
// colors.addEventListener('click', colorUpdate(event));
socket.on('drawing', otherDraws);


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

