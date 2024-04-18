const express = require('express');
const controller = require('../controllers/ward_district.js');
const title = require('../middlewares/title.js');
const router = express.Router();
const multer = require("multer");

//Multer config
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images/permitRequests");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        new Date().toISOString().replace(/:/g, "-") +
          "-" +
          file.originalname.replace(" ", "-")
      );
    },
});
  
const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
};
  
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

router.get("/home", title.role, controller.home);
router.post("/home", title.role, upload.single("img"), controller.addPermitRequest);
router.get("/list-adsplacements", title.role, controller.showListAdsplacements);
router.post("/list-adsplacements", title.role, controller.editAdsplacement);
router.get("/list-boards/:id", title.role, controller.showListBoards);
router.get("/list-boards", title.role, controller.showListBoards);
router.post("/list-boards", title.role, controller.editBoard);
router.get("/my-requests", title.role, controller.showMyRequests);
router.post("/my-requests", controller.deleteRequest);
router.get("/list-reports", title.role, controller.showListReports);
router.get("/list-reports/:id", title.role, controller.showReportDetails);
router.get("/list-reports/location-report/:id", title.role, controller.showLocationReportDetails);
router.post("/list-reports/", title.role, controller.updateReportDetails);
router.post("/list-reports/location-report", title.role, controller.updateLocationReportDetails);

module.exports = router;