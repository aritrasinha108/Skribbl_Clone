var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#ffffff7d";
ctx.fillRect(0, 0, canvas.width, canvas.height);
var drawing = false;

ctx.addEventListener("mouseMove", onMouseDrag, false);
ctx.addEventListener("mouseUp", onMouseUp, false);
ctx.addEventListener("mouseDown", onMouseDown, false);
