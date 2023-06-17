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
};