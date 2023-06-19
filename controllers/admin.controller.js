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
const Wishlist = require("../models/WishlistModel");
const Address = require("../models/AddressModel");
const userCard = require("../models/userCard");
const staticContent = require('../models/staticContent');
const Faq = require("../models/faq.Model");
const shiftPreference = require("../models/shiftPreference");
const shiftTiming = require("../models/shiftTiming");

exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "ADMIN" });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "ADMIN";
            req.body.accountVerification = true;
            const userCreate = await User.create(req.body);
            res.status(200).send({
                message: "registered successfully ",
                data: userCreate,
            });
        } else {
            res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, userType: "ADMIN" });
        if (!user) {
            return res
                .status(404)
                .send({ message: "user not found ! not registered" });
        }
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).send({ message: "Wrong password" });
        }
        const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });
        res.status(201).send({ data: user, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.update = async (req, res) => {
    try {
        const { fullName, firstName, lastName, email, phone, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.fullName = fullName || user.fullName;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.createCategory = async (req, res) => {
    try {
        let findCategory = await Category.findOne({ name: req.body.name });
        if (findCategory) {
            res.status(409).json({ message: "category already exit.", status: 404, data: {} });
        } else {
            const data = { name: req.body.name };
            const category = await Category.create(data);
            res.status(200).json({ message: "category add successfully.", status: 200, data: category });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getCategories = async (req, res) => {
    const categories = await Category.find({});
    res.status(201).json({ success: true, categories, });
};
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    }
    category.name = req.body.name;
    let update = await category.save();
    res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        await Category.findByIdAndDelete(category._id);
        res.status(200).json({ message: "Category Deleted Successfully !" });
    }
};
exports.AddBanner = async (req, res) => {
    try {
        const category = await Category.findById(req.body.categoryId);
        if (!category) {
            res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
        const data = { image: req.body.image, desc: req.body.desc, category: category._id }
        const Data = await banner.create(data);
        res.status(200).json({ status: 200, message: "Banner is Addded ", data: Data })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getBanner = async (req, res) => {
    try {
        const Banner = await banner.find();
        if (Banner.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        res.status(200).json({ status: 200, message: "All banner Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getBannerById = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        res.status(200).json({ status: 200, message: "Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteBanner = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await banner.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({ status: 200, message: "Banner delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteHelpandSupport = async (req, res) => {
    try {
        const findHelp = await helpandSupport.findById({ _id: req.params.id });
        if (!findHelp) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        } else {
            await helpandSupport.findOneAndDelete({ user: req.params.id })
            res.status(200).json({ status: 200, message: "Data delete successfully.", data: {} })
        }
    } catch (err) {
        res.status(501).send({ status: 501, message: "server error.", data: {} });
    }
};
exports.getAllHelpandSupport = async (req, res) => {
    try {
        const data = await helpandSupport.find();
        if (data.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        } else {
            res.status(200).json({ status: 200, message: "Data found successfully.", data: data })
        }
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {} });
    }
};
exports.AddShiftPreference = async (req, res) => {
    try {
        const data = { toAmount: req.body.toAmount, fromAmount: req.body.fromAmount, hours: req.body.hours, salaryPer: req.body.salaryPer, dayType: req.body.dayType, type: req.body.type, }
        const Data = await shiftPreference.create(data);
        res.status(200).json({ status: 200, message: "ShiftPreference is Added ", data: Data })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftPreference = async (req, res) => {
    try {
        const ShiftPreference = await shiftPreference.find();
        if (ShiftPreference.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        res.status(200).json({ status: 200, message: "All shiftPreference Data found successfully.", data: ShiftPreference })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftPreferenceById = async (req, res) => {
    try {
        const ShiftPreference = await shiftPreference.findById({ _id: req.params.id });
        if (!ShiftPreference) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        res.status(200).json({ status: 200, message: "Data found successfully.", data: ShiftPreference })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteShiftPreference = async (req, res) => {
    try {
        const ShiftPreference = await shiftPreference.findById({ _id: req.params.id });
        if (!ShiftPreference) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await shiftPreference.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({ status: 200, message: "ShiftPreference delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};


exports.AddShiftTiming = async (req, res) => {
    try {
        const data = { to: req.body.to, from: req.body.from, type: req.body.type }
        const Data = await shiftTiming.create(data);
        res.status(200).json({ status: 200, message: "ShiftTiming is Added ", data: Data })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftTiming = async (req, res) => {
    try {
        const ShiftTiming = await shiftTiming.find();
        if (ShiftTiming.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        res.status(200).json({ status: 200, message: "All shiftTiming Data found successfully.", data: ShiftTiming })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftTimingById = async (req, res) => {
    try {
        const ShiftTiming = await shiftTiming.findById({ _id: req.params.id });
        if (!ShiftTiming) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        res.status(200).json({ status: 200, message: "Data found successfully.", data: ShiftTiming })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteShiftTiming = async (req, res) => {
    try {
        const ShiftTiming = await shiftTiming.findById({ _id: req.params.id });
        if (!ShiftTiming) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await shiftTiming.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({ status: 200, message: "ShiftTiming delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};