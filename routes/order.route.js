const auth = require("../controllers/orderController");
const { authJwt, authorizeRoles } = require("../middlewares");
module.exports = (app) => {
    app.get("/api/v1/order/getCart", [authJwt.verifyToken], auth.getCart);
    app.post("/api/v1/order/addToCart", [authJwt.verifyToken], auth.addToCart);
    app.put("/api/v1/order/addAdressToCart/:id", [authJwt.verifyToken], auth.addAdressToCart);
    app.put("/api/v1/order/updateQuantity", [authJwt.verifyToken], auth.updateQuantity);
    app.put("/api/v1/order/deleteProductfromCart/:cartProductId", [authJwt.verifyToken], auth.deleteProductfromCart);
    app.delete("/api/v1/order/deleteCart", [authJwt.verifyToken], auth.deleteCart);
    app.post("/api/v1/order/checkout", [authJwt.verifyToken], auth.checkout);
    app.post("/api/v1/order/placeOrder/:orderId", [authJwt.verifyToken], auth.placeOrder);
    app.get("/api/v1/order/allOrders", [authJwt.verifyToken], auth.getAllOrders);
    app.get("/api/v1/order/Orders", [authJwt.verifyToken], auth.getOrders);
    app.get("/api/v1/order/viewOrder/:id", [authJwt.verifyToken], auth.getOrderbyId);
    app.put("/api/v1/order/cancelReturnOrder/:id", [authJwt.verifyToken], auth.cancelReturnOrder);
    app.get("/api/v1/order/getcancelReturnOrder", [authJwt.verifyToken], auth.getcancelReturnOrder);
    app.get("/api/v1/user/allTransactionUser", [authJwt.verifyToken], auth.allTransactionUser);
    app.get("/api/v1/user/allcreditTransactionUser", [authJwt.verifyToken], auth.allcreditTransactionUser);
    app.get("/api/v1/user/allDebitTransactionUser", [authJwt.verifyToken], auth.allDebitTransactionUser);
    app.post("/api/v1/user/addComplain/:orderId", [authJwt.verifyToken], auth.addComplain);
    app.post("/api/v1/user/update/ProductQuery", auth.getProductsdsQuery);
    app.get("/api/v1/user/getProductsDealOfTheDay", [authJwt.verifyToken], auth.getProductsDealOfTheDay);
    app.get('/api/v1/user/order-history', [authJwt.verifyToken], auth.getOrderHistory);

};