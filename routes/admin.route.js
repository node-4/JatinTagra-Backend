const { validateUser } = require("../middlewares");
const auth = require("../controllers/admin.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads"); }, filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });
module.exports = (app) => {
    app.post("/api/v1/admin/registration", auth.registration);
    app.post("/api/v1/admin/login", auth.signin);
    app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
    app.post("/api/v1/Category/addCategory", [authJwt.verifyToken], auth.createCategory);
    app.get("/api/v1/Category/allCategory", auth.getCategories);
    app.put("/api/v1/Category/updateCategory/:id", [authJwt.verifyToken], auth.updateCategory);
    app.delete("/api/v1/Category/deleteCategory/:id", [authJwt.verifyToken], auth.removeCategory);
    app.get('/api/v1/admin/help/getAllQuery', [authJwt.verifyToken], auth.getAllHelpandSupport);
    app.delete('/api/v1/admin/help/delete/:id', [authJwt.verifyToken], auth.DeleteHelpandSupport);
    app.post("/api/v1/Banner/AddBanner", [authJwt.verifyToken], auth.AddBanner);
    app.get("/api/v1/Banner/allBanner", auth.getBanner);
    app.get("/api/v1/Banner/getBannerById/:id", auth.getBannerById);
    app.delete("/api/v1/Banner/deleteBanner/:id", [authJwt.verifyToken], auth.DeleteBanner);
    app.post("/api/v1/ShiftPreference/AddShiftPreference", [authJwt.verifyToken], auth.AddShiftPreference);
    app.get("/api/v1/ShiftPreference/allShiftPreference", auth.getShiftPreference);
    app.get("/api/v1/ShiftPreference/getShiftPreferenceById/:id", auth.getShiftPreferenceById);
    app.delete("/api/v1/ShiftPreference/deleteShiftPreference/:id", [authJwt.verifyToken], auth.DeleteShiftPreference);
    app.post("/api/v1/ShiftTiming/AddShiftTiming", [authJwt.verifyToken], auth.AddShiftTiming);
    app.get("/api/v1/ShiftTiming/allShiftTiming", auth.getShiftTiming);
    app.get("/api/v1/ShiftTiming/getShiftTimingById/:id", auth.getShiftTimingById);
    app.delete("/api/v1/ShiftTiming/deleteShiftTiming/:id", [authJwt.verifyToken], auth.DeleteShiftTiming);
};