const { validateUser } = require("../middlewares");
const auth = require("../controllers/admin.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
const { cpUpload0, upload, upload1, upload2, cpUpload, categoryUpload, subCategoryUpload, bannerUpload, videoImage } = require('../middlewares/imageUpload')
module.exports = (app) => {
    app.post("/api/v1/admin/registration", auth.registration);
    app.post("/api/v1/admin/login", auth.signin);
    app.post("/api/v1/admin/resetPassword", auth.resetPassword);
    app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
    app.post("/api/v1/Category/addCategory", [authJwt.verifyToken], categoryUpload.single('image'), auth.createCategory);
    app.get("/api/v1/Category/allCategory", auth.getCategories);
    app.put("/api/v1/Category/updateCategory/:id", [authJwt.verifyToken], categoryUpload.single('image'), auth.updateCategory);
    app.delete("/api/v1/Category/deleteCategory/:id", [authJwt.verifyToken], auth.removeCategory);
    app.post("/api/v1/SubCategory/addSubcategory", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.createSubCategory);
    app.get("/api/v1/SubCategory/:id", auth.getIdSubCategory);
    app.put("/api/v1/SubCategory/updateSubcategory/:id", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.updateSubCategory);
    app.delete("/api/v1/SubCategory/deleteSubcategory/:id", [authJwt.verifyToken], auth.deleteSubCategory);
    app.get("/api/v1/SubCategory/all/Subcategory", auth.getSubCategory);
    app.get("/api/v1/SubCategory/all/SubCategoryForAdmin", auth.getSubCategoryForAdmin);
    app.get("/api/v1/SubCategory/paginate/SubCategoriesSearch", auth.paginateSubCategoriesSearch);
    app.get("/api/v1/SubCategory/allSubcategoryById/:categoryId", auth.getSubCategoryByCategoryId);
    app.get('/api/v1/admin/help/getAllQuery', [authJwt.verifyToken], auth.getAllHelpandSupport);
    app.delete('/api/v1/admin/help/delete/:id', [authJwt.verifyToken], auth.DeleteHelpandSupport);
    app.post("/api/v1/Banner/AddBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.AddBanner);
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
    app.post('/api/v1/subscription/createSubscription', auth.createSubscription);
    app.get('/api/v1/subscription/getSubscription', auth.getSubscription);
    app.post("/api/v1/admin/addContactDetails", [authJwt.verifyToken], auth.addContactDetails);
    app.get("/api/v1/admin/viewContactDetails", auth.viewContactDetails);
    app.post("/api/v1/PreferedArea/AddPreferedArea", [authJwt.verifyToken], auth.AddPreferedArea);
    app.get("/api/v1/PreferedArea/allPreferedArea", auth.getPreferedArea);
    app.get("/api/v1/PreferedArea/getPreferedAreaById/:id", auth.getPreferedAreaById);
    app.delete("/api/v1/PreferedArea/deletePreferedArea/:id", [authJwt.verifyToken], auth.DeletePreferedArea);
    app.put("/api/v1/admin/driverOrderAmount/:id", auth.driverOrderAmount)
    app.put("/api/v1/admin/driverbonusOrderAmount/:id", auth.driverbonusOrderAmount)
    app.get("/api/v1/admin/allOrders", /*[authJwt.verifyToken],*/ auth.getOrders);
    app.get("/api/v1/admin/alldeliveryOrders", [authJwt.verifyToken], auth.getdeliveryOrders);
    app.get("/api/v1/admin/getcancelReturnOrder", [authJwt.verifyToken], auth.getcancelReturnOrder);
    app.get("/api/v1/admin/allComplaint", [authJwt.verifyToken], auth.getComplaint);
    app.get("/api/v1/admin/allTransactionUser", [authJwt.verifyToken], auth.allTransactionUser);
    app.get("/api/v1/admin/allProducts", auth.getProducts);
    app.get("/api/v1/admin/getAllUser", auth.getAllUser);
    app.get("/api/v1/admin/getAllDriver", auth.getAllDriver);
    app.get("/api/v1/admin/getAllVendor", auth.getAllVendor);
    app.get("/api/v1/admin/viewUser/:id", auth.viewUser);
    app.delete("/api/v1/admin/deleteUser/:id", [authJwt.verifyToken], auth.deleteUser);
    app.put('/api/v1/admin/user/verify-admin/:userId', [authJwt.verifyToken], auth.verifyAdminStatus);
    app.post('/api/v1/admin/announcement/create', [authJwt.verifyToken], auth.createAnnouncement);
    app.get('/api/v1/admin/announcement/all', [authJwt.verifyToken], auth.getAllAnnouncements);
    app.get('/api/v1/admin/announcement/:announcementId', [authJwt.verifyToken], auth.getAnnouncementById);
    app.put('/api/v1/admin/announcement/:announcementId', [authJwt.verifyToken], auth.updateAnnouncement);
    app.delete('/api/v1/admin/announcement/:announcementId', [authJwt.verifyToken], auth.deleteAnnouncement);
    app.post('/api/v1/admin/videos', [authJwt.verifyToken], videoImage.single('image'), auth.createVideo);
    app.get('/api/v1/admin/videos', [authJwt.verifyToken], auth.getAllVideos);


};