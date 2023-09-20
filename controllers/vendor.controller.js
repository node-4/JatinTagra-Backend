const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const Category = require("../models/CategoryModel");
const subCategory = require("../models/subCategoryModel");
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
const deliveryOrder = require("../models/orders/deliveryOrder");
const cancelReturnOrder = require("../models/orders/cancelReturnOrder");
const cloudinary = require("cloudinary");
const complaint = require("../models/complaint");
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
                        return res.status(200).send({ message: "registered successfully ", data: userCreate, });
                } else {
                        return res.status(409).send({ message: "Already Exist", data: [] });
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
                                        return res.status(200).send({ message: "Data update successfully", status: 200, data: update });
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
                                return res.status(200).send({ message: "Data create successfully", status: 200, data: userCreate });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500 });
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
                return res.status(201).send({ data: user, accessToken: accessToken });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
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
exports.updateProfile = async (req, res) => {
        try {
                let user = await User.findById({ _id: req.user._id });
                if (!user) {
                        return res.status(404).send({ message: "Data not found", status: 404, data: [] });
                } else {
                        let password;
                        if (req.body.password != (null || undefined)) {
                                password = bcrypt.hashSync(req.body.password, 8);
                        }
                        req.body.shopOpen = req.body.shopOpen || user.shopOpen;
                        req.body.fullName = req.body.fullName || user.fullName;
                        req.body.password = password || user.password;
                        let update = await User.findByIdAndUpdate(user._id, { $set: req.body }, { new: true, });
                        return res.status(200).send({ message: "Data update successfully", status: 200, data: update });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500 });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        return res.status(200).json({ message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
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
                return res.status(200).send({ message: "OTP resent", otp: otp });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
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
                        return res.status(200).send({ message: "Password update successfully.", data: updated, });
                } else {
                        return res.status(501).send({ message: "Password Not matched.", data: {}, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
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
exports.addMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet + parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                let obj = {
                                        user: req.user._id,
                                        date: Date.now(),
                                        amount: req.body.balance,
                                        type: "Credit",
                                };
                                const data1 = await transaction.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: "success", data: update });
                                }

                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.removeMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
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
                                        return res.status(200).json({ status: "success", data: update, });
                                }

                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getWallet = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        return res.status(200).json({ message: "get Profile", data: data.wallet });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.allTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user._id }).populate("user orderId");
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allcreditTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user._id, type: "Credit" });
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status.status(400).json({ message: err.message });
        }
};
exports.allDebitTransactionUser = async (req, res) => {
        try {
                const data = await transaction.find({ user: req.user._id, type: "Debit" });
                return res.status(200).json({ data: data });
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.getCategories = async (req, res, next) => {
        const categories = await Category.find({});
        return res.status(201).json({ success: true, categories, });
};
exports.addProduct = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (!data) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        const findCategory = await Category.findById({ _id: req.body.category });
                        if (!findCategory) {
                                return res.status(404).json({ message: "Category Not found", data: {} });
                        } else {
                                const findSubCategory = await subCategory.findById({ _id: req.body.subcategoryId, categoryId: findCategory._id });
                                if (!findSubCategory) {
                                        return res.status(404).json({ message: "Sub Category Not found", data: {} });
                                }
                                let Images = [], discountPrice;
                                if (req.files) {
                                        for (let i = 0; i < req.files.length; i++) {
                                                let obj = {
                                                        img: req.files[i].path
                                                };
                                                Images.push(obj)
                                        }
                                }
                                if (req.body.discountActive == "true") {
                                        discountPrice = req.body.price - ((req.body.price * req.body.discount) / 100)
                                } else {
                                        discountPrice = 0;
                                }
                                let obj = {
                                        vendorId: data._id,
                                        category: findCategory._id,
                                        subcategory: findSubCategory._id,
                                        name: req.body.name,
                                        images: Images,
                                        price: req.body.price,
                                        discountPrice: discountPrice,
                                        discountActive: req.body.discountActive,
                                        discount: req.body.discount || 0,
                                        quantity: req.body.quantity,
                                        size: req.body.size,
                                        description: req.body.description,
                                        nutirient: req.body.nutirient,
                                        storageTips: req.body.storageTips,
                                        manufactureDetails: req.body.manufactureDetails,
                                        packageCharges: req.body.packageCharges,
                                        gst: req.body.gst,
                                        cGst: req.body.cGst,
                                        sGst: req.body.sGst,
                                }
                                const product = await Product.create(obj);
                                return res.status(200).json({ message: "Product add successfully.", status: 200, data: product });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getProducts = async (req, res) => {
        try {
                if (req.query.category) {
                        const product = await Product.find({ vendorId: req.user._id, category: req.query.category });
                        if (product.length == 0) {
                                return res.status(404).json({ message: "No data found", data: {} });
                        } else {
                                return res.status(200).json({ message: "Product data found.", status: 200, data: product });
                        }
                } else {
                        const product = await Product.find({ vendorId: req.user._id });
                        if (product.length == 0) {
                                return res.status(404).json({ message: "No data found", data: {} });
                        } else {
                                return res.status(200).json({ message: "Product data found.", status: 200, data: product });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getProduct = async (req, res) => {
        try {
                const product = await Product.findById({ _id: req.params.id });
                if (!product) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        return res.status(200).json({ message: "Product data found.", status: 200, data: product });
                }
        } catch (error) {
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.deleteProduct = async (req, res) => {
        try {
                const product = await Product.findById({ _id: req.params.id });
                if (!product) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        await Product.findByIdAndDelete({ _id: product._id });
                        return res.status(200).json({ message: "Product delete successfully.", status: 200, data: {} });
                }
        } catch (error) {
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.editProduct = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (!data) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        const product = await Product.findById({ _id: req.params.id });
                        if (!product) {
                                return res.status(404).json({ message: "No data found", data: {} });
                        } else {
                                let findCategory, findSubCategory, discountPrice;
                                if (req.body.category != (null || undefined)) {
                                        findCategory = await Category.findById({ _id: req.body.category });
                                        if (!findCategory) {
                                                return res.status(404).json({ message: "Category Not found", data: {} });
                                        }
                                }
                                if (req.body.subcategoryId != (null || undefined)) {
                                        findSubCategory = await subCategory.findById({ _id: req.body.subcategoryId, categoryId: findCategory._id || product.category });
                                        if (!findSubCategory) {
                                                return res.status(404).json({ message: "Sub Category Not found", data: {} });
                                        }
                                }
                                if (req.body.discountActive == "true") {
                                        discountPrice = req.body.price - ((req.body.price * req.body.discount) / 100)
                                } else {
                                        discountPrice = 0;
                                }
                                let Images = [];
                                if (req.files) {
                                        for (let i = 0; i < req.files.length; i++) {
                                                let obj = {
                                                        img: req.files[i].path
                                                };
                                                Images.push(obj)
                                        }
                                } else {
                                        Images = product.images
                                }
                                let obj = {
                                        vendorId: data._id,
                                        category: findCategory._id || product.category,
                                        subcategory: findSubCategory._id || product.subcategory,
                                        name: req.body.name || product.name,
                                        images: Images,
                                        price: req.body.price || product.price,
                                        discountPrice: discountPrice || product.discountPrice,
                                        discountActive: req.body.discountActive || product.discountActive,
                                        discount: req.body.discount || 0 || product.discount,
                                        quantity: req.body.quantity || product.quantity,
                                        size: req.body.size || product.size,
                                        description: req.body.description || product.description,
                                        nutirient: req.body.nutirient || product.nutirient,
                                        storageTips: req.body.storageTips || product.storageTips,
                                        manufactureDetails: req.body.manufactureDetails || product.manufactureDetails,
                                        packageCharges: req.body.packageCharges || product.packageCharges,
                                        gst: req.body.gst || product.gst,
                                        cGst: req.body.cGst || product.cGst,
                                        sGst: req.body.sGst || product.sGst,
                                }
                                const update = await Product.findByIdAndUpdate({ _id: product._id }, { obj }, { new: true });
                                return res.status(200).json({ message: "Product update successfully.", status: 200, data: update });

                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.addDiscount = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
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
                        return res.status(200).json({ message: "Discount add successfully.", status: 200, data: discount });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getDiscount = async (req, res) => {
        try {
                const discount = await Discount.find({ vendorId: req.user._id });
                if (discount.length == 0) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        return res.status(200).json({ message: "Product data found.", status: 200, data: discount });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ message: "server error.", data: {}, });
        }
};
exports.getProductReviews = async (req, res, next) => {
        const product = await Product.findById(req.params.id).populate({ path: 'reviews.user', select: 'fullName' });
        if (!product) {
                return next(new ErrorHander("Product not found", 404));
        }
        return res.status(200).json({ success: true, reviews: product.reviews, });
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
        return res.status(200).json({ status: 200, data: update });
};
exports.getOrders = async (req, res, next) => {
        try {
                const orders = await orderModel.find({ vendorId: req.user._id, orderStatus: "confirmed", preparingStatus: req.query.preparingStatus }).populate('userId category productId discountId returnOrder');
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateOrderStatus = async (req, res) => {
        try {
                const orders = await orderModel.findById({ _id: req.params.id });
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                } else {
                        if ((req.body.preparingStatus == "Reject") || (req.body.preparingStatus == "delivered")) {
                                const update = await orderModel.findByIdAndUpdate({ _id: orders._id }, { $set: { preparingStatus: req.body.preparingStatus } }, { new: true });
                                return res.status(200).json({ status: 200, msg: "orders of user", data: update })
                        } else {
                                let time = new Date(Date.now() + req.body.time * 60 * 1000);
                                const update = await orderModel.findByIdAndUpdate({ _id: orders._id }, { $set: { time: time, preparingStatus: req.body.preparingStatus } }, { new: true });
                                return res.status(200).json({ status: 200, msg: "orders of user", data: update })
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.assignOrder = async (req, res) => {
        try {
                const findOrders = await orderModel.findById({ _id: req.params.id });
                if (!findOrders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                } else {
                        let date = new Date(Date.now()).getDate();
                        let month = new Date(Date.now()).getMonth() + 1;
                        let year = new Date(Date.now()).getFullYear();
                        let month1, date1;
                        if (month < 10) { month1 = '' + 0 + month; } else { month1 = month }
                        if (date < 10) { date1 = '' + 0 + date; } else { date1 = date }
                        let fullDate = (`${year}-${month1}-${date1}`)
                        let findDriver = await User.findById({ _id: req.body.userId });
                        if (findDriver) {
                                let findDeliveryOrder = await deliveryOrder.findOne({ userId: findOrders.userId, Orders: findOrders._id, driverId: findDriver._id, date: fullDate });
                                if (findDeliveryOrder) {
                                        return res.status(409).json({ status: 409, message: "Orders Already assign", data: findDeliveryOrder });
                                } else {
                                        let obj = {
                                                userId: findOrders.userId,
                                                driverId: findDriver._id,
                                                date: fullDate,
                                                Orders: findOrders._id,
                                                deliveryStatus: "assigned",
                                        }
                                        const saveOrder = await deliveryOrder.create(obj);
                                        if (saveOrder) {
                                                const update = await orderModel.findByIdAndUpdate({ _id: findOrders._id }, { $set: { deliveryStatus: "assigned" } }, { new: true });
                                                return res.status(200).json({ message: "Order assign successfully.", status: 200, data: saveOrder });
                                        }
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Driver not found", data: {} });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.createOrder = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const driver = await User.find({ userType: "DRIVER" });
                        if (driver.length > 0) {
                                let date = new Date(Date.now()).getDate();
                                let month = new Date(Date.now()).getMonth() + 1;
                                let year = new Date(Date.now()).getFullYear();
                                let month1, date1;
                                if (month < 10) { month1 = '' + 0 + month; } else { month1 = month }
                                if (date < 10) { date1 = '' + 0 + date; } else { date1 = date }
                                let fullDate = (`${year}-${month1}-${date1}`)
                                let orderId = await reffralCode();
                                if (req.body.cash == "Cash") {
                                        req.body.paymentStatus = "pending"
                                }
                                if (req.body.cash == "Online") {
                                        req.body.paymentStatus = "paid"
                                }
                                let obj = {
                                        vendorId: data._id,
                                        orderId: orderId,
                                        userPhone: req.body.userPhone,
                                        pickUpaddress: req.body.pickUpaddress,
                                        pickUpInstruction: req.body.pickUpInstruction,
                                        deliveryInstruction: req.body.deliveryInstruction,
                                        courierWithBag: req.body.courierWithBag,
                                        notificationRecipent: req.body.notificationRecipent,
                                        parcelValue: req.body.parcelValue,
                                        yourPhone: req.body.yourPhone,
                                        vendorPhone: req.body.vendorPhone,
                                        sending: req.body.sending,
                                        orderType: "Package",
                                        address: req.body.address,
                                        paidAmount: req.body.paidAmount,
                                        paymentStatus: req.body.paymentStatus
                                }
                                let saveOrder = await orderModel.create(obj);
                                if (saveOrder) {
                                        for (let i = 0; i < driver.length; i++) {
                                                let obj = {
                                                        driverId: driver[i]._id,
                                                        date: fullDate,
                                                        Orders: saveOrder._id,
                                                        OrderStatus: "PENDING",
                                                        orderType: "Package"
                                                };
                                                let saveOrders = await deliveryOrder.create(obj);
                                        }
                                        return res.status(200).json({ status: 200, message: "Order create successfully", data: saveOrder });
                                }
                        } else {
                                return res.status(404).json({ message: "Driver data not found", data: {} });
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getComplaint = async (req, res, next) => {
        try {
                const orders = await complaint.find({ $or: [{ userId: req.user._id }, { vendorId: req.user._id }] }).populate('userId vendorId Orders Orders.$.productId')
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Complain not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "complain found", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getComplainbyId = async (req, res, next) => {
        try {
                const orders = await Complain.findById({ _id: req.params.id }).populate('vendorId userId Orders');
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getMetric = async (req, res, next) => {
        try {
                let query = { vendorId: req.user._id };
                if ((req.query.fromDate != (null || undefined)) && (req.query.toDate != (null || undefined))) {
                        query.$and = [
                                { createdAt: { $gte: req.query.fromDate } },
                                { createdAt: { $lte: req.query.toDate } },
                        ]
                }
                const orders = await orderModel.find({ query, preparingStatus: "New" }).count()
                const orders1 = await orderModel.find({ query, preparingStatus: "Preparing" }).count()
                const orders2 = await orderModel.find({ query, preparingStatus: "Ready" }).count()
                const orders3 = await orderModel.find({ query, preparingStatus: "out_for_delivery" }).count()
                const orders4 = await orderModel.find({ query, preparingStatus: "delivered" }).count()
                let dashboard = {
                        new: orders,
                        preparing: orders1,
                        Ready: orders2,
                        outForDelivery: orders3,
                        deliveryOrder: orders4
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: dashboard })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};

exports.getAllDriver = async (req, res) => {
        try {
                const vendor = await User.find({ userType: "DRIVER" });
                if (vendor.length > 0) {
                        return res.status(200).json({ status: 200, message: "Data found successfully.", data: vendor })
                } else {
                        return res.status(404).json({ status: 404, message: "vendor not found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}