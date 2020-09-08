
const User = require('../model/Users');
async function userJoin(id, username, roomname) {

    let user = new User({
        userId: id,
        userName: username,
        roomName: roomname
    });
    await user.save();



    console.log(user);

    console.log("inside userJoin");
    return user;
}

async function getCurrentUser(id) {
    const user = await User.findOne({ userId: id });
    return user;
}

// User leaves chat
async function userLeave(id) {

    let deleteduser = await User.findOneAndDelete({ userId: id })
    console.log(deleteduser)
    return deleteduser;


}
async function addPoints(points, id) {
    let guessedUser = await User.findOne({ userId: id });
    guessedUser.points += points;
    await guessedUser.save();
    return guessedUser.points;
}

// Get room usersS
async function getRoomUsers(roomname) {

    return await User.find({ roomName: roomname });
}
module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    addPoints
};
