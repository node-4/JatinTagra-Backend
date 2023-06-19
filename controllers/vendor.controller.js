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
const orderModel = require("../models/orders/orderModel");
const userOrder = require("../models/orders/userOrder");
const cancelReturnOrder = require("../models/orders/cancelReturnOrder");
const cloudinary = require("cloudinary");
cloudinary.config({
        cloud_name: "https-www-pilkhuwahandloom-com",
        api_key: "886273344769554",
        api_secret: "BVicyMGE04PrE7vWSorJ5txKmPs",
});
exports.registration = async (req, res) => {
        const { phone, email } = req.body;
        try {
                req.body.email = email.split(" ").join("").toLowerCase();
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "VENDOR" });
                if (!user) {
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "VENDOR";
                        req.body.status = "Pending";
                        const userCreate = await User.create(req.body);
                        res.status(200).send({ message: "registered successfully ", data: userCreate, });
                } else {
                        res.status(409).send({ message: "Already Exist", data: [] });
                }
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error" });
        }
};
exports.completeRegistration = async (req, res) => {
        try {
                let user = await User.findById({ _id: req.params.id });
                if (!user) {
                        res.status(404).send({ message: "Data not found", status: 404, data: [] });
                } else {
                        let findData = await vendorDetails.findOne({ user: user._id });
                        if (findData) {
                                let data = {
                                        user: user._id,
                                        vendorType: req.body.vendorType,
                                        gstNo: req.body.gstNo,
                                        fssaiNo: req.body.fssaiNo,
                                        fssaiLicense: req.body.fssaiLicense,
                                        aadhar: req.body.aadhar,
                                        storeName: req.body.storeName,
                                        storeAddress: req.body.storeAddress,
                                        pinCode: req.body.pinCode,
                                        storeImage: req.body.storeImage,
                                        openingTime: req.body.openingTime,
                                        closingTime: req.body.closingTime,
                                        operatingHour: req.body.operatingHour,
                                        preparingTime: req.body.preparingTime,
                                        categoryProduct: req.body.categoryProduct
                                };
                                let update = await vendorDetails.findByIdAndUpdate({ _id: findData._id }, { data }, { new: true });
                                if (update) {
                                        res.status(200).send({ message: "Data update successfully", status: 200, data: update });
                                }
                        } else {
                                let data = {
                                        user: user._id,
                                        vendorType: req.body.vendorType,
                                        gstNo: req.body.gstNo,
                                        fssaiNo: req.body.fssaiNo,
                                        fssaiLicense: req.body.fssaiLicense,
                                        aadhar: req.body.aadhar,
                                        storeName: req.body.storeName,
                                        storeAddress: req.body.storeAddress,
                                        pinCode: req.body.pinCode,
                                        storeImage: req.body.storeImage,
                                        openingTime: req.body.openingTime,
                                        closingTime: req.body.closingTime,
                                        operatingHour: req.body.operatingHour,
                                        preparingTime: req.body.preparingTime,
                                        categoryProduct: req.body.categoryProduct
                                };
                                const userCreate = await vendorDetails.create(data);
                                res.status(200).send({ message: "Data create successfully", status: 200, data: userCreate });
                        }
                }
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", status: 500 });
        }
};
exports.signin = async (req, res) => {
        try {
                const { email, password } = req.body;
                const user = await User.findOne({ email: email, userType: "VENDOR" });
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
exports.loginWithPhone = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "VENDOR" });
                if (!user) {
                        return res.status(400).send({ msg: "not found" });
                }
                const userObj = {};
                userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                userObj.accountVerification = false;
                const updated = await User.findOneAndUpdate({ phone: phone, userType: "VENDOR" }, userObj, { new: true, });
                res.status(200).send({ userId: updated._id, otp: updated.otp });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error" });
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
                res.status(200).send({ message: "logged in successfully", accessToken: accessToken, data: updated });
        } catch (err) {
                console.log(err.message);
                res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        return res.status(200).json({ message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.resendOTP = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "VENDOR" });
                if (!user) {
                        return res.status(400).send({ message: "User not found" });
                }
                const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                const accountVerification = false;
                const updated = await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpiration, accountVerification }, { new: true });
                res.status(200).send({ message: "OTP resent", otp: otp });
        } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.resetPassword = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "VENDOR" });
                if (!user) {
                        return res.status(400).send({ message: "User not found" });
                }
                if (req.body.newPassword == req.body.confirmPassword) {
                        const updated = await User.findOneAndUpdate({ _id: user._id }, { $set: { password: bcrypt.hashSync(req.body.newPassword) } }, { new: true });
                        res.status(200).send({ message: "Password update successfully.", data: updated, });
                } else {
                        res.status(501).send({ message: "Password Not matched.", data: {}, });
                }
        } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.socialLogin = async (req, res) => {
        try {
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "VENDOR" });
                if (user) {
                        jwt.sign({ user_id: user._id }, JWTkey, (err, token) => {
                                if (err) {
                                        return res.status(401).send("Invalid Credentials");
                                } else {
                                        return res.status(200).json({ success: true, msg: "Login successfully", userId: user._id, token: token, });
                                }
                        });
                } else {
                        const newUser = await User.create({ firstName, lastName, mobile, email });
                        if (newUser) {
                                jwt.sign({ user_id: newUser._id }, JWTkey, (err, token) => {
                                        if (err) {
                                                return res.status(401).send("Invalid Credentials");
                                        } else {
                                                return res.status(200).json({ success: true, msg: "Login successfully", userId: user._id, token: token, });
                                        }
                                });
                        }
                }
        } catch (err) {
                return createResponse(res, 500, "Internal server error");
        }
};
exports.getCategories = async (req, res, next) => {
        const categories = await Category.find({});
        res.status(201).json({ success: true, categories, });
};
exports.addProduct = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (!data) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        const findCategory = await Category.findById({ _id: req.body.category });
                        if (!findCategory) {
                                return res.status(404).json({ message: "Category Not found", data: {} });
                        } else {
                                let Images = [];
                                if (req.body.images) {
                                        for (let i = 0; i < req.body.images.length; i++) {
                                                var result = await cloudinary.uploader.upload(req.body.images[i], { resource_type: "auto" });
                                                let obj = {
                                                        img: result.secure_url
                                                };
                                                Images.push(obj)

                                        }
                                }

                                let obj = {
                                        vendorId: data._id,
                                        category: findCategory._id,
                                        vegNonVeg: req.body.vegNonVeg,
                                        name: req.body.name,
                                        description: req.body.description,
                                        price: req.body.price,
                                        images: Images,
                                        packageCharges: req.body.packageCharges,
                                        gst: req.body.gst,
                                        cGst: req.body.cGst,
                                        sGst: req.body.sGst,
                                }
                                const product = await Product.create(obj);
                                res.status(200).json({ message: "Product add successfully.", status: 200, data: product });
                        }
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getProducts = async (req, res) => {
        try {
                if (req.query.category) {
                        const product = await Product.find({ vendorId: req.user.id, category: req.query.category });
                        if (product.length == 0) {
                                return res.status(404).json({ message: "No data found", data: {} });
                        } else {
                                res.status(200).json({ message: "Product data found.", status: 200, data: product });
                        }
                } else {
                        const product = await Product.find({ vendorId: req.user.id });
                        if (product.length == 0) {
                                return res.status(404).json({ message: "No data found", data: {} });
                        } else {
                                res.status(200).json({ message: "Product data found.", status: 200, data: product });
                        }
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getProduct = async (req, res) => {
        try {
                const product = await Product.findById({ _id: req.params.id });
                if (!product) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        res.status(200).json({ message: "Product data found.", status: 200, data: product });
                }
        } catch (error) {
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.deleteProduct = async (req, res) => {
        try {
                const product = await Product.findById({ _id: req.params.id });
                if (!product) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        await Product.findByIdAndDelete({ _id: product._id });
                        res.status(200).json({ message: "Product delete successfully.", status: 200, data: {} });
                }
        } catch (error) {
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.editProduct = async (req, res) => {
        try {
                const product = await Product.findById({ _id: req.params.id });
                if (!product) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        const findCategory = await Category.findById({ _id: req.body.category });
                        if (!findCategory) {
                                return res.status(404).json({ message: "Category Not found", data: {} });
                        } else {
                                let obj = {
                                        vendorId: req.user.id,
                                        category: findCategory._id,
                                        vegNonVeg: req.body.vegNonVeg || product.vegNonVeg,
                                        name: req.body.name || product.name,
                                        description: req.body.description || product.description,
                                        price: req.body.price || product.price,
                                        packageCharges: req.body.packageCharges || product.packageCharges,
                                        gst: req.body.gst || product.gst,
                                        cGst: req.body.cGst || product.cGst,
                                        sGst: req.body.sGst || product.sGst,
                                }
                                const update = await Product.findByIdAndUpdate({ _id: product._id }, { obj }, { new: true });
                                res.status(200).json({ message: "Product update successfully.", status: 200, data: update });
                        }
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.addDiscount = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (!data) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        if (req.body.type == "Product") {
                                const findProduct = await Product.findById({ _id: req.body.product });
                                if (!findProduct) {
                                        return res.status(404).json({ message: "Product Not found", data: {} });
                                }
                                req.body.productId = findProduct._id;
                        }
                        if (req.body.type == "Category") {
                                const findCategory = await Category.findById({ _id: req.body.category });
                                if (!findCategory) {
                                        return res.status(404).json({ message: "Category Not found", data: {} });
                                }
                                req.body.category = findCategory._id;
                        }
                        req.body.vendorId = data._id;
                        req.body.discountPrice = req.body.discountPrice;
                        req.body.minOrder = req.body.minOrder;
                        req.body.expireDate = req.body.expireDate;
                        req.body.toTime = req.body.toTime;
                        req.body.fromTime = req.body.fromTime;
                        req.body.typeofCustomer = req.body.typeofCustomer;
                        req.body.type = req.body.type;
                        const discount = await Discount.create(req.body);
                        res.status(200).json({ message: "Discount add successfully.", status: 200, data: discount });
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getDiscount = async (req, res) => {
        try {
                const discount = await Discount.find({ vendorId: req.user.id });
                if (discount.length == 0) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        res.status(200).json({ message: "Product data found.", status: 200, data: discount });
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getProductReviews = async (req, res, next) => {
        const product = await Product.findById(req.params.id).populate({ path: 'reviews.user', select: 'fullName' });
        if (!product) {
                return next(new ErrorHander("Product not found", 404));
        }
        res.status(200).json({ success: true, reviews: product.reviews, });
};
exports.deleteReview = async (req, res, next) => {
        const product = await Product.findById(req.params.productId);
        if (!product) {
                return next(new ErrorHander("Product not found", 404));
        }
        const reviews = product.reviews.filter(
                (rev) => rev._id.toString() !== req.params.id.toString()
        );
        let avg = 0;
        reviews.forEach((rev) => {
                avg += rev.rating;
        });
        let ratings = 0;
        if (reviews.length === 0) {
                ratings = 0;
        } else {
                ratings = avg / reviews.length;
        }
        const numOfReviews = reviews.length;
        let update = await Product.findByIdAndUpdate(req.params.productId, { reviews, ratings, numOfReviews, }, { new: true, runValidators: true, useFindAndModify: false, });
        res.status(200).json({ status: 200, data: update });
};
exports.addMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: wallet + parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                let obj = {
                                        user: req.user._id,
                                        date: Date.now(),
                                        amount: req.body.balance,
                                        type: "Credit",
                                };
                                const data1 = await transaction.create(obj);
                                if (data1) {
                                        res.status(200).json({ status: "success", data: update });
                                }

                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.removeMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: wallet - parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                let obj = {
                                        user: req.user._id,
                                        date: Date.now(),
                                        amount: req.body.balance,
                                        type: "Debit",
                                };
                                const data1 = await transaction.create(obj);
                                if (data1) {
                                        res.status(200).json({ status: "success", data: update, });
                                }

                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getWallet = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user.id, });
                if (data) {
                        return res.status(200).json({ message: "get Profile", data: data.wallet });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getOrders = async (req, res, next) => {
        try {
                const orders = await orderModel.find({ vendorId: req.user._id, orderStatus: "confirmed" }).populate('userId category productId discountId returnOrder');
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getcancelReturnOrder = async (req, res, next) => {
        try {
                const orders = await cancelReturnOrder.find({ vendorId: req.user._id }).populate('Orders');
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getOrderbyId = async (req, res, next) => {
        try {
                const orders = await orderModel.findById({ _id: req.params.id }).populate('vendorId userId category productId discountId');
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.allTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user._id }).populate("user orderId");
                res.status(200).json({ data: data });
        } catch (err) {
                res.status(400).json({ message: err.message });
        }
};
exports.allcreditTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user._id, type: "Credit" });
                res.status(200).json({ data: data });
        } catch (err) {
                res.status(400).json({ message: err.message });
        }
};
exports.allDebitTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user._id, type: "Debit" });
                res.status(200).json({ data: data });
        } catch (err) {
                res.status(400).json({ message: err.message });
        }
};