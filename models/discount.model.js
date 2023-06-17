const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
        vendorId: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
        },
        category: {
                type: mongoose.Schema.ObjectId,
                ref: "Category",
        },
        productId: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
        },
        discountPrice: {
                type: Number,
        },
        minOrder: {
                type: Number,
        },
        expireDate: {
                type: Date,
        },
        toTime: {
                type: String,
        },
        fromTime: {
                type: String,
        },
        typeofCustomer: {
                type: String,
                enum: ["ALL", "First Time"]
        },
        type: {
                type: String,
                enum: ["Product", "Category","ALL"]
        },
        createdAt: {
                type: Date,
                default: Date.now,
        },
});

module.exports = mongoose.model("discount", productSchema);
