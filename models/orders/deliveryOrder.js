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
  date: {
    type: String,
  },
  Orders: {
    type: schema.Types.ObjectId,
    ref: "Order",
  },
  OrderStatus: {
    type: String,
    enum: ["ACCEPT", "PENDING"],
  },
  orderType: {
    type: String,
    enum: ["Package", "Other"],
    default: "Other"
  },
  deliveryStatus: {
    type: String,
    enum: ["assigned", "out_for_delivery", "delivered"],
  },
}, { timestamps: true })
module.exports = mongoose.model("deliveryOrder", DocumentSchema);