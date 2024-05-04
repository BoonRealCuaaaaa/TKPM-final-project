const express = require('express');
const title = require('../middlewares/title.js');
const router = express.Router();
const multer = require("multer");
const WardDistrictController = require('../controllers/ward_district.js');

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

const wardDistrictController = new WardDistrictController();

router.get("/home", title.role, wardDistrictController.home);
router.post("/home", title.role, upload.single("img"), wardDistrictController.addPermitRequest);
router.get("/list-adsplacements", title.role, wardDistrictController.showListAdsplacements);
router.post("/list-adsplacements", title.role, wardDistrictController.editAdsplacement);
router.get("/list-boards/:id", title.role, wardDistrictController.showListBoards);
router.get("/list-boards", title.role, wardDistrictController.showListBoards);
router.post("/list-boards", title.role, wardDistrictController.editBoard);
router.get("/my-requests", title.role, wardDistrictController.showMyRequests);
router.post("/my-requests", wardDistrictController.deleteRequest);
router.get("/list-reports", title.role, wardDistrictController.showListReports);
router.get("/list-reports/:id", title.role, wardDistrictController.showReportDetails);
//router.get("/list-reports/location-report/:id", title.role, wardDistrictController.showLocationReportDetails);
router.post("/list-reports/", title.role, wardDistrictController.updateReportDetails);
//router.post("/list-reports/location-report", title.role, wardDistrictController.updateLocationReportDetails);

module.exports = router;