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
const { PermitRequestDAO } = require("../DAO/PermitRequestDAO");
const modelDC = require("../DC/importLibrary");
const { json } = require("body-parser");
const board = require("../models/board");

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
        reports[i].report
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

    for (let i=0;i<boards.length;i++) {
      const permitRequest = await
        PermitRequestDAO.getInstance().findPermitRequestByBoardId(board2[i].id);


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

  async postReport(req, res, next) {
    let { name, email, phone, type, content, board, location } = req.body;

    if (board == "undefined") {
      board = undefined;
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

    const dbquery = await ReportType.findOne({ where: { type: type } });

    if (dbquery == null) {
      return;
    }

    const typeId = dbquery.id;
    const placement = await AdsPlacement.findOne({ where: { id: location } });

    const newReport = await Report.create({
      submission_time: new Date(),
      name: name,
      email: email,
      phone: phone,
      reportContent: content,
      image: imageUrl,
      ReportTypeId: typeId,
      BoardId: board,
      AdsPlacementId: location,
      status: "Chưa xử lý",
    });

    newReport.save();

    if (board != undefined) {
      let permitRequest = await PermitRequest.findOne({
        where: { BoardId: board },
      });

      permitRequest.status = "Bị báo cáo";
      permitRequest.save();
    }

    res
      .status(200)
      .json({ newReport, lng: placement.long, lat: placement.lat });
  }

  async getReportData(req, res, next) {
    let adsPlacementId = req.query.placement;
    let boardId = req.query.board;

    let reports;

    if (boardId != "undefined") {
      boardId = parseInt(boardId);

      reports = await Report.findAll({
        where: { BoardId: boardId },
        include: [{ model: ReportType, required: true }],
      });
    } else {
      reports = await Report.findAll({
        where: { AdsPlacementId: adsPlacementId },
        include: [{ model: ReportType, required: true }],
      });
    }

    res.json(JSON.stringify(reports));
  }

  async postSelfReport(req, res) {
    const reportIdsType1 = req.body.reportIdsType1;
    const reportIdsType2 = req.body.reportIdsType2;

    const reports = await Report.findAll({
      where: { id: { [Sequelize.Op.in]: reportIdsType1 } },
      include: [{ model: ReportType, required: true }],
    });

    const reports2 = await LocationReport.findAll({
      where: { id: { [Sequelize.Op.in]: reportIdsType2 } },
      include: [
        {
          model: ReportType,
          required: true,
        },
      ],
    });

    const combined = reports.concat(reports2);
    res.json(JSON.stringify(combined));
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

    const dbquery = await ReportType.findOne({ where: { type: type } });

    if (dbquery == null) {
      return;
    }

    const typeId = dbquery.id;

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
      let parts = ward.split(" ");
      ward = parts[0] + " " + "0" + parts[1];
    }

    if (!ward.includes("Phường")) {
      ward = "Phường " + ward;
    }

    const selectedArea = await Area.findOne({
      where: {
        ward: ward.trim(),
        district: district.trim(),
      },
    });

    if (!selectedArea) {
      console.log(ward);
      console.log(district);
      return;
    }

    const areaId = selectedArea.id;

    const newReport = await LocationReport.create({
      name: name,
      email: email,
      phone: phone,
      reportContent: content,
      image: imageUrl,
      status: "Chờ xử lý",
      address: address,
      long: parseFloat(lng).toFixed(6),
      lat: parseFloat(lat).toFixed(6),
      AreaId: areaId,
      ReportTypeId: typeId,
    });

    await newReport.save();
    return res.status(200).json({ newReport });
  }

  async getSelfReportByLngLat(req, res) {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const type = req.query.type;
    const reportIds = req.body.reportIds;

    if (type == 1) {
      const reports = await Report.findAll({
        where: { id: { [Sequelize.Op.in]: reportIds } },
        include: [
          { model: ReportType, required: true },
          {
            model: AdsPlacement,
            where: {
              long: lng,
              lat: lat,
            },
          },
        ],
      });

      return res.json(JSON.stringify(reports));
    } else if (type == 2) {
      const reports = await LocationReport.findAll({
        where: { id: { [Sequelize.Op.in]: reportIds }, long: lng, lat: lat },
        include: [{ model: ReportType, required: true }],
      });

      return res.json(JSON.stringify(reports));
    }
  }

  async getReportByLngLat(req, res) {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);

    const report1 = await Report.findAll({
      include: [
        { model: AdsPlacement, where: { long: lng, lat: lat } },
        { model: ReportType, required: true },
      ],
    });

    report1.forEach((report) => {
      report.dataValues.type = 1;
    });

    const report2 = await LocationReport.findAll({
      where: {
        long: lng,
        lat: lat,
      },
      include: [{ model: ReportType, required: true }],
    });

    report2.forEach((report) => {
      report.dataValues.type = 2;
    });

    const combined = report1.concat(report2);
    return res.status(200).json(JSON.stringify(combined));
  }
}

module.exports = CitizenController;
