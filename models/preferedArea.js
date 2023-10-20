const mongoose = require('mongoose');
const preference = mongoose.Schema({
    toAmount: {
        type: String,
    },
    fromAmount: {
        type: String
    },
    area: {
        type: String
    },
    salaryPer: {
        type: String,
        enum: ["Month", "Week"],
    },
    km: {
        type: String,
    },
})
module.exports = mongoose.model('preferedArea', preference);