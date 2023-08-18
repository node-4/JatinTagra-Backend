const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const productSchema = mongoose.Schema({
        vendorId: {
                type: mongoose.Schema.ObjectId,
                ref: "user",
        },
        category: {
                type: mongoose.Schema.ObjectId,
                ref: "Category",
        },
        vegNonVeg: {
                type: String,
                enum: ["Veg", "NonVeg", "Egg"],
        },
        status: {
                type: String,
                enum: ["Approved", "Reject", "Pending"],
                default: "Pending"
        },
        available: {
                type: Boolean,
                default: true
        },
        name: {
                type: String,
        },
        description: {
                type: String,
        },
        price: {
                type: Number,
        },
        packageCharges: {
                type: Number,
        },
        gst: {
                type: Number,
        },
        cGst: {
                type: Number,
        },
        sGst: {
                type: Number,
        },
        ratings: {
                type: Number,
                default: 0,
        },
        images: [{ img: { type: String } }],
        Stock: {
                type: Number,
                default: 1,
        },
        numOfReviews: {
                type: Number,
                default: 0,
        },
        reviews: [
                {
                        user: {
                                type: mongoose.Schema.ObjectId,
                                ref: "user",
                        },
                        name: {
                                type: String,
                        },
                        rating: {
                                type: Number,
                        },
                        comment: {
                                type: String,
                        },
                },
        ],
        createdAt: {
                type: Date,
                default: Date.now,
        },
});

productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("Product", productSchema);
