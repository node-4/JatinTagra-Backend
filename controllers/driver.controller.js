const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const Category = require("../models/CategoryModel");
const helpandSupport = require('../models/helpAndSupport');
const banner = require('../models/banner');
const vendorDetails = require("../models/vendorDetails");
const Product = require("../models/product.model");
const Discount = require("../models/discount.model");
const transaction = require('../models/transactionModel');
const Address = require("../models/AddressModel");
const bankDetails = require("../models/bankDetails");
const deliveryOrder = require("../models/orders/deliveryOrder");
const orderModel = require("../models/orders/orderModel");

exports.signInWithPhone = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "DRIVER" });
                if (!user) {
                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        req.body.accountVerification = false;
                        req.body.userType = "DRIVER";
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ message: "Registered successfully ", data: userCreate, });
                } else {
                        return res.status(409).send({ status: 409, msg: "Already Exit" });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.completeRegistration = async (req, res) => {
        try {
                let user = await User.findById({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ message: "Data not found", status: 404, data: [] });
                } else {
                        let data = {
                                shiftTiming: req.body.shiftTiming,
                                shiftPreference: req.body.shiftPreference,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                gender: req.body.gender,
                        };
                        let update = await User.findByIdAndUpdate({ _id: user._id }, { data }, { new: true });
                        if (update) {
                                const data1 = await Address.findById({ user: user._id });
                                if (data1) {
                                        let obj = {
                                                address: req.body.address,
                                                city: req.body.city,
                                                state: req.body.state,
                                                pinCode: req.body.pinCode,
                                                landMark: req.body.landMark,
                                                street: req.body.street,
                                                user: user._id
                                        }
                                        let update = await Address.findByIdAndUpdate(data1._id, obj, { new: true, });
                                } else {
                                        let obj = {
                                                address: req.body.address,
                                                city: req.body.city,
                                                state: req.body.state,
                                                pinCode: req.body.pinCode,
                                                landMark: req.body.landMark,
                                                street: req.body.street,
                                                user: user._id
                                        }
                                        const address = await Address.create(obj);
                                }
                                return res.status(200).send({ message: "Data update successfully", status: 200, data: update });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500 });
        }
};
exports.loginWithPhone = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "DRIVER" });
                if (!user) {
                        return res.status(400).send({ msg: "not found" });
                }
                const userObj = {};
                userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                userObj.accountVerification = false;
                const updated = await User.findOneAndUpdate({ phone: phone, userType: "DRIVER" }, userObj, { new: true, });
                return res.status(200).send({ userId: updated._id, otp: updated.otp });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.verifyOtp = async (req, res) => {
        try {
                const { otp } = req.body;
                const user = await User.findById(req.params.id);
                if (!user) {
                        return res.status(404).send({ message: "user not found" });
                }
                if (user.otp !== otp || user.otpExpiration < Date.now()) {
                        return res.status(400).json({ message: "Invalid OTP" });
                }
                const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
                const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                return res.status(200).send({ message: "logged in successfully", accessToken: accessToken, data: updated });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.resendOTP = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "DRIVER" });
                if (!user) {
                        return res.status(400).send({ message: "User not found" });
                }
                const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                const accountVerification = false;
                const updated = await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpiration, accountVerification }, { new: true });
                return res.status(200).send({ message: "OTP resent", otp: otp });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        return res.status(200).json({ status: 200, message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateBankDetails = async (req, res) => {
        try {
                let user = await User.findById({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ message: "Data not found", status: 404, data: [] });
                } else {
                        const data1 = await bankDetails.findById({ user: user._id });
                        if (data1) {
                                let obj = {
                                        bankName: req.body.bankName,
                                        accountNumber: req.body.accountNumber,
                                        holderName: req.body.holderName,
                                        ifsc: req.body.ifsc,
                                        user: user._id
                                }
                                let update = await bankDetails.findByIdAndUpdate(data1._id, obj, { new: true, });
                                return res.status(200).send({ message: "Data update successfully", status: 200, data: update });
                        } else {
                                let obj = {
                                        bankName: req.body.bankName,
                                        accountNumber: req.body.accountNumber,
                                        holderName: req.body.holderName,
                                        ifsc: req.body.ifsc,
                                        user: user._id
                                }
                                const address = await bankDetails.create(obj);
                                return res.status(200).send({ message: "Data saved successfully", status: 200, data: address });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500 });
        }
};
exports.updateDocument = async (req, res) => {
        try {
                let user = await User.findById({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ message: "Data not found", status: 404, data: [] });
                } else {
                        const data1 = await bankDetails.findOne({ user: user._id });
                        if (data1) {
                                if (req.files['panCard']) {
                                        let panCard = req.files['panCard'];
                                        req.body.panCard = panCard[0].path;
                                } else {
                                        req.body.panCard = findData.panCard
                                }
                                if (req.files['drivingLicense']) {
                                        let drivingLicense = req.files['drivingLicense'];
                                        req.body.drivingLicense = drivingLicense[0].path;
                                } else {
                                        req.body.drivingLicense = findData.drivingLicense
                                }
                                if (req.files['passbook']) {
                                        let passbook = req.files['passbook'];
                                        req.body.passbook = passbook[0].path;
                                } else {
                                        req.body.passbook = findData.passbook
                                }
                                if (req.files['aadharCard']) {
                                        let aadharCard = req.files['aadharCard'];
                                        req.body.aadharCard = aadharCard[0].path;
                                } else {
                                        req.body.aadharCard = findData.aadharCard
                                }
                                let obj = {
                                        panCard: req.body.panCard,
                                        drivingLicense: req.body.drivingLicense,
                                        passbook: req.body.passbook,
                                        aadharCard: req.body.aadharCard,
                                        user: user._id
                                }
                                let update = await bankDetails.findByIdAndUpdate(data1._id, obj, { new: true, });
                                return res.status(200).send({ message: "Data update successfully", status: 200, data: update });
                        } else {
                                if (req.files['panCard']) {
                                        let panCard = req.files['panCard'];
                                        req.body.panCard = panCard[0].path;
                                } else {
                                        req.body.panCard = findData.panCard
                                }
                                if (req.files['drivingLicense']) {
                                        let drivingLicense = req.files['drivingLicense'];
                                        req.body.drivingLicense = drivingLicense[0].path;
                                } else {
                                        req.body.drivingLicense = findData.drivingLicense
                                }
                                if (req.files['passbook']) {
                                        let passbook = req.files['passbook'];
                                        req.body.passbook = passbook[0].path;
                                } else {
                                        req.body.passbook = findData.passbook
                                }
                                if (req.files['aadharCard']) {
                                        let aadharCard = req.files['aadharCard'];
                                        req.body.aadharCard = aadharCard[0].path;
                                } else {
                                        req.body.aadharCard = findData.aadharCard
                                }
                                let obj = {
                                        panCard: req.body.panCard,
                                        drivingLicense: req.body.drivingLicense,
                                        passbook: req.body.passbook,
                                        aadharCard: req.body.aadharCard,
                                        user: user._id
                                }
                                const address = await bankDetails.create(obj);
                                return res.status(200).send({ message: "Data saved successfully", status: 200, data: address });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500 });
        }
};
exports.getOrders = async (req, res, next) => {
        try {
                const orders = await deliveryOrder.find({ driverId: req.user._id, orderType: "Other" }).populate('Orders userId');
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getPackageOrders = async (req, res, next) => {
        try {
                const orders = await deliveryOrder.find({ driverId: req.user._id, orderType: "Package" }).populate('Orders userId');
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateOrderStatus = async (req, res) => {
        try {
                const orders = await deliveryOrder.findById({ _id: req.params.id });
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                } else {
                        const update = await deliveryOrder.findByIdAndUpdate({ _id: orders._id }, { $set: { deliveryStatus: req.body.deliveryStatus } }, { new: true });
                        if (update) {
                                const update1 = await orderModel.findByIdAndUpdate({ _id: update.Orders }, { $set: { deliveryStatus: req.body.deliveryStatus } }, { new: true })
                                if (update1) {
                                        return res.status(200).json({ status: 200, msg: "orders status changed.", data: update })
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.driverUpdate = async (req, res) => {
        try {
                let user = await User.findById({ _id: req.user._id });
                if (!user) {
                        return res.status(404).send({ message: "Data not found", status: 404, data: [] });
                } else {
                        let update = await User.findByIdAndUpdate(user._id, { $set: req.body }, { new: true, });
                        return res.status(200).send({ message: "Data update successfully", status: 200, data: update });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500 });
        }
};