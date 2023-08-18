const { validateUser } = require("../middlewares");
const auth = require("../controllers/user.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads"); }, filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("/api/v1/user/registration", auth.registration);
    app.post("/api/v1/user/login", auth.signin);
    app.post("/api/v1/user/loginWithPhone", auth.loginWithPhone);
    app.post("/api/v1/user/:id", auth.verifyOtp);
    app.get("/api/v1/user/getProfile", [authJwt.verifyToken], auth.getProfile);
    app.put("/api/v1/user/updateProfile", [authJwt.verifyToken], auth.updateProfile);
    app.post("/api/v1/user/resendOtp/:id", auth.resendOTP);
    app.post("/api/v1/user/resetPassword/:id", auth.resetPassword);
    app.post("/api/v1/user/socialLogin", auth.socialLogin);
    app.get("/api/v1/user/categories", auth.getCategories);
    app.get("/api/v1/user/allProducts", auth.getProducts);
    app.get("/api/v1/user/viewProduct/:id", auth.getProduct);
    app.post("/api/v1/user/createWishlist/:id", [authJwt.verifyToken], auth.createWishlist);
    app.post("/api/v1/user/removeFromWishlist/:id", [authJwt.verifyToken], auth.removeFromWishlist);
    app.get("/api/v1/user/myWishlist", [authJwt.verifyToken], auth.myWishlist);
    app.post("/api/v1/product/createProductReview", [authJwt.verifyToken], auth.createProductReview);
    app.get("/api/v1/product/getProductReviews/:id", [authJwt.verifyToken], auth.getProductReviews);
    app.post('/api/v1/user/help/addQuery', [authJwt.verifyToken], auth.AddQuery);
    app.get('/api/v1/user/help/getAllQuery', [authJwt.verifyToken], auth.getAllQuery);
    app.post('/api/v1/user/addWallet', [authJwt.verifyToken], auth.addMoney);
    app.post('/api/v1/user/removeWallet', [authJwt.verifyToken], auth.removeMoney);
    app.get('/api/v1/user/getwallet', [authJwt.verifyToken], auth.getWallet);
    app.post("/api/v1/user/address/new", [authJwt.verifyToken], auth.createAddress);
    app.get("/api/v1/user/getAddress", [authJwt.verifyToken], auth.getallAddress);
    app.put("/api/v1/user/address/:id", [authJwt.verifyToken], auth.updateAddress)
    app.delete('/api/v1/user/address/:id', [authJwt.verifyToken], auth.deleteAddress);
    app.get('/api/v1/user/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
    app.post("/api/v1/user/card/new", [authJwt.verifyToken], auth.createPaymentCard);
    app.put("/api/v1/user/card/update/:id", [authJwt.verifyToken], auth.updatePaymentCard);
    app.get("/api/v1/user/card/getAllCard", [authJwt.verifyToken], auth.getPaymentCard);
    app.delete("/api/v1/user/card/delete/:id", [authJwt.verifyToken], auth.DeletePaymentCard);
};