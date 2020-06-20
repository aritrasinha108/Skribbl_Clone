var users = [];
function userJoin(id, username, roomname) {
    var user = { id, username, roomname };
    users.push(user);
    console.log(user);

    console.log("inside userJoin");
    return user;
}
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(roomname) {
    return users.filter(user => user.roomname === roomname);
}
module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
};
