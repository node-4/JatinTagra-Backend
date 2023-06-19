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
const Cart = require("../models/cartModel");
const orderModel = require("../models/orders/orderModel");
const userOrder = require("../models/orders/userOrder");
const cancelReturnOrder = require("../models/orders/cancelReturnOrder");

exports.getCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user.id, userType: "USER" });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id }).populate("userId")
                                .populate("products.discountId")
                                .populate("products.vendorId")
                                .populate("products.category")
                                .populate("products.productId")
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                res.status(200).json({ message: "cart data found.", status: 200, data: findCart });
                        }
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.addToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user.id, userType: "USER" });
                if (!userData) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                let findProduct = await Product.findById({ _id: req.body.productId });
                                if (findProduct) {
                                        let findDiscount = await Discount.findOne({ $or: [{ productId: findProduct._id }, { category: findProduct.category }, { vendorId: findProduct.vendorId }] })
                                        let totalAmount = 0, total = findProduct.price * req.body.quantity, discountPrice = 0;
                                        if (findDiscount) {
                                                req.body.discountId = findDiscount._id;
                                        }
                                        let product = {
                                                vendorId: findProduct.vendorId,
                                                category: findProduct.category,
                                                productId: findProduct._id,
                                                discountId: req.body.discountId,
                                                productPrice: findProduct.price,
                                                cGst: findProduct.cGst * req.body.quantity,
                                                sGst: findProduct.sGst * req.body.quantity,
                                                quantity: req.body.quantity,
                                                discountPrice: findDiscount.discountPrice || 0,
                                                total: total,
                                        };
                                        let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $push: { products: product } }, { new: true })
                                        for (let i = 0; i < update.products.length; i++) {
                                                totalAmount = totalAmount + update.products[i].total;
                                                discountPrice = discountPrice + update.products[i].discountPrice;
                                        }
                                        let obj;
                                        if (totalAmount > 200) {
                                                obj = {
                                                        totalAmount: totalAmount,
                                                        paidAmount: totalAmount - discountPrice,
                                                        discountPrice: discountPrice,
                                                        totalItem: update.products.length,
                                                }
                                        } else {
                                                obj = {
                                                        totalAmount: totalAmount,
                                                        paidAmount: totalAmount,
                                                        discountPrice: discountPrice,
                                                        totalItem: update.products.length,
                                                }
                                        }
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: obj }, { new: true })
                                        res.status(200).json({ status: 200, message: "Product successfully add to cart. ", data: update1 })
                                } else {
                                        return res.status(404).json({ message: "No data found", data: {} });
                                }
                        } else {
                                let findProduct = await Product.findById({ _id: req.body.productId });
                                if (findProduct) {
                                        let findDiscount = await Discount.findOne({ $or: [{ productId: findProduct._id }, { category: findProduct.category }, { vendorId: findProduct.vendorId }] })
                                        if (findDiscount) {
                                                req.body.discountId = findDiscount._id;
                                        }
                                        let totalAmount = 0, products = [], total = findProduct.price * req.body.quantity;
                                        let product = {
                                                vendorId: findProduct.vendorId,
                                                category: findProduct.category,
                                                productId: findProduct._id,
                                                discountId: req.body.discountId,
                                                productPrice: findProduct.price,
                                                cGst: findProduct.cGst * req.body.quantity,
                                                sGst: findProduct.sGst * req.body.quantity,
                                                quantity: req.body.quantity,
                                                discountPrice: findDiscount.discountPrice,
                                                total: total,
                                        };
                                        products.push(product);
                                        for (let i = 0; i < products.length; i++) {
                                                totalAmount = totalAmount + products[i].total
                                        }
                                        let obj = {
                                                userId: userData._id,
                                                products: products,
                                                totalAmount: totalAmount,
                                                totalItem: products.length,
                                        }
                                        const Data = await Cart.create(obj);
                                        res.status(200).json({ status: 200, message: "Product successfully add to cart. ", data: Data })
                                } else {
                                        return res.status(404).json({ message: "No data found", data: {} });
                                }
                        }
                }
        } catch (error) {
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.checkout = async (req, res) => {
        try {
                let findOrder = await orderModel.find({ user: req.user.id, orderStatus: "unconfirmed" });
                if (findOrder.length > 0) {
                        for (let i = 0; i < findOrder.length; i++) {
                                await userOrder.findOneAndDelete({ orderId: findOrder[i].orderId });
                                let findOrders = await orderModel.find({ orderId: findOrder[i].orderId });
                                if (findOrders.length > 0) {
                                        for (let i = 0; i < findOrders.length; i++) {
                                                await orderModel.findByIdAndDelete({ _id: findOrders[i]._id });
                                        }
                                }
                        }
                        let findCart = await Cart.findOne({ userId: req.user.id });
                        if (findCart) {
                                let orderId = await reffralCode();
                                for (let i = 0; i < findCart.products.length; i++) {
                                        let obj = {
                                                orderId: orderId,
                                                userId: findCart.userId,
                                                vendorId: findCart.products[i].vendorId,
                                                category: findCart.products[i].category,
                                                productId: findCart.products[i].productId,
                                                discountId: findCart.products[i].discountId,
                                                productPrice: findCart.products[i].productPrice,
                                                quantity: findCart.products[i].quantity,
                                                discountPrice: findCart.products[i].discountPrice,
                                                total: findCart.products[i].total,
                                                paidAmount: findCart.products[i].paidAmount,
                                                cGst: findCart.products[i].cGst,
                                                sGst: findCart.products[i].sGst,
                                                address: {
                                                        street1: req.body.street1,
                                                        street2: req.body.street2,
                                                        city: req.body.city,
                                                        state: req.body.state,
                                                        country: req.body.country
                                                },
                                        }
                                        const Data = await orderModel.create(obj);
                                        if (Data) {
                                                let findUserOrder = await userOrder.findOne({ orderId: orderId });
                                                if (findUserOrder) {
                                                        await userOrder.findByIdAndUpdate({ _id: findUserOrder._id }, { $push: { Orders: Data._id } }, { new: true });
                                                } else {
                                                        let Orders = [];
                                                        Orders.push(Data._id)
                                                        let obj1 = {
                                                                userId: findCart.userId,
                                                                orderId: orderId,
                                                                Orders: Orders,
                                                                address: {
                                                                        street1: req.body.street1,
                                                                        street2: req.body.street2,
                                                                        city: req.body.city,
                                                                        state: req.body.state,
                                                                        country: req.body.country
                                                                },
                                                                discountPrice: findCart.discountPrice,
                                                                total: findCart.total,
                                                                paidAmount: findCart.paidAmount,
                                                                totalItem: findCart.totalItem
                                                        };
                                                        await userOrder.create(obj1);
                                                }
                                        }
                                }
                                let findUserOrder = await userOrder.findOne({ orderId: orderId }).populate('Orders');
                                res.status(200).json({ status: 200, message: "Order create successfully. ", data: findUserOrder })
                        }
                } else {
                        let findCart = await Cart.findOne({ userId: req.user.id });
                        if (findCart) {
                                let orderId = await reffralCode();
                                for (let i = 0; i < findCart.products.length; i++) {
                                        let obj = {
                                                orderId: orderId,
                                                userId: findCart.userId,
                                                vendorId: findCart.products[i].vendorId,
                                                category: findCart.products[i].category,
                                                productId: findCart.products[i].productId,
                                                discountId: findCart.products[i].discountId,
                                                productPrice: findCart.products[i].productPrice,
                                                quantity: findCart.products[i].quantity,
                                                discountPrice: findCart.products[i].discountPrice,
                                                total: findCart.products[i].total,
                                                paidAmount: findCart.products[i].paidAmount,
                                                cGst: findCart.products[i].cGst,
                                                sGst: findCart.products[i].sGst,
                                                address: {
                                                        street1: req.body.street1,
                                                        street2: req.body.street2,
                                                        city: req.body.city,
                                                        state: req.body.state,
                                                        country: req.body.country
                                                },
                                        }
                                        const Data = await orderModel.create(obj);
                                        if (Data) {
                                                let findUserOrder = await userOrder.findOne({ orderId: orderId });
                                                if (findUserOrder) {
                                                        await userOrder.findByIdAndUpdate({ _id: findUserOrder._id }, { $push: { Orders: Data._id } }, { new: true });
                                                } else {
                                                        let Orders = [];
                                                        Orders.push(Data._id)
                                                        let obj1 = {
                                                                userId: findCart.userId,
                                                                orderId: orderId,
                                                                Orders: Orders,
                                                                address: {
                                                                        street1: req.body.street1,
                                                                        street2: req.body.street2,
                                                                        city: req.body.city,
                                                                        state: req.body.state,
                                                                        country: req.body.country
                                                                },
                                                                discountPrice: findCart.discountPrice,
                                                                total: findCart.total,
                                                                paidAmount: findCart.paidAmount,
                                                                totalItem: findCart.totalItem
                                                        };
                                                        await userOrder.create(obj1);
                                                }
                                        }
                                }
                                let findUserOrder = await userOrder.findOne({ orderId: orderId }).populate('Orders');
                                res.status(200).json({ status: 200, message: "Order create successfully. ", data: findUserOrder })
                        }
                }
        } catch (error) {
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.placeOrder = async (req, res) => {
        try {
                let findUserOrder = await userOrder.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        if (req.body.paymentStatus == "paid") {
                                let update = await userOrder.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                                if (update) {
                                        for (let i = 0; i < update.Orders.length; i++) {
                                                let update = await orderModel.findByIdAndUpdate({ _id: update.Orders[i]._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                                        }
                                        res.status(200).json({ message: "Payment success.", status: 200, data: update });
                                }
                        }
                        if (req.body.paymentStatus == "failed") {
                                res.status(201).json({ message: "Payment failed.", status: 201, orderId: orderId });
                        }

                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelReturnOrder = async (req, res, next) => {
        try {
                const orders = await orderModel.findById({ _id: req.params.id });
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                } else {
                        let obj = {
                                userId: orders.userId,
                                vendorId: orders.vendorId,
                                Orders: orders._id,
                                reason: req.body.reason,
                                orderStatus: req.body.orderStatus,
                        }
                        const data = await cancelReturnOrder.create(obj);
                        let update = await orderModel.findByIdAndUpdate({ _id: orders._id }, { $set: { returnOrder: data._id, returnStatus: req.body.orderStatus } }, { new: true }).populate('returnOrder');
                        if (update) {
                                res.status(200).json({ message: `Order ${req.body.orderStatus} Successfully.`, status: 200, data: update });
                        }
                }
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAllOrders = async (req, res, next) => {
        try {
                const orders = await userOrder.find({ userId: req.user._id, orderStatus: "confirmed" }).populate('Orders');
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getOrders = async (req, res, next) => {
        try {
                const orders = await orderModel.find({ userId: req.user._id, orderStatus: "confirmed", returnStatus: "" });
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
                const orders = await cancelReturnOrder.find({ userId: req.user._id }).populate('Orders');
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
                const orders = await orderModel.findById({ _id: req.params.id }).populate('vendorId userId category productId discountId returnOrder');
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
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
