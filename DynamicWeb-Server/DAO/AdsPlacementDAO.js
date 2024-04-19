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
  BoardReport,
  AdsReport,
} = require("../models");

const Sequelize = require("sequelize");

const { AreaDC } = require("../DC/AreaDC");
const { LocationTypeDC } = require("../DC/LocationTypeDC");
const { AdsPlacementDC } = require("../DC/AdsPlacementDC");
const { AdsTypeDC } = require("../DC/AdsTypeDC");

class AdsPlacementDAO {
  static instance = null;
  constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new AdsPlacementDAO();
    }

    return this.instance;
  }

  async getAdsPlacementByStatus(status) {
    const results = [];

    const resultFromDb = await AdsPlacement.findAll({
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

    resultFromDb.forEach((data) => {
      results.push(
        new AdsPlacementDC(
          data.id,
          data.address,
          data.status,
          data.long,
          data.lat,
          new AreaDC(data.Area.id, data.Area.ward, data.Area.district),
          new LocationTypeDC(
            data.LocationType.id,
            data.LocationType.locationType
          ),
          new AdsTypeDC(data.AdsType.id, data.AdsType.type)
        )
      );
    });

    return results;
  }

  async getReportedAdsPlacement() {
    const results = [];

    const reportInAdsReportTable = await AdsReport.findAll({
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
          model: Report,
          required: true,
          include: [{ model: ReportType, require: true }],
          where: {
            status: {
              [Sequelize.Op.not]: "Đã xử lý",
            },
          },
        },
      ],
    });

    for (let i = 0; i < reportInAdsReportTable.length; i++) {
      const adsPlacement = reportInAdsReportTable[i].AdsPlacement;
      const report = reportInAdsReportTable[i].Report;
      const adsPlacementDC = new AdsPlacementDC(
        adsPlacement.id,
        adsPlacement.address,
        null,
        adsPlacement.long,
        adsPlacement.lat,
        adsPlacement.Area,
        adsPlacement.LocationType,
        adsPlacement.AdsType
      );

      results.push({ adsPlacementDC, report });
    }

    const reportInBoardReportTable = await BoardReport.findAll({
      include: [
        {
          model: Board,
          required: true,
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
          ],
        },
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, require: true }],
          where: {
            status: {
              [Sequelize.Op.not]: "Đã xử lý",
            },
          },
        },
      ],
    });

    for (let i = 0; i < reportInBoardReportTable.length; i++) {
      const adsPlacement = reportInBoardReportTable[i].Board.AdsPlacement;
      const report = reportInBoardReportTable[i].Report;
      const adsPlacementDC = new AdsPlacementDC(
        adsPlacement.id,
        adsPlacement.address,
        null,
        adsPlacement.long,
        adsPlacement.lat,
        adsPlacement.Area,
        adsPlacement.LocationType,
        adsPlacement.AdsType
      );

      results.push({ adsPlacementDC, report });
    }

    const reportInLocationReportTable = LocationReport.findAll({
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, require: true }],
          where: {
            status: {
              [Sequelize.Op.not]: "Đã xử lý",
            },
          },
        },
      ],
    });

    for (let i = 0; i < reportInLocationReportTable.length; i++) {
      const adsPlacementDC = new AdsPlacementDC(
        null,
        reportInLocationReportTable[i].address,
        null,
        reportInLocationReportTable[i].long,
        reportInLocationReportTable[i].lat,
        null,
        null,
        null
      );

      const report=reportInLocationReportTable[i].Report
      results.push({ adsPlacementDC, report });
    }

    return results;
  }

  async getNumBoardByAdsPlacementId(id) {
    const boards = await Board.findAll({
      where: {
        adsPlacementId: id,
      },
    });

    return boards.length;
  }
}

module.exports.AdsPlacementDAO = AdsPlacementDAO;
