const mongoose = require("mongoose");
const vendorDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    vendorType: {
        type: String,
    },
    gstNo: {
        type: String,
    },
    fssaiNo: {
        type: String,
    },
    fssaiLicense: {
        type: String,
    },
    aadhar: {
        type: String,
    },
    storeName: {
        type: String,
    },
    storeAddress: {
        type: String,
    },
    pinCode: {
        type: String,
    },
    storeImage: {
        type: Array,
    },
    openingTime: {
        type: String,
    },
    closingTime: {
        type: String,
    },
    operatingHour: {
        type: String,
    },
    preparingTime: {
        type: String,
    },
    categoryProduct: {
        type: Array,
        ref: "Category"
    },
    status: {
        type: String,
        enum: ["Approved", "Reject", "Pending"],
        default: "Pending"
    },
});

module.exports = mongoose.model("vendorDetails", vendorDetailsSchema);
