const mongoose = require("mongoose");
const schema = mongoose.Schema;
const DocumentSchema = schema({
        driverId: {
                type: schema.Types.ObjectId,
                ref: "user",
        },
        Orders: {
                type: schema.Types.ObjectId,
                ref: "deliveryOrder",
        },
        amount: {
                type: Number,
                default: 0,
        },
}, { timestamps: true })
module.exports = mongoose.model("driverEarning", DocumentSchema);