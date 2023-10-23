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
const shiftPreference = require("../models/shiftPreference");
const preferedArea = require("../models/preferedArea");
const shiftTiming = require("../models/shiftTiming");
const ContactDetail = require("../models/ContactDetail");
const subscription = require('../models/subscription')
const orderModel = require("../models/orders/orderModel");
const userOrder = require("../models/orders/userOrder");
const deliveryOrder = require("../models/orders/deliveryOrder");
const cancelReturnOrder = require("../models/orders/cancelReturnOrder");
const complaint = require("../models/complaint");
const driverEarning = require("../models/driverEarning");
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
            return res.status(200).send({
                message: "registered successfully ",
                data: userCreate,
            });
        } else {
            return res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
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
        return res.status(201).send({ data: user, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
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
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.createCategory = async (req, res) => {
    try {
        let findCategory = await Category.findOne({ name: req.body.name });
        if (findCategory) {
            return res.status(409).json({ message: "category already exit.", status: 404, data: {} });
        } else {
            let image;
            if (req.file) {
                image = req.file.path
            }
            const data = { name: req.body.name, image: image };
            const category = await Category.create(data);
            return res.status(200).json({ message: "category add successfully.", status: 200, data: category });
        }

    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
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
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    }
    let image;
    if (req.file) {
        image = req.file.path
    }
    category.name = req.body.name || category.name;
    category.image = image || category.image;
    let update = await category.save();
    res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        await Category.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Category Deleted Successfully !" });
    }
};
exports.createSubCategory = async (req, res) => {
    try {
        const data = await Category.findById(req.body.categoryId);
        if (!data || data.length === 0) {
            return res.status(400).send({ status: 404, msg: "not found" });
        }
        let image;
        if (req.file) {
            image = req.file.path
        }
        const subcategoryCreated = await subCategory.create({ name: req.body.name, image: image, categoryId: data._id });
        return res.status(201).send({ status: 200, message: "Sub Category add successfully", data: subcategoryCreated, });
    } catch (err) {
        return res.status(500).send({ message: "Internal server error while creating sub category", });
    }
};
exports.getSubCategoryForAdmin = async (req, res) => {
    try {
        const data = await subCategory.find({}).populate('categoryId');
        if (data.length > 0) {
            return res.status(200).json({ status: 200, message: "Sub Category data found.", data: data });
        } else {
            return res.status(404).json({ status: 404, message: "Sub Category data not found.", data: {} });
        }
    } catch (err) {
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.paginateSubCategoriesSearch = async (req, res) => {
    try {
        console.log("------------------------");
        const { search, fromDate, toDate, page, limit } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { "name": { $regex: req.query.search, $options: "i" }, },
            ]
        }
        if ((fromDate != 'null') && (toDate == 'null')) {
            query.createdAt = { $gte: fromDate };
        }
        if ((fromDate == 'null') && (toDate != 'null')) {
            query.createdAt = { $lte: toDate };
        }
        if ((fromDate != 'null') && (toDate != 'null')) {
            query.$and = [
                { createdAt: { $gte: fromDate } },
                { createdAt: { $lte: toDate } },
            ]
        }
        let options = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            sort: { createdAt: -1 },
            populate: ('categoryId')
        };
        let data = await subCategory.paginate(query, options);
        return res.status(200).json({ status: 200, message: "Sub Category data found.", data: data });

    } catch (err) {
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getSubCategory = async (req, res) => {
    try {
        const categories = await Category.find({});
        if (categories.length == 0) {
            return res.status(404).json({ message: "Data not found.", status: 404, data: {} });
        } else {
            let Array = []
            for (let i = 0; i < categories.length; i++) {
                const data = await subCategory.find({ categoryId: categories[i]._id });
                let obj = {
                    category: categories[i],
                    subCategory: data
                }
                Array.push(obj)
            }
            return res.status(200).json({ status: 200, message: "Sub Category data found.", data: Array });
        }
    } catch (err) {
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.getIdSubCategory = async (req, res) => {
    try {
        const data = await subCategory.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).json({ status: 200, message: "Sub Category data found.", data: data });
    } catch (err) {
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.updateSubCategory = async (req, res) => {
    try {
        let id = req.params.id
        const findSubCategory = await subCategory.findById(id);
        if (!findSubCategory) {
            return res.status(404).json({ status: 404, message: "Sub Category Not Found", data: {} });
        }
        let findCategory;
        if (req.body.categoryId != "null") {
            findCategory = await Category.findById({ _id: req.body.categoryId });
            if (!findCategory || findCategory.length === 0) {
                return res.status(400).send({ status: 404, msg: "Category not found" });
            }
        }
        let image;
        if (req.file) {
            image = req.file.path
        }
        req.body.image = image || findSubCategory.image;
        req.body.categoryId = findCategory._id || findSubCategory.categoryId;
        req.body.name = req.body.name || findSubCategory.name;
        const data = await subCategory.findByIdAndUpdate(findSubCategory._id, req.body, { new: true });
        if (data) {
            return res.status(200).send({ status: 200, msg: "updated", data: data });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error ",
            error: err.message,
        });
    }
};
exports.deleteSubCategory = async (req, res) => {
    try {
        const data = await subCategory.findByIdAndDelete(req.params.id);
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "deleted", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            msg: "internal server error",
            error: err.message,
        });
    }
};
exports.getSubCategoryByCategoryId = async (req, res) => {
    try {
        const data = await subCategory.find({ categoryId: req.params.categoryId }).populate('categoryId');
        if (!data || data.length === 0) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).json({ status: 200, message: "Sub Category data found.", data: data });
    } catch (err) {
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};
exports.AddBanner = async (req, res) => {
    try {
        const category = await Category.findById(req.body.categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
        const data = { image: req.body.image, desc: req.body.desc, category: category._id }
        const Data = await banner.create(data);
        return res.status(200).json({ status: 200, message: "Banner is Addded ", data: Data })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getBanner = async (req, res) => {
    try {
        const Banner = await banner.find();
        if (Banner.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "All banner Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getBannerById = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteBanner = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await banner.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ status: 200, message: "Banner delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteHelpandSupport = async (req, res) => {
    try {
        const findHelp = await helpandSupport.findById({ _id: req.params.id });
        if (!findHelp) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        } else {
            await helpandSupport.findOneAndDelete({ user: req.params.id })
            return res.status(200).json({ status: 200, message: "Data delete successfully.", data: {} })
        }
    } catch (err) {
        return res.status(501).send({ status: 501, message: "server error.", data: {} });
    }
};
exports.getAllHelpandSupport = async (req, res) => {
    try {
        const data = await helpandSupport.find();
        if (data.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        } else {
            return res.status(200).json({ status: 200, message: "Data found successfully.", data: data })
        }
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {} });
    }
};
exports.AddShiftPreference = async (req, res) => {
    try {
        const data = { toAmount: req.body.toAmount, fromAmount: req.body.fromAmount, hours: req.body.hours, salaryPer: req.body.salaryPer, dayType: req.body.dayType, type: req.body.type, }
        const Data = await shiftPreference.create(data);
        return res.status(200).json({ status: 200, message: "ShiftPreference is Added ", data: Data })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftPreference = async (req, res) => {
    try {
        const ShiftPreference = await shiftPreference.find();
        if (ShiftPreference.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "All shiftPreference Data found successfully.", data: ShiftPreference })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftPreferenceById = async (req, res) => {
    try {
        const ShiftPreference = await shiftPreference.findById({ _id: req.params.id });
        if (!ShiftPreference) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: ShiftPreference })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteShiftPreference = async (req, res) => {
    try {
        const ShiftPreference = await shiftPreference.findById({ _id: req.params.id });
        if (!ShiftPreference) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await shiftPreference.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ status: 200, message: "ShiftPreference delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.AddShiftTiming = async (req, res) => {
    try {
        const data = { to: req.body.to, from: req.body.from, type: req.body.type }
        const Data = await shiftTiming.create(data);
        return res.status(200).json({ status: 200, message: "ShiftTiming is Added ", data: Data })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftTiming = async (req, res) => {
    try {
        const ShiftTiming = await shiftTiming.find();
        if (ShiftTiming.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "All shiftTiming Data found successfully.", data: ShiftTiming })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getShiftTimingById = async (req, res) => {
    try {
        const ShiftTiming = await shiftTiming.findById({ _id: req.params.id });
        if (!ShiftTiming) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: ShiftTiming })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteShiftTiming = async (req, res) => {
    try {
        const ShiftTiming = await shiftTiming.findById({ _id: req.params.id });
        if (!ShiftTiming) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await shiftTiming.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ status: 200, message: "ShiftTiming delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.createSubscription = async (req, res) => {
    try {
        let findSubscription = await subscription.findOne({ name: req.body.name });
        if (findSubscription) {
            return res.json({ status: 409, message: 'subscription already created.', data: {} });
        } else {
            req.body.totalAmount = req.body.month * req.body.price;
            const newsubscription = await subscription.create(req.body);
            return res.json({ status: 200, message: 'subscription create successfully', data: newsubscription });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.getSubscription = async (req, res) => {
    try {
        const findSubscription = await subscription.find();
        return res.status(200).json({ status: 200, message: "Subscription detail successfully.", data: findSubscription });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.addContactDetails = async (req, res) => {
    try {
        let findContact = await ContactDetail.findOne();
        if (findContact) {
            req.body.mobileNumber = req.body.mobileNumber || findContact.mobileNumber;
            req.body.mobileNumberDescription = req.body.mobileNumberDescription || findContact.mobileNumberDescription;
            req.body.email = req.body.email || findContact.email;
            req.body.emailDescription = req.body.emailDescription || findContact.emailDescription;
            req.body.whatAppchat = req.body.whatAppchat || findContact.whatAppchat;
            req.body.whatAppchatDescription = req.body.whatAppchatDescription || findContact.whatAppchatDescription;
            let updateContact = await ContactDetail.findByIdAndUpdate({ _id: findContact._id }, { $set: req.body }, { new: true });
            if (updateContact) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: updateContact });
            }
        } else {
            let result2 = await ContactDetail.create(req.body);
            if (result2) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: result2 });
            }
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.viewContactDetails = async (req, res) => {
    try {
        let findcontactDetails = await ContactDetail.findOne();
        if (!findcontactDetails) {
            return res.status(404).send({ status: 404, message: "Contact Detail not found.", data: {} });
        } else {
            return res.status(200).send({ status: 200, message: "Contact Detail fetch successfully", data: findcontactDetails });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.AddPreferedArea = async (req, res) => {
    try {
        const data = { toAmount: req.body.toAmount, fromAmount: req.body.fromAmount, area: req.body.area, salaryPer: req.body.salaryPer, km: req.body.km }
        const Data = await preferedArea.create(data);
        return res.status(200).json({ status: 200, message: "Prefered Area is Added ", data: Data })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getPreferedArea = async (req, res) => {
    try {
        const PreferedArea = await preferedArea.find();
        if (PreferedArea.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "All Prefered Area Data found successfully.", data: PreferedArea })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getPreferedAreaById = async (req, res) => {
    try {
        const PreferedArea = await preferedArea.findById({ _id: req.params.id });
        if (!PreferedArea) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: PreferedArea })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeletePreferedArea = async (req, res) => {
    try {
        const PreferedArea = await preferedArea.findById({ _id: req.params.id });
        if (!PreferedArea) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await preferedArea.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ status: 200, message: "Prefered Area delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.driverOrderAmount = async (req, res) => {
    try {
        const findOrders = await deliveryOrder.findById({ _id: req.params.id });
        if (!findOrders) {
            return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
        } else {
            let obj = {
                driverId: findOrders.driverId,
                Orders: findOrders._id,
                amount: req.body.amount,
            }
            const saveOrder = await driverEarning.create(obj);
            if (saveOrder) {
                const findS = await User.findOne({ _id: findOrders.driverId });
                const update = await User.findByIdAndUpdate({ _id: findS._id }, { $set: { wallet: findS.wallet + Number(req.body.amount) } }, { new: true });
                return res.status(200).json({ message: "Order assign successfully.", status: 200, data: saveOrder });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await orderModel.find({ orderStatus: "confirmed", });
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
        const orders = await cancelReturnOrder.find({}).populate('Orders');
        if (orders.length == 0) {
            return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
        }
        return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getAllUser = async (req, res) => {
    try {
        const user = await User.find({ userType: "USER" });
        if (user.length == 0) {
            return res.status(404).send({ message: "not found" });
        }
        return res.status(200).send({ message: "Get user details.", data: user });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.getAllDriver = async (req, res) => {
    try {
        const user = await User.find({ userType: "DRIVER" });
        if (user.length == 0) {
            return res.status(404).send({ message: "not found" });
        }
        return res.status(200).send({ message: "Get user details.", data: user });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.getAllVendor = async (req, res) => {
    try {
        const user = await User.find({ userType: "VENDOR" });
        if (user.length == 0) {
            return res.status(404).send({ message: "not found" });
        }
        return res.status(200).send({ message: "Get user details.", data: user });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.viewUser = async (req, res) => {
    try {
        const data = await User.findById(req.params.id);
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "Data found successfully", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error", error: err.message, });
    }
};
exports.deleteUser = async (req, res) => {
    try {
        const data = await User.findByIdAndDelete(req.params.id);
        if (!data) {
            return res.status(400).send({ msg: "not found" });
        }
        return res.status(200).send({ msg: "deleted", data: data });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ msg: "internal server error", error: err.message, });
    }
};
exports.getComplaint = async (req, res, next) => {
    try {
        const orders = await complaint.find({}).populate('userId vendorId Orders Orders.$.productId')
        if (orders.length == 0) {
            return res.status(404).json({ status: 404, message: "Complain not found", data: {} });
        }
        return res.status(200).json({ status: 200, msg: "complain found", data: orders })
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.allTransactionUser = async (req, res) => {
    try {
        const data = await transaction.find({}).populate("user orderId");
        if (data.length == 0) {
            return res.status(404).json({ status: 404, message: "Transaction not found", data: {} });
        }
        return res.status(200).json({ status: 200, data: data });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.getdeliveryOrders = async (req, res, next) => {
    try {
        const orders = await deliveryOrder.find({}).populate('Orders userId driverId');
        if (orders.length == 0) {
            return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
        }
        return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getProducts = async (req, res) => {
    try {
        if (req.query.category) {
            const product = await Product.find({ vendorId: req.user._id, category: req.query.category }).populate('vendorId category subcategory');
            if (product.length == 0) {
                return res.status(404).json({ message: "No data found", data: {} });
            } else {
                return res.status(200).json({ message: "Product data found.", status: 200, data: product });
            }
        } else {
            const product = await Product.find({}).populate('vendorId category subcategory');
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