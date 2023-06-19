const mongoose = require("mongoose");
const schema = mongoose.Schema;
const DocumentSchema = schema({
  userId: {
    type: schema.Types.ObjectId,
    ref: "user"
  },
  driverId: {
    type: schema.Types.ObjectId,
    ref: "user",
  },
  Orders: [{
    type: schema.Types.ObjectId,
    ref: "Order",
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
  paid: {
    type: String,
    enum: ["online", "cash"]
  },
  address: {
    street1: {
      type: String,
    },
    street2: {
      type: String
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String
    }
  },
  deliveryStatus: {
    type: String,
    enum: ["signed", "out_for_delivery", "delivered"],
  },
}, { timestamps: true })
module.exports = mongoose.model("deliveryOrder", DocumentSchema);