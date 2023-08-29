const mongoose = require("mongoose");
const subscriptionSchema = mongoose.Schema({
        name: {
                type: String,
        },
        month: {
                type: Number
        },
        price: {
                type: Number
        },
        totalAmount: {
                type: Number
        },
        discount: {
                type: Number
        },
}, { timestamps: true });
module.exports = mongoose.model("subscription", subscriptionSchema);