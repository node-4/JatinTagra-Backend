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
const complaint = require("../models/complaint");
const Notification = require('../models/notificationModel');


exports.getCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id, userType: "USER" });
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
                                return res.status(200).json({ message: "cart data found.", status: 200, data: findCart });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.addToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id, userType: "USER" });
                if (!userData) {
                        return res.status(404).json({ message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                let findProduct = await Product.findById({ _id: req.body.productId });
                                if (findProduct) {
                                        if (findCart.products.length > 0) {
                                                for (let i = 0; i < findCart.products.length; i++) {
                                                        if ((findCart.products[i].productId).toString() == req.body.productId) {
                                                                return res.status(409).send({ status: 409, message: "Product already exit in cart." });
                                                        } else {
                                                                let price, discount;
                                                                if (findProduct.discountActive == true) {
                                                                        price = findProduct.discountPrice;
                                                                        discount = Number(findProduct.price - findProduct.discountPrice).toFixed(2);
                                                                } else {
                                                                        price = findProduct.price
                                                                }
                                                                let totalAmount = 0, total = price * req.body.quantity;
                                                                let product = {
                                                                        vendorId: findProduct.vendorId,
                                                                        category: findProduct.category,
                                                                        productId: findProduct._id,
                                                                        discountId: req.body.discountId,
                                                                        productPrice: price,
                                                                        discount: discount,
                                                                        gst: findProduct.gst * req.body.quantity,
                                                                        cGst: findProduct.cGst * req.body.quantity,
                                                                        sGst: findProduct.sGst * req.body.quantity,
                                                                        quantity: req.body.quantity,
                                                                        total: total,
                                                                };
                                                                let updateCart = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $push: { products: product } }, { new: true });
                                                                if (updateCart) {
                                                                        let tax = 0, shipping = 0, discounts = 0;
                                                                        for (let i = 0; i < updateCart.products.length; i++) {
                                                                                totalAmount = totalAmount + updateCart.products[i].total;
                                                                                tax = tax + updateCart.products[i].gst;
                                                                                discounts = discounts + updateCart.products[i].discount
                                                                        }
                                                                        let paidAmount = Number(totalAmount + tax + shipping).toFixed(2);
                                                                        console.log(paidAmount, "", totalAmount, "", discount, "", tax, "", shipping);
                                                                        let updateCart1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { totalAmount: totalAmount, discount: discounts, paidAmount: paidAmount, tax: tax, shipping: shipping, totalItem: updateCart.products.length, } }, { new: true })
                                                                        return res.status(200).json({ status: 200, message: "Product successfully add to cart.", data: updateCart1 })
                                                                }
                                                        }
                                                }
                                        } else {
                                                let findDiscount = await Discount.findOne({ $or: [{ productId: findProduct._id }, { category: findProduct.category }, { vendorId: findProduct.vendorId }] })
                                                if (findDiscount) {
                                                        req.body.discountId = findDiscount._id;
                                                }
                                                let price, discount;
                                                if (findProduct.discountActive == true) {
                                                        price = findProduct.discountPrice;
                                                        discount = Number(findProduct.price - findProduct.discountPrice).toFixed(2);
                                                } else {
                                                        price = findProduct.price
                                                }
                                                let totalAmount = 0, products = [], total = price * req.body.quantity;
                                                let product = {
                                                        vendorId: findProduct.vendorId,
                                                        category: findProduct.category,
                                                        productId: findProduct._id,
                                                        discountId: req.body.discountId,
                                                        productPrice: price,
                                                        discount: discount,
                                                        gst: findProduct.gst * req.body.quantity,
                                                        cGst: findProduct.cGst * req.body.quantity,
                                                        sGst: findProduct.sGst * req.body.quantity,
                                                        quantity: req.body.quantity,
                                                        total: total,
                                                };
                                                products.push(product);
                                                let tax = 0, shipping = 0;
                                                for (let i = 0; i < products.length; i++) {
                                                        totalAmount = totalAmount + products[i].total;
                                                        tax = tax + products[i].gst
                                                }
                                                let paidAmount = Number(totalAmount + tax + shipping).toFixed(2);
                                                let obj = {
                                                        userId: userData._id,
                                                        products: products,
                                                        totalAmount: totalAmount,
                                                        discount: discount,
                                                        paidAmount: paidAmount,
                                                        tax: tax,
                                                        shipping: shipping,
                                                        totalItem: products.length,
                                                }
                                                const Data = await Cart.create(obj);
                                                return res.status(200).json({ status: 200, message: "Product successfully add to cart. ", data: Data })
                                        }
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
                                        let price, discount;
                                        if (findProduct.discountActive == true) {
                                                price = findProduct.discountPrice;
                                                discount = Number(findProduct.price - findProduct.discountPrice).toFixed(2);
                                        } else {
                                                price = findProduct.price
                                        }
                                        let totalAmount = 0, products = [], total = price * req.body.quantity;
                                        let product = {
                                                vendorId: findProduct.vendorId,
                                                category: findProduct.category,
                                                productId: findProduct._id,
                                                discountId: req.body.discountId,
                                                productPrice: price,
                                                discount: discount,
                                                gst: findProduct.gst * req.body.quantity,
                                                cGst: findProduct.cGst * req.body.quantity,
                                                sGst: findProduct.sGst * req.body.quantity,
                                                quantity: req.body.quantity,
                                                total: total,
                                        };
                                        products.push(product);
                                        let tax = 0, shipping = 0;
                                        for (let i = 0; i < products.length; i++) {
                                                totalAmount = totalAmount + products[i].total;
                                                tax = tax + products[i].gst
                                        }
                                        let paidAmount = Number(totalAmount + tax + shipping).toFixed(2);
                                        let obj = {
                                                userId: userData._id,
                                                products: products,
                                                totalAmount: totalAmount,
                                                discount: discount,
                                                paidAmount: paidAmount,
                                                tax: tax,
                                                shipping: shipping,
                                                totalItem: products.length,
                                        }
                                        const Data = await Cart.create(obj);
                                        return res.status(200).json({ status: 200, message: "Product successfully add to cart. ", data: Data })
                                } else {
                                        return res.status(404).json({ message: "No data found", data: {} });
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateQuantity = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found or token expired." });
                } else {
                        let findCart = await Cart.findOne({ userId: user._id });
                        if (findCart) {
                                let products = [], count = 0, productLength = findCart.products.length;
                                for (var i = 0; i < findCart.products.length; i++) {
                                        if ((findCart.products[i]._id).toString() === req.body.products_id) {
                                                let findProduct = await Product.findById({ _id: (findCart.products[i].productId).toString() });
                                                let price, discount;
                                                if (findProduct.discountActive == true) {
                                                        price = findProduct.discountPrice;
                                                        discount = Number(findProduct.price - findProduct.discountPrice).toFixed(2);
                                                } else {
                                                        price = findProduct.price
                                                }
                                                let total = price * req.body.quantity;
                                                let obj = {
                                                        vendorId: findProduct.vendorId,
                                                        category: findProduct.category,
                                                        productId: findProduct._id,
                                                        discountId: req.body.discountId,
                                                        productPrice: price,
                                                        discount: discount,
                                                        gst: findProduct.gst * req.body.quantity,
                                                        cGst: findProduct.cGst * req.body.quantity,
                                                        sGst: findProduct.sGst * req.body.quantity,
                                                        quantity: req.body.quantity,
                                                        total: total,
                                                };
                                                products.push(obj)
                                                count++
                                        } else {
                                                let findProduct = await Product.findById({ _id: (findCart.products[i].productId).toString() });
                                                let price, discount;
                                                if (findProduct.discountActive == true) {
                                                        price = findProduct.discountPrice;
                                                        discount = Number(findProduct.price - findProduct.discountPrice).toFixed(2);
                                                } else {
                                                        price = findProduct.price
                                                }
                                                let total = price * req.body.quantity;
                                                let obj = {
                                                        vendorId: findCart.products[i].vendorId,
                                                        category: findCart.products[i].category,
                                                        productId: findCart.products[i].productId,
                                                        discountId: findCart.products[i].discountId,
                                                        productPrice: price,
                                                        discount: discount,
                                                        gst: findProduct.gst * findCart.products[i].quantity,
                                                        cGst: findProduct.cGst * findCart.products[i].quantity,
                                                        sGst: findProduct.sGst * findCart.products[i].quantity,
                                                        quantity: findCart.products[i].quantity,
                                                        total: total,
                                                };
                                                products.push(obj)
                                                count++
                                        }
                                }
                                if (count == productLength) {
                                        let updateCart = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { products: products } }, { new: true });
                                        if (updateCart) {
                                                let tax = 0, shipping = 0, discounts = 0, totalAmount = 0;
                                                for (let i = 0; i < updateCart.products.length; i++) {
                                                        totalAmount = totalAmount + updateCart.products[i].total;
                                                        tax = tax + updateCart.products[i].gst;
                                                        discounts = discounts + updateCart.products[i].discount
                                                }
                                                let paidAmount = Number(totalAmount + tax + shipping).toFixed(2);
                                                console.log(paidAmount, "", totalAmount, "", tax, "", shipping);
                                                let updateCart1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { totalAmount: totalAmount, discount: discounts, paidAmount: paidAmount, tax: tax, shipping: shipping, totalItem: updateCart.products.length, } }, { new: true })
                                                return res.status(200).json({ status: 200, message: "Product successfully add to cart.", data: updateCart1 })
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Cart not found." });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteProductfromCart = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found or token expired." });
                } else {
                        let findCart = await Cart.findOne({ userId: user._id });
                        if (findCart) {
                                let products = [], count = 0;
                                for (let i = 0; i < findCart.products.length; i++) {
                                        if ((findCart.products[i]._id).toString() != req.params.cartProductId) {
                                                products.push(findCart.products[i])
                                                count++
                                        }
                                }
                                if (count == findCart.products.length - 1) {
                                        let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { products: products } }, { new: true });
                                        if (update) {
                                                let tax = 0, shipping = 0, discounts = 0, totalAmount = 0;
                                                for (let i = 0; i < updateCart.products.length; i++) {
                                                        totalAmount = totalAmount + updateCart.products[i].total;
                                                        tax = tax + updateCart.products[i].gst;
                                                        discounts = discounts + updateCart.products[i].discount
                                                }
                                                let paidAmount = Number(totalAmount + tax + shipping).toFixed(2);
                                                let update1 = await Cart.findByIdAndUpdate({ _id: update._id }, { $set: { totalAmount: totalAmount, discount: discounts, paidAmount: paidAmount, tax: tax, shipping: shipping, totalItem: updateCart.products.length } }, { new: true });
                                                return res.status(200).json({ status: 200, message: "Product delete from cart Successfully.", data: update1 })
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Cart not found." });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteCart = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found or token expired." });
                } else {
                        let findCart = await Cart.findOne({ userId: user._id });
                        if (findCart) {
                                await Cart.findByIdAndDelete({ _id: findCart._id });
                                let findCarts = await Cart.findOne({ userId: user._id });
                                if (findCarts) {
                                        return res.status(200).json({ status: 200, message: "cart not delete.", data: findCarts })
                                } else {
                                        return res.status(200).json({ status: 200, message: "cart delete Successfully.", data: {} })
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Cart not found." });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.addAdressToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id })
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                if (findCart.products.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add product in your cart.", data: {} });
                                } else {
                                        const data1 = await Address.findById({ _id: req.params.id });
                                        if (data1) {
                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { houseFlat: data1.houseFlat, appartment: data1.appartment, landMark: data1.landMark, houseType: data1.houseType }, }, { new: true });
                                                return res.status(200).json({ status: 200, message: "Address add to cart Successfully.", data: update1 })
                                        } else {
                                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                                        }
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.checkout = async (req, res) => {
        try {
                let findOrder = await orderModel.find({ user: req.user._id, orderStatus: "unconfirmed" });
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
                        let findCart = await Cart.findOne({ userId: req.user._id });
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
                                                gst: findCart.products[i].gst,
                                                address: {
                                                        houseFlat: findCart.houseFlat,
                                                        appartment: findCart.appartment,
                                                        landMark: findCart.landMark,
                                                        houseType: findCart.houseType,
                                                },
                                        }
                                        console.log(obj);
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
                                                                        houseFlat: findCart.houseFlat,
                                                                        appartment: findCart.appartment,
                                                                        landMark: findCart.landMark,
                                                                        houseType: findCart.houseType,
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
                                return res.status(200).json({ status: 200, message: "Order create successfully. ", data: findUserOrder })
                        }
                } else {
                        let findCart = await Cart.findOne({ userId: req.user._id });
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
                                                discountPrice: findCart.products[i].discount,
                                                total: findCart.totalAmount,
                                                paidAmount: findCart.paidAmount,
                                                cGst: findCart.products[i].cGst,
                                                sGst: findCart.products[i].sGst,
                                                gst: findCart.products[i].gst,
                                                address: {
                                                        houseFlat: findCart.houseFlat,
                                                        appartment: findCart.appartment,
                                                        landMark: findCart.landMark,
                                                        houseType: findCart.houseType,
                                                },
                                        }
                                        console.log(obj);
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
                                                                        houseFlat: findCart.houseFlat,
                                                                        appartment: findCart.appartment,
                                                                        landMark: findCart.landMark,
                                                                        houseType: findCart.houseType,
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
                                return res.status(200).json({ status: 200, message: "Order create successfully. ", data: findUserOrder })
                        }
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
// exports.placeOrder = async (req, res) => {
//         try {
//                 let findUserOrder = await userOrder.findOne({ orderId: req.params.orderId });
//                 if (findUserOrder) {
//                         if (req.body.paymentStatus == "paid") {
//                                 let update = await userOrder.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
//                                 if (update) {
//                                         for (let i = 0; i < update.Orders.length; i++) {
//                                                 let update1 = await orderModel.findByIdAndUpdate({ _id: update.Orders[i]._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
//                                         }
//                                         let obj = {
//                                                 user: req.user._id,
//                                                 orderId: findUserOrder._id,
//                                                 date: Date.now(),
//                                                 amount: findUserOrder.paidAmount,
//                                                 type: "Debit",
//                                         };
//                                         const data1 = await transaction.create(obj);
//                                         const welcomeMessage = `Welcome, ${userCreate.fullName}! Thank you for registering.`;
//                                         const welcomeNotification = new Notification({
//                                                 recipient: userCreate._id,
//                                                 content: welcomeMessage,
//                                                 type: 'welcome',
//                                         });
//                                         await welcomeNotification.save();
//                                         return res.status(200).json({ message: "Payment success.", status: 200, data: update });
//                                 }
//                         }
//                         if (req.body.paymentStatus == "failed") {
//                                 return res.status(201).json({ message: "Payment failed.", status: 201, orderId: findUserOrder });
//                         }

