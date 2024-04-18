const express = require("express");
const controller = require("../controllers/departmentController");
const router = express.Router();

/*-------------------- AccountManagement --------------------*/
router.get("/accountManagement", controller.accountManagement);
router.get(
  "/accountManagement/api/wards",
  controller.getWardsWithSpecificDistrict
);
router.post("/accountManagement", controller.createAccount);
router.put("/accountManagement", controller.editAccount);
router.delete("/accountManagement", controller.deleteAccount);

// adplaceManagement
router.get("/adplaceManagement", controller.adplaceManagement);
router.post("/adplaceManagement", controller.createAdplace);
router.put("/adplaceManagement", controller.editAdplace);
router.delete("/adplaceManagement", controller.deleteAdplace);
// boardManagement
router.get("/boardManagement", controller.boardManagement);
router.post("/boardManagement", controller.createBoard);
router.put("/boardManagement", controller.editBoard);
router.delete("/boardManagement", controller.deleteBoard);

//View AdsRequests
router.get("/viewAdsRequest", controller.viewAdsRequests);
router.get("/viewAdsRequest/:id", controller.detailRequest);
router.post("/acceptOrDenyAdsRequest", controller.acceptOrDenyAdsRequest);

// View Reports
router.get("/viewReport", controller.viewReports);
router.post("/viewReport/api/statisticReport", controller.statisticReport);
router.get(
  "/viewReport/api/getWaitingAndProcessedReport",
  controller.getWaitingAndProcessedReport
);
router.get("/viewReport/:id", controller.detailReport);

// Accept or deny edit Board requests
router.get("/acceptOrDenyEditRequest", controller.viewEditRequest);
router.post("/acceptOrDenyEditRequest", controller.acceptOrDenyEditRequest);
// Accept or deny edit Adplace requests
router.get("/acceptOrDenyEditAdplaceRequest", controller.viewEditAdplaceRequest);
router.post("/acceptOrDenyEditAdplaceRequest", controller.acceptOrDenyEditAdplaceRequest);
// Area management
router.get("/areaManagement", controller.getAreas);
router.post("/editArea", controller.postEditArea);
router.post("/addArea", controller.postAddArea);

// adTypeManagement
router.get("/adTypeManagement", controller.adTypeManagement);
router.post("/adTypeManagement", controller.createAdType);
router.put("/adTypeManagement", controller.editAdType);
router.delete("/adTypeManagement", controller.deleteAdType);
//locationTypeManagement
router.get("/locationTypeManagement", controller.locationTypeManagement);
router.post("/locationTypeManagement", controller.createLocationType);
router.put("/locationTypeManagement", controller.editLocationType);
router.delete("/locationTypeManagement", controller.deleteLocationType);
//boardTypeManagement
router.get("/boardTypeManagement", controller.boardTypeManagement);
router.post("/boardTypeManagement", controller.createBoardType);
router.put("/boardTypeManagement", controller.editBoardType);
router.delete("/boardTypeManagement", controller.deleteBoardType);
//reportTypeManagement
router.get("/reportTypeManagement", controller.reportTypeManagement);
router.post("/reportTypeManagement", controller.createReportType);
router.put("/reportTypeManagement", controller.editReportType);
router.delete("/reportTypeManagement", controller.deleteReportType);
module.exports = router;
