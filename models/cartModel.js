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
                discountPrice: {
                        type: Number,
                        default: 0
                },
                total: {
                        type: Number,
                        default: 0
                },
        }],
        totalAmount: {
                type: Number,
                default: 0
        },
        discountPrice: {
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