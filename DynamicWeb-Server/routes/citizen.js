const express = require("express");
//const citizenController = require("../controllers/citizen.js");
const multer = require("multer");
const router = express.Router();
const CitizenController = require("../controllers/citizen.js")

//Multer config
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/reports");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") +
        "-" +
        file.originalname.replace(/\s/g, "-")
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

const citizenController=new CitizenController()


router.get("/get-sipulated", citizenController.getSipulated);
router.get("/get-nonsipulated", citizenController.getNonSipulated);
router.get("/get-report", citizenController.getReport);
router.get("/get-ads/:placementId", citizenController.getAds);
router.post(
  "/post-report",
  upload.array("files", 2),
  citizenController.postReportV2
);
router.post(
  "/post-report-random-location",
  upload.array("files", 2),
  citizenController.postReportRandomLocation
);
router.get("/get-report-data", citizenController.getReportData);
router.post("/post-self-report", citizenController.postSelfReport);
router.post("/get-report-by-lnglat", citizenController.getSelfReportByLngLat);
router.get("/get-report-lnglat", citizenController.getReportByLngLat);

module.exports = router;
