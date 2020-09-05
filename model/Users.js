const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true

    },
    roomName: {
        type: String,
        required: true

    },
    userName: {
        type: String,
        required: true

    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    points: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('User', UserSchema);