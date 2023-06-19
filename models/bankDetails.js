const mongoose = require("mongoose");
const vendorDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bankName: {
        type: String,
    },
    accountNumber: {
        type: String,
    },
    holderName: {
        type: String,
    },
    ifsc: {
        type: String,
    },
    panCard: {
        type: String,
    },
    drivingLicense: {
        type: String,
    },
    passbook: {
        type: String,
    },
    aadharCard: {
        type: String,
    },
});

module.exports = mongoose.model("bankDetails", vendorDetailsSchema);
