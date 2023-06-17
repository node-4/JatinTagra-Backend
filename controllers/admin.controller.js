const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const Category = require("../models/CategoryModel");
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
exports.createCategory = async (req, res, next) => {
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
exports.getCategories = async (req, res, next) => {
    const categories = await Category.find({});
    res.status(201).json({ success: true, categories, });
};
exports.updateCategory = async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    }
    category.name = req.body.name;
    let update = await category.save();
    res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCategory = async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        await Category.findByIdAndDelete(category._id);
        res.status(200).json({ message: "Category Deleted Successfully !" });
    }
};