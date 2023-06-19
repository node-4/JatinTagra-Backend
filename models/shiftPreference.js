const mongoose = require('mongoose');
const preference = mongoose.Schema({
    toAmount: {
        type: String,
    },
    fromAmount: {
        type: String
    },
    hours: {
        type: String
    },
    salaryPer: {
        type: String,
        enum: ["Month", "Week"],
    },
    dayType: {
        type: String,
        enum: ["Daily", "Weekly"],
    },
    type: {
        type: String,
        enum: ["Full Time", "Part Time"],
    },
})
module.exports = mongoose.model('shiftPreference', preference);