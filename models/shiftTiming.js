const mongoose = require('mongoose');
const shiftTiming = mongoose.Schema({
    to: {
        type: String,
    },
    from: {
        type: String
    },
    type: {
        type: String,
    },
})
module.exports = mongoose.model('shiftTiming', shiftTiming);