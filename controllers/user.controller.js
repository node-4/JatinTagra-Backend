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
const Notification = require('../models/notificationModel');
const Order = require('../models/orders/orderModel');

exports.registration = async (req, res) => {
        const { phone, email } = req.body;
        try {
                req.body.email = email.split(" ").join("").toLowerCase();
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "USER" });
                if (!user) {
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "USER";
                        const userCreate = await User.create(req.body);

                        const welcomeMessage = `Welcome, ${userCreate.fullName}! Thank you for registering.`;
                        const welcomeNotification = new Notification({
                                recipient: userCreate._id,
                                content: welcomeMessage,
                                type: 'welcome',
                        });
                        await welcomeNotification.save();

                        return res.status(200).send({ status: 200, message: "registered successfully ", data: userCreate, });
                } else {
                        return res.status(409).send({ status: 409, message: "Already Exist", data: [] });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.signin = async (req, res) => {
        try {
                const { email, password } = req.body;
                const user = await User.findOne({ email: email, userType: "USER" });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "user not found ! not registered" });
                }
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                        return res.status(401).send({ status: 401, message: "Wrong password" });
                }
                const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                return res.status(201).send({ data: user, accessToken: accessToken });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.loginWithPhone = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "USER" });
                if (!user) {
                        return res.status(400).send({ status: 400, msg: "not found" });
                }
                const userObj = {};
                userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                userObj.accountVerification = false;
                const updated = await User.findOneAndUpdate({ phone: phone, userType: "USER" }, userObj, { new: true, });
                return res.status(200).send({ status: 200, userId: updated._id, otp: updated.otp });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: "Server error" });
        }
};
exports.verifyOtp = async (req, res) => {
        try {
                const { otp } = req.body;
                const user = await User.findById(req.params.id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "user not found" });
                }
                if (user.otp !== otp || user.otpExpiration < Date.now()) {
                        return res.status(400).json({ status: 400, message: "Invalid OTP" });
                }
                const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
                const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                return res.status(200).send({ status: 200, message: "logged in successfully", accessToken: accessToken, data: updated });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ status: 500, error: "internal server error" + err.message });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
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
exports.resendOTP = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "USER" });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }
                const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                const accountVerification = false;
                const updated = await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpiration, accountVerification }, { new: true });
                return res.status(200).send({ status: 200, message: "OTP resent", otp: otp });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.resetPassword = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "USER" });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }
                if (req.body.newPassword == req.body.confirmPassword) {
                        const updated = await User.findOneAndUpdate({ _id: user._id }, { $set: { password: bcrypt.hashSync(req.body.newPassword) } }, { new: true });
                        return res.status(200).send({ status: 200, message: "Password update successfully.", data: updated, });
                } else {
                        return res.status(501).send({ status: 501, message: "Password Not matched.", data: {}, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.socialLogin = async (req, res) => {
        try {
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "USER" });
                if (user) {
                        jwt.sign({ user_id: user._id }, JWTkey, (err, token) => {
                                if (err) {
                                        return res.status(401).json({ status: 401, msg: "Invalid Credentials" });
                                } else {
                                        return res.status(200).json({ status: 200, msg: "Login successfully", userId: user._id, token: token, });
                                }
                        });
                } else {
                        const newUser = await User.create({ firstName, lastName, mobile, email });
                        if (newUser) {
                                jwt.sign({ user_id: newUser._id }, JWTkey, (err, token) => {
                                        if (err) {
                                                return res.status(401).json({ status: 401, msg: "Invalid Credentials" });
                                        } else {
                                                return res.status(200).json({ status: 200, msg: "Login successfully", userId: user._id, token: token, });
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
        return res.status(201).json({ status: 200, data: categories, });
};
exports.getProducts = async (req, res) => {
        try {
                const { search, fromDate, toDate, subcategory, category, page, limit } = req.query;
                let query = { available: true };
                if (search) {
                        query.$or = [
                                { "name": { $regex: req.query.search, $options: "i" }, },
                                { "description": { $regex: req.query.search, $options: "i" }, },
                        ]
                }
                if (category) {
                        query.category = category
                }
                if (subcategory) {
                        query.subcategory = subcategory
                }
                if (fromDate && !toDate) {
                        query.createdAt = { $gte: fromDate };
                }
                if (!fromDate && toDate) {
                        query.createdAt = { $lte: toDate };
                }
                if (fromDate && toDate) {
                        query.$and = [
                                { createdAt: { $gte: fromDate } },
                                { createdAt: { $lte: toDate } },
                        ]
                }
                let options = {
                        page: Number(page) || 1,
                        limit: Number(limit) || 15,
                        sort: { createdAt: -1 },
                        populate: ('category')
                };
                let data = await Product.paginate(query, options);
                return res.status(200).json({ status: 200, message: "Product data found.", data: data });

        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
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
exports.createWishlist = async (req, res, next) => {
        try {
                const product = req.params.id;
                let wishList = await Wishlist.findOne({ user: req.user._id });
                if (!wishList) {
                        wishList = new Wishlist({ user: req.user._id, });
                }
                wishList.products.addToSet(product);
                await wishList.save();
                return res.status(200).json({ status: 200, message: "product add to wishlist Successfully", });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.removeFromWishlist = async (req, res, next) => {
        try {
                const wishlist = await Wishlist.findOne({ user: req.user._id });
                if (!wishlist) {
                        return res.status(404).json({ message: "Wishlist not found", status: 404 });
                }
                const product = req.params.id;
                wishlist.products.pull(product);
                await wishlist.save();
                return res.status(200).json({ status: 200, message: "Removed From Wishlist", });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.myWishlist = async (req, res, next) => {
        try {
                let myList = await Wishlist.findOne({ user: req.user._id }).populate('products');
                if (!myList) {
                        myList = await Wishlist.create({ user: req.user._id });
                }
                return res.status(200).json({ status: 200, wishlist: myList, });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.createProductReview = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (!data) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        const { rating, comment, productId } = req.body;
                        const product = await Product.findById(productId);
                        if (product) {
                                const findVendor = await User.findOne({ _id: product.vendorId, });
                                if (!findVendor) {
                                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                                }
                                if (product.reviews.length == 0) {
                                        const review = {
                                                user: req.user._id,
                                                name: req.user.name,
                                                rating: Number(rating),
                                                comment,
                                        };
                                        product.reviews.push(review);
                                        product.numOfReviews = product.reviews.length;
                                        findVendor.reviews.push(review);
                                        findVendor.numOfReviews = findVendor.reviews.length;
                                } else {
                                        const isReviewed = product.reviews.find((rev) => { rev.user.toString() === req.user._id.toString() });
                                        if (isReviewed) {
                                                product.reviews.forEach((rev) => {
                                                        if (rev.user.toString() === req.user._id.toString()) (rev.rating = rating), (rev.comment = comment);
                                                });
                                        } else {
                                                const review = {
                                                        user: req.user._id,
                                                        name: req.user.name,
                                                        rating: Number(rating),
                                                        comment,
                                                };
                                                product.reviews.push(review);
                                                product.numOfReviews = product.reviews.length;
                                        }
                                        const vendorReview = findVendor.reviews.find((rev) => { rev.user.toString() === req.user._id.toString() });
                                        if (vendorReview) {
                                                findVendor.reviews.forEach((rev) => {
                                                        if (rev.user.toString() === req.user._id.toString()) (rev.rating = rating), (rev.comment = comment);
                                                });
                                        } else {
                                                const review = {
                                                        user: req.user._id,
                                                        name: req.user.name,
                                                        rating: Number(rating),
                                                        comment,
                                                };
                                                findVendor.reviews.push(review);
                                                findVendor.numOfReviews = findVendor.reviews.length;
                                        }
                                }
                                let avg = 0;
                                product.reviews.forEach((rev) => { avg += rev.rating; });
                                product.ratings = avg / product.reviews.length;
                                await product.save({ validateBeforeSave: false })
                                let avg1 = 0;
                                findVendor.reviews.forEach((rev) => { avg1 += rev.rating; });
                                findVendor.ratings = avg / findVendor.reviews.length;
                                await findVendor.save({ validateBeforeSave: false })
                                const findProduct = await Product.findById(productId);
                                return res.status(200).json({ status: 200, data: findProduct.reviews });
                        } else {
                                return res.status(404).send({ status: 404, message: "Product Not found.", data: {}, });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getProductReviews = async (req, res, next) => {
        const product = await Product.findById(req.params.id).populate({ path: 'reviews.user', select: 'fullName' });
        if (!product) {
                return res.status(404).json({ message: "Product not found.", status: 404, data: {} });
        }
        return res.status(200).json({ status: 200, reviews: product.reviews, });
};
// exports.addMoney = async (req, res) => {
//         try {
//                 const data = await User.findOne({ _id: req.user._id, });
//                 if (data) {
//                         let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet + parseInt(req.body.balance) } }, { new: true });
//                         if (update) {
//                                 let obj = {
//                                         user: req.user._id,
//                                         date: Date.now(),
//                                         amount: req.body.balance,
//                                         type: "Credit",
//                                 };
//                                 const data1 = await transaction.create(obj);
//                                 const welcomeMessage = `Welcome, ${userCreate.fullName}! Thank you for registering.`;
//                                 const welcomeNotification = new Notification({
//                                         recipient: userCreate._id,
//                                         content: welcomeMessage,
//                                         type: 'welcome',
//                                 });
//                                 await welcomeNotification.save();
//                                 if (data1) {
//                                         return res.status(200).json({ status: 200, message: "Money has been added.", data: update, });
//                                 }

//                         }
//                 } else {
//                         return res.status(404).json({ status: 404, message: "No data found", data: {} });
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };


exports.addMoney = async (req, res) => {
        try {
                const updatedUser = await User.findByIdAndUpdate(
                        { _id: req.user._id },
                        { $inc: { wallet: parseInt(req.body.balance) } },
                        { new: true }
                );

                if (updatedUser) {
                        const transactionData = {
                                user: req.user._id,
                                date: Date.now(),
                                amount: req.body.balance,
                                type: "Credit",
                        };

                        const createdTransaction = await transaction.create(transactionData);

                        const welcomeMessage = `Welcome, ${updatedUser.fullName}! Thank you for adding money to your wallet.`;
                        const welcomeNotification = new Notification({
                                recipient: updatedUser._id,
                                content: welcomeMessage,
                                type: 'welcome',
                        });

                        await welcomeNotification.save();

                        return res.status(200).json({
                                status: 200,
                                message: "Money has been added.",
                                data: updatedUser,
                        });
                } else {
                        return res.status(404).json({
                                status: 404,
                                message: "No data found",
                                data: {},
                        });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).send({
                        status: 500,
                        message: "Server error.",
                        data: {},
                });
        }
};

// exports.removeMoney = async (req, res) => {
//         try {
//                 const data = await User.findOne({ _id: req.user._id, });
//                 if (data) {
//                         let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet - parseInt(req.body.balance) } }, { new: true });
//                         if (update) {
//                                 let obj = {
//                                         user: req.user._id,
//                                         date: Date.now(),
//                                         amount: req.body.balance,
//                                         type: "Debit",
//                                 };
//                                 const data1 = await transaction.create(obj);
//                                 const welcomeMessage = `Welcome, ${userCreate.fullName}! Thank you for registering.`;
//                                 const welcomeNotification = new Notification({
//                                         recipient: userCreate._id,
//                                         content: welcomeMessage,
//                                         type: 'welcome',
//                                 });
//                                 await welcomeNotification.save();
//                                 if (data1) {
//                                         return res.status(200).json({ status: 200, message: "Money has been deducted.", data: update, });
//                                 }
//                         }
//                 } else {
//                         return res.status(404).json({ status: 404, message: "No data found", data: {} });
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };

exports.removeMoney = async (req, res) => {
        try {
                const updatedUser = await User.findByIdAndUpdate(
                        { _id: req.user._id },
                        { $inc: { wallet: -parseInt(req.body.balance) } },
                        { new: true }
                );

                if (updatedUser) {
                        const transactionData = {
                                user: req.user._id,
                                date: Date.now(),
                                amount: req.body.balance,
                                type: "Debit",
                        };

                        const createdTransaction = await transaction.create(transactionData);

                        const welcomeMessage = `Welcome, ${updatedUser.fullName}! Money has been deducted from your wallet.`;
                        const welcomeNotification = new Notification({
                                recipient: updatedUser._id,
                                content: welcomeMessage,
                                type: 'welcome',
                        });

                        await welcomeNotification.save();

                        return res.status(200).json({
                                status: 200,
                                message: "Money has been deducted.",
                                data: updatedUser,
                        });
                } else {
                        return res.status(404).json({
                                status: 404,
                                message: "No data found",
                                data: {},
                        });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).send({
                        status: 500,
                        message: "Server error.",
                        data: {},
                });
        }
};

exports.getWallet = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        return res.status(200).json({ message: "get Profile", data: data.wallet });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.createAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        req.body.user = data._id;
                        const address = await Address.create(req.body);
                        return res.status(200).json({ message: "Address create successfully.", data: address });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getallAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const allAddress = await Address.find({ user: data._id });
                        return res.status(200).json({ message: "Address data found.", data: allAddress });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                const newAddressData = req.body;
                                let update = await Address.findByIdAndUpdate(data1._id, newAddressData, { new: true, });
                                return res.status(200).json({ status: 200, message: "Address update successfully.", data: update });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                let update = await Address.findByIdAndDelete(data1._id);
                                return res.status(200).json({ status: 200, message: "Address Deleted Successfully", });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAddressbyId = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "Address found successfully.", data: data1 });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.AddQuery = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = {
                                user: data._id,
                                name: req.body.name,
                                email: req.body.email,
                                mobile: req.body.mobile,
                                query: req.body.query
                        }
                        const Data = await helpandSupport.create(data1);
                        return res.status(200).json({ status: 200, message: "Send successfully.", data: Data })
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAllQuery = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const Data = await helpandSupport.find({ user: req.user._id });
                        if (data.length == 0) {
                                return res.status(404).json({ status: 404, message: "Help and support data not found", data: {} });
                        } else {
                                return res.status(200).json({ status: 200, message: "Data found successfully.", data: Data })
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.createPaymentCard = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const saveData = {
                                user: req.user._id,
                                name: req.body.name,
                                number: req.body.number,
                                month: req.body.month,
                                year: req.body.year,
                                cvv: req.body.cvv,
                                cardType: req.body.cardType,
                        };
                        const saved = await userCard.create(saveData);
                        return res.status(200).json({ status: 200, message: "Card details saved.", data: saved })
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getPaymentCard = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const getData = await userCard.find({ user: req.user._id });
                        return res.status(200).json({ status: 200, message: "Card details fetch.", data: getData })
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updatePaymentCard = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const payment = await userCard.findById(req.params.id);
                        if (!payment) {
                                return res.status(404).json({ status: 404, message: "Card details not fetch", data: {} });
                        } else {
                                let obj = {
                                        name: req.body.name || payment.name,
                                        number: req.body.number || payment.number,
                                        month: req.body.month || payment.month,
                                        year: req.body.year || payment.year,
                                        cvv: req.body.cvv || payment.cvv,
                                        cardType: req.body.cardType || payment.cardType,
                                }
                                let saved = await userCard.findByIdAndUpdate(payment._id, { obj }, { new: true });
                                return res.status(200).json({ status: 200, message: "Card details Updated Successfully.", data: saved })
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.DeletePaymentCard = async (req, res, next) => {
        try {
                const payment = await userCard.findById(req.params.id);
                if (!payment) {
                        return res.status(404).json({ status: 404, message: "Card details not fetch", data: {} });
                } else {
                        const data = await userCard.findByIdAndDelete({ _id: payment._id, });
                        return res.status(200).json({ status: 200, message: "Card details Delete Successfully.", data: {} })
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getTopRated = async (req, res) => {
        try {
                const Data = await Product.find({ category: req.params.category }).sort({ ratings: -1 })
                if (Data.length == 0) {
                        return res.status(404).json({ status: 404, message: "Data not found", data: {} });
                } else {
                        let vendorData = []
                        for (let i = 0; i < Data.length; i++) {
                                const findProduct = await Product.findById({ _id: Data[i]._id }).populate('vendorId')
                                if (!findProduct) {
                                        return res.status(404).json({ message: "No data found", data: {} });
                                }
                                const vendor = await User.findOne({ _id: findProduct.vendorId, });
                                let totalItem = await Product.find({ vendorId: findProduct.vendorId }).count();
                                let obj = {
                                        product: findProduct,
                                        vendor: vendor,
                                        totalItem: totalItem
                                }
                                vendorData.push(obj)
                        }
                        return res.status(200).json({ status: 200, message: "Data found successfully.", data: vendorData })
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAllVendor = async (req, res) => {
        try {
                const vendor = await User.find({ userType: "VENDOR" });
                if (vendor.length > 0) {
                        let vendorData = []
                        for (let i = 0; i < vendor.length; i++) {
                                const Data = await Product.find({ vendorId: vendor[i]._id }).sort({ ratings: -1 })
                                if (Data.length == 0) {
                                        let obj = {
                                                product: [],
                                                vendor: vendor[i],
                                                totalItem: 0
                                        }
                                        vendorData.push(obj)
                                } else {
                                        let obj = {
                                                product: Data[0],
                                                vendor: vendor[i],
                                                totalItem: Data.length
                                        }
                                        vendorData.push(obj)
                                }
                        }
                        return res.status(200).json({ status: 200, message: "Data found successfully.", data: vendorData })
                } else {
                        return res.status(404).json({ status: 404, message: "vendor not found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateLocation = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id, });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        if (req.body.currentLat || req.body.currentLong) {
                                coordinates = [parseFloat(req.body.currentLat), parseFloat(req.body.currentLong)]
                                req.body.currentLocation = { type: "Point", coordinates };
                        }
                        let update = await User.findByIdAndUpdate({ _id: user._id }, { $set: { currentLocation: req.body.currentLocation, city: req.body.city, sector: req.body.sector } }, { new: true });
                        if (update) {
                                return res.status(200).send({ status: 200, message: "Location update successfully.", data: update.currentLocation });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};



exports.createNotification = async (req, res) => {
        try {
                const { recipient, content } = req.body;

                const notification = new Notification({ recipient, content });
                await notification.save();

                return res.status(201).json({ status: 201, message: 'Notification created successfully', data: notification });
        } catch (error) {
                return res.status(500).json({ status: 500, message: 'Error creating notification', error: error.message });
        }
};


exports.markNotificationAsRead = async (req, res) => {
        try {
                const notificationId = req.params.notificationId;

                const notification = await Notification.findByIdAndUpdate(
                        notificationId,
                        { status: 'read' },
                        { new: true }
                );

                if (!notification) {
                        return res.status(404).json({ status: 404, message: 'Notification not found' });
                }

                return res.status(200).json({ status: 200, message: 'Notification marked as read', data: notification });
        } catch (error) {
                return res.status(500).json({ status: 500, message: 'Error marking notification as read', error: error.message });
        }
};


exports.getNotificationsForUser = async (req, res) => {
        try {
                const userId = req.params.userId;

                const user = await User.findById(userId);
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'User not found' });
                }

                const notifications = await Notification.find({ recipient: userId });

                return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
        } catch (error) {
                return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
        }
};


function generateOTP() {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < 4; i++) {
                const randomIndex = Math.floor(Math.random() * digits.length);
                otp += digits[randomIndex];
        }
        return otp;
}


exports.sendOTP = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { mobileNumber } = req.body; 
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const otp = generateOTP();
    order.paymentRecived.otp = otp; 
    order.paymentRecived.mobileNumber = mobileNumber;
    await order.save();

    return res.status(200).json({ success: true, message: 'OTP sent', otp });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentRecived.otp === otp) { 
      return res.status(200).json({ success: true, message: 'OTP is valid' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


