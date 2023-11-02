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
const storage1 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "product", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const dutyImage = multer({ storage: storage1 });

module.exports = (app) => {
    app.post("/api/v1/driver/signInWithPhone", auth.signInWithPhone);
    app.post("/api/v1/driver/loginWithPhone", auth.loginWithPhone);
    app.post("/api/v1/driver/:id", auth.verifyOtp);
    app.post("/api/v1/driver/resendOtp/:id", auth.resendOTP);
    app.get("/api/v1/driver/getProfile", [authJwt.verifyToken], auth.getProfile);
    app.post("/api/v1/driver/completeRegistration/:id", auth.completeRegistration);
    app.post("/api/v1/driver/update/BankDetails/:id", auth.updateBankDetails);
    app.post("/api/v1/driver/updateDocument/:id", cpUpload3, auth.updateDocument);
    app.get("/api/v1/driver/allOrders", [authJwt.verifyToken], auth.getOrders);
    app.get('/api/v1/driver/orders/:id', [authJwt.verifyToken], auth.getOrderById);
    app.put("/api/v1/driver/updateOrderStatus/:id", [authJwt.verifyToken], auth.updateOrderStatus);
    app.put("/api/v1/driver/acceptOrRejectOrderStatus/:orderId", [authJwt.verifyToken], auth.acceptOrRejectOrderStatus);
    app.get("/api/v1/driver/allPackageOrders", [authJwt.verifyToken], auth.getPackageOrders);
    app.put("/api/v1/driver/driverUpdate", [authJwt.verifyToken], auth.driverUpdate);
    app.get("/api/v1/driver/driverEarning", [authJwt.verifyToken], auth.driverEarning);
    app.get("/api/v1/driver/driverweeklyEarning", [authJwt.verifyToken], auth.driverweeklyEarning);
    app.get("/api/v1/driver/driverweeklybonusEarning", [authJwt.verifyToken], auth.driverweeklybonusEarning);
    app.get("/api/v1/driver/driverweeklyorderEarning", [authJwt.verifyToken], auth.driverweeklyorderEarning);
    app.get("/api/v1/driver/todayOrderEarnings", [authJwt.verifyToken], auth.todayOrderEarnings);
    app.get("/api/v1/driver/driverEarningandincentive", [authJwt.verifyToken], auth.driverEarningandincentive);
    app.post('/api/v1/driver/duty-tracking/h', [authJwt.verifyToken], dutyImage.single('image'), auth.createDutyTracking);
    app.get('/api/v1/driver/duty-tracking', [authJwt.verifyToken], auth.getAllDutyTracking);
    app.get('/api/v1/driver/duty-tracking/:id', [authJwt.verifyToken], auth.getDutyTrackingById);
    app.put('/api/v1/driver/duty-tracking/:id', [authJwt.verifyToken], auth.updateDutyTracking);
    app.delete('/api/v1/driver/duty-tracking/:id', [authJwt.verifyToken], auth.deleteDutyTracking);

};