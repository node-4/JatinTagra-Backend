const { validateUser } = require("../middlewares");
const auth = require("../controllers/driver.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads"); }, filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("/api/v1/driver/signInWithPhone", auth.signInWithPhone);
    app.post("/api/v1/driver/loginWithPhone", auth.loginWithPhone);
    app.post("/api/v1/driver/:id", auth.verifyOtp);
    app.post("/api/v1/driver/resendOtp/:id", auth.resendOTP);
    app.get("/api/v1/driver/getProfile", [authJwt.verifyToken], auth.getProfile);
    app.post("/api/v1/driver/completeRegistration/:id", auth.completeRegistration);
    app.post("/api/v1/driver/updateBankDetails/:id", auth.updateBankDetails);
    app.post("/api/v1/driver/updateDocument/:id", auth.updateDocument);
    app.get("/api/v1/driver/allOrders", [authJwt.verifyToken], auth.getOrders);
    app.put("/api/v1/driver/updateOrderStatus/:id", [authJwt.verifyToken], auth.updateOrderStatus);
};