//                 } else {
//                         return res.status(404).json({ message: "No data found", data: {} });
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };
exports.placeOrder = async (req, res) => {
        try {
                const findUserOrder = await userOrder.findOne({ orderId: req.params.orderId });

                if (findUserOrder) {
                        if (req.body.paymentStatus === "paid") {
                                const update = await userOrder.findByIdAndUpdate(
                                        { _id: findUserOrder._id },
                                        { $set: { orderStatus: "confirmed", paymentStatus: "paid" } },
                                        { new: true }
                                );

                                for (let i = 0; i < update.Orders.length; i++) {
                                        await orderModel.findByIdAndUpdate(
                                                { _id: update.Orders[i]._id },
                                                { $set: { orderStatus: "confirmed", paymentStatus: "paid" } },
                                                { new: true }
                                        );
                                }

                                const transactionData = {
                                        user: req.user._id,
                                        orderId: findUserOrder._id,
                                        date: Date.now(),
                                        amount: findUserOrder.paidAmount,
                                        type: "Debit",
                                };

                                const createdTransaction = await transaction.create(transactionData);

                                const welcomeMessage = `Welcome, Your OrdrId is this: ${findUserOrder._id}! Your payment was successful.`;
                                const welcomeNotification = new Notification({
                                        recipient: req.user._id,
                                        content: welcomeMessage,
                                        type: 'welcome',
                                });

                                await welcomeNotification.save();

                                return res.status(200).json({
                                        status: 200,
                                        message: "Payment success.",
                                        data: update,
                                });
                        }

                        if (req.body.paymentStatus === "failed") {
                                return res.status(201).json({
                                        status: 201,
                                        message: "Payment failed.",
                                        orderId: findUserOrder,
                                });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).send({ status: 500, message: "Server error.", data: {} });
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
                                return res.status(200).json({ message: `Order ${req.body.orderStatus} Successfully.`, status: 200, data: update });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(400).json({ message: err.message });
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
exports.addComplain = async (req, res) => {
        try {
                const orders = await orderModel.findById({ _id: req.params.orderId });
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                let obj = {
                        userId: req.user._id,
                        vendorId: orders.vendorId,
                        Orders: orders._id,
                        reason: req.body.reason,
                }
                const Data = await complaint.create(obj);
                return res.status(200).json({ message: "Complaint  send successfully.", status: 200, data: Data })
        } catch (err) {
                return res.status(500).send({ msg: "internal server error", error: err.message, });
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
