const express = require("express");
const router = express.Router();
const { isAdmin } = require("../../middleware/admin.middleware.js");
const multer = require("multer");
const { storage } = require("../../cloudConfig.js");
const upload = multer({ storage });

const adminController = require("../../controller/Admin.controller/services.controller.js");

router.get("/login", (req, res) => {
  res.render("admin/pages/login.ejs");
});

router.post("/login", adminController.login);

router.get("/logout", (req, res) => {
  req.session.admin = undefined;
  res.redirect("/admin/login");
});

router.get("/AdminRegister", (req, res) => {
  res.render("admin/pages/register.ejs");
});

router.post("/register", adminController.signup);

router.get("/", isAdmin, adminController.manageHome);
router.get("/manageUser", isAdmin, adminController.manageUser);

router.get("/addElectrician", isAdmin, (req, res) => {
  res.render("admin/pages/addElectrician.ejs");
});

router.post("/addElectrician", isAdmin, adminController.addElectrician);

router.get("/electrician/:id", isAdmin, adminController.updateElectrician);
router.put("/electrician/:id", isAdmin, adminController.updateElectricianlogic);
router.delete("/electrician/:id", isAdmin, adminController.deleteElectrician);

router.get("/manageElectrician", isAdmin, adminController.manageElectrician);

router
  .route("/addCategory", isAdmin)

  .get(adminController.addcategoryform)
  .post(upload.single("category_image"), adminController.addcategorylogic);

router.get("/manageCategory", isAdmin, adminController.managecategory);

router.get("/deleteCategory/:id", isAdmin, adminController.deletecategory);

router
  .route("/addService", isAdmin)
  .get(adminController.addserviceform)
  .post(upload.single("service_image"), adminController.addservicelogic);

router.get("/manageService", adminController.manageservice);

router
  .route("/service/:id", isAdmin)
  .get(adminController.serviceupdateform)
  .put(upload.single("service_image"), adminController.serviceupdatelogic)
  .delete(adminController.deleteservice);

router.get("/assignElectrician", isAdmin, adminController.assignElectrician);
router.post(
  "/assignElectrician",
  isAdmin,
  adminController.assignElectricianLogic
);

router.get("/viewBooking", isAdmin, adminController.viewOrder);
router.get("/manageOrders", isAdmin, adminController.manageOrder);

router.post("/updateOrder", isAdmin, adminController.updateOrder);

module.exports = router;
