const {
  sequelize,
  AdsPlacement,
  Area,
  LocationType,
  AdsType,
  Report,
  ReportType,
  PermitRequest,
  BoardType,
  Board,
  LocationReport,
} = require("../models");
const Sequelize = require("sequelize");

const { AdsPlacementDAO } = require("../DAO/AdsPlacementDAO");
const { BoardDAO } = require("../DAO/BoardDAO");
const { AreaDAO } = require("../DAO/AreaDAO");
const { PermitRequestDAO } = require("../DAO/PermitRequestDAO");
const modelDC = require("../DC/importLibrary");
const { json } = require("body-parser");
const board = require("../models/board");
const {
  ReportDAO,
  SaveAdsReportStrategy,
  SaveBoardReportStrategy,
  SaveLocationReportStrategy,
} = require("../DAO/ReportDAO");

class CitizenController {
  constructor() {
    if (CitizenController.instance) {
      return CitizenController.instance;
    }

    CitizenController.instance = this;
  }

  async getSipulated(req, res, next) {
    const sipulated =
      await AdsPlacementDAO.getInstance().getAdsPlacementByStatus(
        "Đã quy hoạch"
      );
      
    const sipulatedGeoJSON = new modelDC.MapFeatureCollectionDC();

    for (let i = 0; i < sipulated.length; i++) {
      const adapter = new modelDC.AdsPlacementAdapterDC(sipulated[i]);
      sipulatedGeoJSON.appendToList(await adapter.getFeature());
    }

    res.json(JSON.stringify(sipulatedGeoJSON));
  }

  async getNonSipulated(req, res, next) {
    const nonSipulated =
      await AdsPlacementDAO.getInstance().getAdsPlacementByStatus(
        "Chưa quy hoạch"
      );

    const nonSipulatedGeoJSON = new modelDC.MapFeatureCollectionDC();

    for (let i = 0; i < nonSipulated.length; i++) {
      const adapter = new modelDC.AdsPlacementAdapterDC(nonSipulated[i]);
      nonSipulatedGeoJSON.appendToList(await adapter.getFeature());
    }

    res.json(JSON.stringify(nonSipulatedGeoJSON));
  }

  async getReport(req, res, next) {
    const reports =
      await AdsPlacementDAO.getInstance().getReportedAdsPlacement();

    const reportedGeoJSON = new modelDC.MapFeatureCollectionDC();

    for (let i = 0; i < reports.length; i++) {
      const adapter = new modelDC.AdsPlacementAdapterForReportPlaceDC(
        reports[i].adsPlacementDC,
        reports[i].reportDC
      );
      reportedGeoJSON.appendToList(await adapter.getFeature());
    }

    res.json(JSON.stringify(reportedGeoJSON));
  }

  async getAds(req, res, next) {
    const placementId = req.params.placementId;
    const placement = await AdsPlacement.findByPk(placementId);
    const respondData = [];
    const responseData = [];

    if (!placement) {
      return res
        .status(403)
        .send({ message: "Không tìm thấy vị trí quảng cáo" });
    }
    const boards = await BoardDAO.getInstance().getBoardByAdsPlacementId(
      placementId
    );

    for (let i = 0; i < boards.length; i++) {
      const permitRequest =
        await PermitRequestDAO.getInstance().findPermitRequestByBoardId(
          boards[i].id
        );

      if (permitRequest != null) {
        const wrapper = {
          ...boards[i],
          image: permitRequest.image,
          start: permitRequest.start,
          end: permitRequest.end,
          content: permitRequest.content,
          status: permitRequest.status,
        };

        responseData.push(wrapper);
      } else {
        const wrapper = {
          ...boards[i],
          image: "",
          start: "",
          end: "",
          content: "",
          status: "",
        };

        responseData.push(wrapper);
      }
    }

    res.json(JSON.stringify(responseData));
  }

