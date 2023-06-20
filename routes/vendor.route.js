const { validateUser } = require("../middlewares");
const auth = require("../controllers/vendor.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads"); }, filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("/api/v1/vendor/registration", auth.registration);
    app.put("/api/v1/vendor/completeRegistration/:id", auth.completeRegistration);
    app.post("/api/v1/vendor/login", auth.signin);
    app.post("/api/v1/vendor/loginWithPhone", auth.loginWithPhone);
    app.post("/api/v1/vendor/:id", auth.verifyOtp);
    app.get("/api/v1/vendor/getProfile", [authJwt.verifyToken], auth.getProfile);
    app.post("/api/v1/vendor/resendOtp/:id", auth.resendOTP);
    app.post("/api/v1/vendor/resetPassword/:id", auth.resetPassword);
    app.post("/api/v1/vendor/socialLogin", auth.socialLogin);
    app.get("/api/v1/vendor/getCategory", auth.getCategories);
    app.post("/api/v1/product/addProduct", [authJwt.verifyToken], auth.addProduct);
    app.get("/api/v1/product/allProducts", [authJwt.verifyToken], auth.getProducts);
    app.get("/api/v1/product/viewProduct/:id", auth.getProduct);
    app.put("/api/v1/product/editProduct/:id", [authJwt.verifyToken], auth.editProduct);
    app.delete("/api/v1/product/deleteProduct/:id", [authJwt.verifyToken], auth.deleteProduct);
    app.post("/api/v1/Discount/addDiscount", [authJwt.verifyToken], auth.addDiscount);
    app.get("/api/v1/Discount/allDiscount", [authJwt.verifyToken], auth.getDiscount);
    app.get("/api/v1/vendor/getProductReviews/:id", [authJwt.verifyToken], auth.getProductReviews);
    app.delete("/api/v1/vendor/deleteReview/:productId/:id", [authJwt.verifyToken], auth.deleteReview);
    app.post('/api/v1/vendor/addWallet', [authJwt.verifyToken], auth.addMoney);
    app.post('/api/v1/vendor/removeWallet', [authJwt.verifyToken], auth.removeMoney);
    app.get('/api/v1/vendor/getwallet', [authJwt.verifyToken], auth.getWallet);
    app.get("/api/v1/vendor/allOrders", [authJwt.verifyToken], auth.getOrders);
    app.get("/api/v1/vendor/getcancelReturnOrder", [authJwt.verifyToken], auth.getcancelReturnOrder);
    app.get("/api/v1/vendor/viewOrder/:id", [authJwt.verifyToken], auth.getOrderbyId);
    app.put("/api/v1/vendor/updateOrderStatus/:id", [authJwt.verifyToken], auth.updateOrderStatus);
    app.put("/api/v1/vendor/assignOrder/:id", [authJwt.verifyToken], auth.assignOrder);
    app.get("/api/v1/vendor/allTransactionUser", [authJwt.verifyToken], auth.allTransactionUser);
    app.get("/api/v1/vendor/allcreditTransactionUser", [authJwt.verifyToken], auth.allcreditTransactionUser);
    app.get("/api/v1/vendor/allDebitTransactionUser", [authJwt.verifyToken], auth.allDebitTransactionUser);

};