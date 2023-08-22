const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = schema({
        userId: {
                type: schema.Types.ObjectId,
                ref: "user"
        },
        products: [{
                vendorId: {
                        type: schema.Types.ObjectId,
                        ref: "user",
                },
                category: {
                        type: schema.Types.ObjectId,
                        ref: "Category",
                },
                productId: {
                        type: schema.Types.ObjectId,
                        ref: "Product"
                },
                discountId: {
                        type: schema.Types.ObjectId,
                        ref: "discount"
                },
                productPrice: {
                        type: Number
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
                quantity: {
                        type: Number,
                        default: 1
                },
                discount: {
                        type: Number,
                        default: 0
                },
                total: {
                        type: Number,
                        default: 0
                },
        }],
        houseFlat: {
                type: String,
        },
        appartment: {
                type: String,
        },
        landMark: {
                type: String,
        },
        houseType: {
                type: String,
                enum: ["home", "office", "Other"],
        },
        totalAmount: {
                type: Number,
                default: 0
        },
        discount: {
                type: Number,
                default: 0
        },
        shipping: {
                type: Number,
                default: 0
        },
        tax: {
                type: Number,
                default: 0
        },
        paidAmount: {
                type: Number,
                default: 0
        },
        totalItem: {
                type: Number
        },
}, { timestamps: true })
module.exports = mongoose.model("cart", DocumentSchema);