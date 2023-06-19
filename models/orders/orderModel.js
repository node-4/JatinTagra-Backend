const mongoose = require("mongoose");
const schema = mongoose.Schema;
const DocumentSchema = schema({
  orderId:{
    type: String
  },
  userId: {
    type: schema.Types.ObjectId,
    ref: "user"
  },
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
  paidAmount: {
    type: Number,
    default: 0
  },
  orderStatus: {
    type: String,
    enum: ["unconfirmed", "confirmed"],
    default: "unconfirmed",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  preparingStatus: {
    type: String,
    enum: ["New", "Preparing", "Ready", "out_for_delivery", "delivered", ""],
    default: ""
  },
  deliveryStatus: {
    type: String,
    enum: ["signed", "out_for_delivery", "delivered", ""],
    default: ""
  },
}, { timestamps: true })
module.exports = mongoose.model("Order", DocumentSchema);