const mongoose = require("mongoose");
const schema = mongoose.Schema;
const DocumentSchema = schema({
  orderId: {
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
  gst: {
    type: Number,
  },
  cGst: {
    type: Number,
  },
  sGst: {
    type: Number,
  },
  total: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  address: {
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
  },
  userPhone: {
    type: String,
  },
  pickUpaddress: {
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
  },
  pickUpInstruction: {
    type: String,
  },
  deliveryInstruction: {
    type: String,
  },
  courierWithBag: {
    type: Boolean,
    default: false
  },
  notificationRecipent: {
    type: Boolean,
    default: false
  },
  discountId: {
    type: schema.Types.ObjectId,
    ref: "discount"
  },
  parcelValue: {
    type: Number,
    default: 0
  },
  yourPhone: {
    type: String,
  },
  vendorPhone: {
    type: String,
  },
  sending: {
    type: String,
  },
  orderStatus: {
    type: String,
    enum: ["unconfirmed", "confirmed"],
    default: "unconfirmed",
  },
  returnStatus: {
    type: String,
    enum: ["return", "cancel", ""],
    default: ""
  },
  returnOrder: {
    type: schema.Types.ObjectId,
    ref: "cancelReturnOrder",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  orderType: {
    type: String,
    enum: ["Package", "Other"],
    default: "Other"
  },
  preparingStatus: {
    type: String,
    enum: ["New", "Preparing", "Ready", "out_for_delivery", "delivered", ""],
    default: "New"
  },
  deliveryStatus: {
    type: String,
    enum: ["assigned", "out_for_delivery", "delivered", ""],
    default: ""
  },
}, { timestamps: true })
module.exports = mongoose.model("Order", DocumentSchema);