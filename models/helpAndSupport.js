const mongoose = require('mongoose');
const helpandSupport = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
    },
    name: {
        type: String,
    },
    email: {
        type: String
    },
    mobile: {
        type: Number
    },
    query: {
        type: String
    }
})
const help = mongoose.model('help&support', helpandSupport);
module.exports = help