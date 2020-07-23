var canvas = document.getElementById("myCanvas");
var sendButton = document.getElementById('send');
sendButton.addEventListener("click", function (event) {
    event.preventDefault();
})
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


let permit = false;

// Obtaining the room name and the user name
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

//Joining the room 
socket.emit('joinRoom', { username, roomname });

//Sending the message to the room
function sendMsg() {
    var msg = document.getElementById('message');
    console.log(msg.value);
    var message = msg.value;
    socket.emit('chat', { message, username });



}


//Mesaage from the sever when someone joins or leaves
socket.on('message', message => {
    console.log(message);
    displayMessage("Skribble bot", message);
    chat.scrollTop = chat.scrollHeight;
});
socket.on("clear", (data) => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle.fillStyle = color;
});

//Message from the server giving the details about the room and the users
socket.on('roomUsers', ({ room, users }) => {
    console.log(room);
    console.log(users);
});
// Giving one user at a time the permission to draw
socket.on('permit', (data) => {
    if (socket.id == data.currentUser.id) {
        permit = true
        displayMessage("Skribble bot", "You are drawing");
        displayMessage("Skribble bot", "The word is " + data.currentWord);

    }
    else {
        permit = false;
        displayMessage("Skribble bot", data.currentUser.username + " is drawing");

    }
});
//Giving the data when someone draws
socket.on('drawing', otherDraws);
socket.on('chat', message => {
    console.log("Message sent by " + message.username + ": " + message.message);
    displayMessage(message.username, message.message);
});

//Adding different events for the mouse inside the canvas
canvas.addEventListener("mousemove", onMouseDrag, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseout", onMouseUp, false);

// Checking for authority to draw


//To update the color of the brush inside the canvas 
function colorUpdate(event) {
    current.color = event.target.id;
    console.log(`Changing color to ${current.color}`);
    if (current.color == 'white') {
        current.width = 10;
    }
    else
        current.width = 2;
}

//To draw a line between two points
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

//When the mouse is not clicked
function onMouseUp() {
    if (drawing)
        drawing = false;
    return;
}

//When mouse is clicked
function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;

}

//When mouse is moved
function onMouseDrag(e) {
    if (!drawing || !permit) return;
    else {
        draw(current.x, current.y, e.clientX, e.clientY, current.color, true, current.width, current.cap);
        current.x = e.clientX;
        current.y = e.clientY;
    }


}

//When someone else draws
function otherDraws(data) {
    draw(data.a, data.b, data.c, data.d, data.color, false, data.width, data.cap);
}
// Displaying the message and deciding it's style based on the sender

function displayMessage(username, message) {
    const div = document.createElement("div");
    if (username == "Skribble bot") {
        div.classList.add("bot-message");
        div.innerHTML = `${message}`;
    }
    else {
        div.classList.add("message-box");
        div.innerHTML = `<span class="name">${username}</span> ${message}`;
    }
    document.getElementById("chat").appendChild(div);
} 
