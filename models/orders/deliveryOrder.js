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
  deliveryStatus: {
    type: String,
    enum: ["assigned", "out_for_delivery", "delivered"],
  },
}, { timestamps: true })
module.exports = mongoose.model("deliveryOrder", DocumentSchema);