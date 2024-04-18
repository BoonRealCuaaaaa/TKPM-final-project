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

class CitizenController {
  constructor(data) {
    if (CitizenController.instance) {
      return CitizenController.instance;
    }

    CitizenController.instance = this;
    this.data = data;
  }

  async getSipulated(req, res, next) {
    const sipulated = await AdsPlacement.findAll({
      where: {
        status: "Đã quy hoạch",
      },
      include: [
        {
          model: Area,
          required: true,
        },
        {
          model: LocationType,
          required: true,
        },
        {
          model: AdsType,
          required: true,
        },
      ],
    });

    const sipulatedGeoJSON = {
      type: "FeatureCollection",
      features: [],
    };

    for (let i = 0; i < sipulated.length; i++) {
      const boards = await Board.findAll({
        where: {
          adsPlacementId: sipulated[i].id,
        },
      });

      const feature = {
        type: "Feature",
        properties: {
          id: sipulated[i].id,
          area: {
            ward: sipulated[i].Area.ward,
            district: sipulated[i].Area.district,
          },
          locationType: sipulated[i].LocationType.locationType,
          adsType: sipulated[i].AdsType.type,
          address: sipulated[i].address,
          status: "Đã quy hoạch",
          numBoard: boards.length,
        },
        geometry: {
          coordinates: [sipulated[i].long, sipulated[i].lat],
          type: "Point",
        },
      };

      sipulatedGeoJSON.features.push(feature);
    }

    res.json(JSON.stringify(sipulatedGeoJSON));
  }

  async getNonSipulated(req, res, next) {
    const nonSipulated = await AdsPlacement.findAll({
      where: {
        status: "Chưa quy hoạch",
      },
      include: [
        {
          model: Area,
          required: true,
        },
        {
          model: LocationType,
          required: true,
        },
        {
          model: AdsType,
          required: true,
        },
      ],
    });

    const nonSipulatedGeoJSON = {
      type: "FeatureCollection",
      features: [],
    };

    for (let i = 0; i < nonSipulated.length; i++) {
      const boards = await Board.findAll({
        where: {
          adsPlacementId: nonSipulated[i].id,
        },
      });

      const feature = {
        type: "Feature",
        properties: {
          id: nonSipulated[i].id,
          area: {
            ward: nonSipulated[i].Area.ward,
            district: nonSipulated[i].Area.district,
          },
          locationType: nonSipulated[i].LocationType.locationType,
          adsType: nonSipulated[i].AdsType.type,
          address: nonSipulated[i].address,
          status: "Chưa quy hoạch",
          numBoard: boards.length,
        },
        geometry: {
          coordinates: [nonSipulated[i].long, nonSipulated[i].lat],
          type: "Point",
        },
      };

      nonSipulatedGeoJSON.features.push(feature);
    }

    res.json(JSON.stringify(nonSipulatedGeoJSON));
  }

  async getReport(req, res, next) {
    const reported = await Report.findAll({
      where: {
        AdsPlacementId: {
          [Sequelize.Op.not]: null,
        },
        status: {
          [Sequelize.Op.not]: "Đã xử lý",
        },
      },
      include: [
        {
          model: AdsPlacement,
          required: true,
          include: [
            {
              model: Area,
              required: true,
            },
            {
              model: LocationType,
              required: true,
            },
            {
              model: AdsType,
              required: true,
            },
          ],
        },
        {
          model: ReportType,
          required: true,
        },
      ],
    });

    const reportedTable2 = await LocationReport.findAll({
      where: {
        status: {
          [Sequelize.Op.not]: "Đã xử lý",
        },
      },
      include: [
        { model: Area, required: true },
        {
          model: ReportType,
          required: true,
        },
      ],
    });

    const reportedGeoJSON = {
      type: "FeatureCollection",
      features: [],
    };

    const placement = [];

    reported.forEach((data) => {
      if (placement.indexOf(data.AdsPlacement.id) == -1) {
        placement.push(data.AdsPlacement.id);
        const feature = {
          type: "Feature",
          properties: {
            area: {
              ward: data.AdsPlacement.Area.ward,
              district: data.AdsPlacement.Area.district,
            },
            reportType: data.ReportType.type,
            address: data.AdsPlacement.address,
            lng: data.AdsPlacement.long,
            lat: data.AdsPlacement.lat,
          },
          geometry: {
            coordinates: [data.AdsPlacement.long, data.AdsPlacement.lat],
            type: "Point",
          },
        };
        reportedGeoJSON.features.push(feature);
      }
    });

    const placement2 = [];

    reportedTable2.forEach((data) => {
      if (placement2.indexOf([data.long, data.lat]) == -1) {
        placement2.push([data.long, data.lat]);
        const feature = {
          type: "Feature",
          properties: {
            area: {
              ward: data.Area.ward,
              district: data.Area.district,
            },
            reportType: data.ReportType.type,
            address: data.address,
            lng: data.long,
            lat: data.lat,
          },
          geometry: {
            coordinates: [data.long, data.lat],
            type: "Point",
          },
        };
        reportedGeoJSON.features.push(feature);
      }
    });

    res.json(JSON.stringify(reportedGeoJSON));
  }

  async getAds(req, res, next) {
    const placementId = req.params.placementId;
    const placement = await AdsPlacement.findByPk(placementId);
    const respondData = [];

    if (!placement) {
      return res
        .status(403)
        .send({ message: "Không tìm thấy vị trí quảng cáo" });
    }

    const boards = await placement.getBoards({
      include: [
        {
          model: BoardType,
          required: true,
        },
        {
          model: AdsPlacement,
          required: true,
          include: [
            {
              model: LocationType,
              required: true,
            },
            {
              model: AdsType,
              required: true,
            },
            {
              model: Area,
              required: true,
            },
          ],
        },
      ],
    });

    for (const board of boards) {
      try {
        const permitRequest = await board.getPermitRequest();

        if (permitRequest) {
          const data = {
            ...board.dataValues,
            image: permitRequest.image,
            start: permitRequest.start,
            end: permitRequest.end,
            content: permitRequest.content,
            status: permitRequest.status,
          };
          respondData.push(data);
        } else {
          const data = {
            ...board.dataValues,
            image: "",
            start: "",
            end: "",
            content: "",
            status: "",
          };
          respondData.push(data);
        }
      } catch (err) {
        console.log(err);
      }
    }

    res.json(JSON.stringify(respondData));
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
