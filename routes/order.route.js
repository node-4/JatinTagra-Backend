const auth = require("../controllers/orderController");
const { authJwt, authorizeRoles } = require("../middlewares");
module.exports = (app) => {
    app.get("/api/v1/order/getCart", [authJwt.verifyToken], auth.getCart);
    app.post("/api/v1/order/addToCart", [authJwt.verifyToken], auth.addToCart);
    app.post("/api/v1/order/checkout", [authJwt.verifyToken], auth.checkout);
    app.post("/api/v1/order/placeOrder/:orderId", [authJwt.verifyToken], auth.placeOrder);

};