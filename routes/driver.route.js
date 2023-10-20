const { validateUser } = require("../middlewares");
const auth = require("../controllers/driver.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
const path = require("path");
var multer = require("multer");
const authConfig = require("../configs/auth.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "product", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
var cpUpload3 = upload.fields([{ name: 'panCard', maxCount: 1 },
{ name: 'drivingLicense', maxCount: 1 },
{ name: 'passbook', maxCount: 1 },
{ name: 'aadharCard', maxCount: 1 }
]);

module.exports = (app) => {
    app.post("/api/v1/driver/signInWithPhone", auth.signInWithPhone);
    app.post("/api/v1/driver/loginWithPhone", auth.loginWithPhone);
    app.post("/api/v1/driver/:id", auth.verifyOtp);
    app.post("/api/v1/driver/resendOtp/:id", auth.resendOTP);
    app.get("/api/v1/driver/getProfile", [authJwt.verifyToken], auth.getProfile);
    app.post("/api/v1/driver/completeRegistration/:id", auth.completeRegistration);
    app.post("/api/v1/driver/updateBankDetails/:id", auth.updateBankDetails);
    app.post("/api/v1/driver/updateDocument/:id", cpUpload3, auth.updateDocument);
    app.get("/api/v1/driver/allOrders", [authJwt.verifyToken], auth.getOrders);
    app.put("/api/v1/driver/updateOrderStatus/:id", [authJwt.verifyToken], auth.updateOrderStatus);
    app.get("/api/v1/driver/allPackageOrders", [authJwt.verifyToken], auth.getPackageOrders);
    app.put("/api/v1/driver/driverUpdate", [authJwt.verifyToken], auth.driverUpdate);
};