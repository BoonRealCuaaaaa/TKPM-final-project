
const express = require("express");
const DepartmentController = require("../controllers/departmentController");
const router = express.Router();
const departmentController = new DepartmentController();
/*-------------------- AccountManagement --------------------*/
router.get("/accountManagement", departmentController.accountManagement);
router.get(
  "/accountManagement/api/wards",
  departmentController.getWardsWithSpecificDistrict
);
router.post("/accountManagement", departmentController.createAccount);
router.put("/accountManagement", departmentController.editAccount);
router.delete("/accountManagement", departmentController.deleteAccount);
// adplaceManagement
router.get("/adplaceManagement", departmentController.adplaceManagement);
router.post("/adplaceManagement", departmentController.createAdplace);
router.put("/adplaceManagement", departmentController.editAdplace);
router.delete("/adplaceManagement", departmentController.deleteAdplace);
// boardManagement
router.get("/boardManagement", departmentController.boardManagement);
router.post("/boardManagement", departmentController.createBoard);
router.put("/boardManagement", departmentController.editBoard);
router.delete("/boardManagement", departmentController.deleteBoard);
//View AdsRequests
router.get("/viewAdsRequest", departmentController.viewAdsRequests);
router.get("/viewAdsRequest/:id", departmentController.detailRequest);
router.post("/acceptOrDenyAdsRequest", departmentController.acceptOrDenyAdsRequest);
// View Reports
router.get("/viewReport", departmentController.viewReports);
router.post("/viewReport/api/statisticReport", departmentController.statisticReport);
router.get(
  "/viewReport/api/getWaitingAndProcessedReport",
  departmentController.getWaitingAndProcessedReport
);
router.get("/viewReport/:id", departmentController.detailReport);
// Accept or deny edit Board requests
router.get("/acceptOrDenyEditRequest", departmentController.viewEditRequest);
router.post("/acceptOrDenyEditRequest", departmentController.acceptOrDenyEditRequest);
// Accept or deny edit Adplace requests
router.get(
  "/acceptOrDenyEditAdplaceRequest",
  departmentController.viewEditAdplaceRequest
);
router.post(
  "/acceptOrDenyEditAdplaceRequest",
  departmentController.acceptOrDenyEditAdplaceRequest
);
// Area management
router.get("/areaManagement", departmentController.getAreas);
router.post("/editArea", departmentController.postEditArea);
router.post("/addArea", departmentController.postAddArea);
// adTypeManagement
router.get("/adTypeManagement", departmentController.adTypeManagement);
router.post("/adTypeManagement", departmentController.createAdType);
router.put("/adTypeManagement", departmentController.editAdType);
router.delete("/adTypeManagement", departmentController.deleteAdType);
//locationTypeManagement
router.get("/locationTypeManagement", departmentController.locationTypeManagement);
router.post("/locationTypeManagement", departmentController.createLocationType);
router.put("/locationTypeManagement", departmentController.editLocationType);
router.delete("/locationTypeManagement", departmentController.deleteLocationType);
//boardTypeManagement
router.get("/boardTypeManagement", departmentController.boardTypeManagement);
router.post("/boardTypeManagement", departmentController.createBoardType);
router.put("/boardTypeManagement", departmentController.editBoardType);
router.delete("/boardTypeManagement", departmentController.deleteBoardType);
//reportTypeManagement
router.get("/reportTypeManagement", departmentController.reportTypeManagement);
router.post("/reportTypeManagement", departmentController.createReportType);
router.put("/reportTypeManagement", departmentController.editReportType);
router.delete("/reportTypeManagement", departmentController.deleteReportType);
module.exports = router;
