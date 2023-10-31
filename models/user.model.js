const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
    {
        fullName: {
            type: String,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        language: {
            type: String,
        },
        image: {
            type: String,
        },
        gender: {
            type: String,
        },
        phone: {
            type: String,
        },
        email: {
            type: String,
            minLength: 10,
        },
        password: {
            type: String,
        },
        city: {
            type: String,
        },
        country: {
            type: String,
        },
        state: {
            type: String,
        },
        district: {
            type: String,
        },
        pincode: {
            type: Number,
        },
        otp: {
            type: String,
        },
        otpExpiration: {
            type: Date,
        },
        accountVerification: {
            type: Boolean,
            default: false,
        },
        shopOpen: {
            type: Boolean,
            default: false,
        },
        shiftTiming: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "shiftTiming"
        },
        shiftPreference: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "shiftPreference"
        },
        preferedArea: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "preferedArea"
        },
        userType: {
            type: String,
            enum: ["USER", "VENDOR", "DRIVER", "ADMIN"],
        },
        status: {
            type: String,
            enum: ["Approved", "Reject", "Pending"],
        },
        numOfReviews: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: "user",
                },
                name: {
                    type: String,
                },
                rating: {
                    type: Number,
                },
                comment: {
                    type: String,
                },
            },
        ],
        wallet: {
            type: Number,
            default: 0,
        },
        bonus: {
            type: Number,
            default: 0,
        },
        floatingCash: {
            type: Number,
            default: 0,
        },
        currentLocation: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            },
        },
        isAdminVerify: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);