  async postReportV2(req, res, next) {
    let { name, email, phone, type, content, board, location } = req.body;

    if (board == "undefined") {
      ReportDAO.getInstance().setSaveStrategy(new SaveAdsReportStrategy());
    } else {
      ReportDAO.getInstance().setSaveStrategy(new SaveBoardReportStrategy());
    }

    const files = req.files;
    let imageUrl;
    const path = [];

    if (files) {
      files.forEach((file) => {
        path.push(file.path);
      });
      imageUrl = path.join(", ");
      imageUrl = imageUrl.replace(/\\/g, "/");
    }

    if (type == "TGSP") {
      type = "Tố giác sai phạm";
    } else if (type == "DKND") {
      type = "Đăng ký nội dung";
    } else if (type == "DGYK") {
      type = "Đóng góp ý kiến";
    } else if (type == "GDTM") {
      type = "Giải đáp thắc mắc";
    }

    const reportType = await ReportDAO.getInstance().findReportTypeByType(type);

    if (reportType == null) {
      return;
    }

    const typeId = reportType.id;

    const result = await ReportDAO.getInstance().saveReport({
      name,
      email,
      phone,
      type,
      content,
      board,
      location,
      typeId,
      imageUrl,
    });

    res.status(200).json(JSON.stringify(result));
  }

  async getReportData(req, res, next) {
    let adsPlacementId = req.query.placement;
    let boardId = req.query.board;

    let reports;

    if (boardId != "undefined") {
      boardId = parseInt(boardId);

      reports = await ReportDAO.getInstance().findReportByBoardId(boardId);
    } else {
      reports = await ReportDAO.getInstance().findReportByAdsPlacementId(
        adsPlacementId
      );
    }

    res.json(JSON.stringify(reports));
  }

  async postSelfReport(req, res) {
    const reportIds = req.body.reportIds;

    const reports = await ReportDAO.getInstance().findReportsByListId(
      reportIds
    );
    res.json(JSON.stringify(reports));
  }

  async postReportRandomLocation(req, res) {
    let { name, email, phone, type, content, address, lng, lat } = req.body;
    const files = req.files;
    let imageUrl;
    const path = [];

    if (files) {
      files.forEach((file) => {
        path.push(file.path);
      });
      imageUrl = path.join(", ");
      imageUrl = imageUrl.replace(/\\/g, "/");
    }

    if (type == "TGSP") {
      type = "Tố giác sai phạm";
    } else if (type == "DKND") {
      type = "Đăng ký nội dung";
    } else if (type == "DGYK") {
      type = "Đóng góp ý kiến";
    } else if (type == "GDTM") {
      type = "Giải đáp thắc mắc";
    }

    const reportType = await ReportDAO.getInstance().findReportTypeByType(type);

    if (reportType == null) {
      return;
    }

    const typeId = reportType.id;

    const area = await fetch(
      `https://rsapi.goong.io/Geocode?latlng=${lat},%20${lng}&api_key=7iVK3dd86pgsEJggbfiky0xOrcRa9xJMNTtX22nS`
    );

    const jsonReturn = await area.json();
    const data = jsonReturn.results;
    let ward, district;

    if (data.length > 0) {
      (ward = data[0].compound.commune), (district = data[0].compound.district);
    }


    if (!ward.includes("0") && /\d/.test(ward)) {
      console.log(ward)
      let parts = ward.split(" ");

      if(parts[1].length==1) {
        parts[1]="0"+parts[1]
      }
      
      ward = parts[0] + " "  + parts[1];
    }

    if (!ward.includes("Phường")) {
      ward = "Phường " + ward;
    }

    const selectedArea = await AreaDAO.getInstance().findAreaByWardAndDistrict(
      ward,
      district
    );

    if (!selectedArea) {
      console.log(ward);
      console.log(district);
      return;
    }

    const areaId = selectedArea.id;
    ReportDAO.getInstance().setSaveStrategy(new SaveLocationReportStrategy());

    const newReport = await ReportDAO.getInstance().saveReport({
      name: name,
      email: email,
      phone: phone,
      content: content,
      imageUrl: imageUrl,
      status: "Chờ xử lý",
      address: address,
      long: parseFloat(lng).toFixed(6),
      lat: parseFloat(lat).toFixed(6),
      areaId: areaId,
      typeId: typeId,
    });

    console.log("Line 300"+newReport);

    return res.status(200).json({ newReport });
  }

  async getSelfReportByLngLat(req, res) {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const reportIds = req.body.reportIds;

    const reports = await ReportDAO.getInstance().findSelfReportByLngLat(
      lng,
      lat,
      reportIds
    );
    return res.json(JSON.stringify(reports));

  }

  async getReportByLngLat(req, res) {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);

    const results=await ReportDAO.getInstance().findReportByLngLat(lng,lat)
    return res.status(200).json(JSON.stringify(results));
  }
}

module.exports = CitizenController;
