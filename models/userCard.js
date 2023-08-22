const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    name: {
        type: String,
    },
    number: {
        type: String,
    },
    month: {
        type: String,
    },
    year: {
        type: String,
    },
    cvv: {
        type: String,
    },
    cardType: {
        type: String,
        enum: ["Debit", "Credit"],
    },
});

const banner = mongoose.model("card", Schema);

module.exports = banner;
