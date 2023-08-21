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
        subcategory: {
                type: mongoose.Schema.ObjectId,
                ref: "subcategory",
        },
        name: {
                type: String,
        },
        images: [{ img: { type: String } }],
        price: {
                type: Number,
        },
        discountPrice: {
                type: Number,
                default: 0
        },
        discount: {
                type: Number,
                default: 0
        },
        discountActive: {
                type: Boolean,
                default: false
        },
        quantity: {
                type: String,
        },
        size: {
                type: String,
        },
        description: {
                type: String,
        },
        nutirient: {
                type: String,
        },
        storageTips: {
                type: String,
        },
        manufactureDetails: {
                type: String,
        },
        available: {
                type: Boolean,
                default: true
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
        Stock: {
                type: Number,
                default: 1,
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
