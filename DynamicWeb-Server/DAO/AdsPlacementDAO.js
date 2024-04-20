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
const { ReportDC } = require("../DC/ReportDC");
const { ReportTypeDC } = require("../DC/ReportTypeDC");

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
          include: [{ model: ReportType, required: true }],
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
      const reportDC = new ReportDC(
        report.id,
        report.submission_time,
        report.name,
        report.email,
        report.phone,
        report.reportContent,
        report.image,
        report.status,
        report.method,
        new ReportTypeDC(report.ReportType.id, report.ReportType.type),
        null,
        report.createdAt
      );
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

      results.push({ adsPlacementDC, reportDC });
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
          include: [{ model: ReportType, required: true }],
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
      const reportDC = new ReportDC(
        report.id,
        report.submission_time,
        report.name,
        report.email,
        report.phone,
        report.reportContent,
        report.image,
        report.status,
        report.method,
        new ReportTypeDC(report.ReportType.id, report.ReportType.type),
        null,
        report.createdAt
      );
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

      results.push({ adsPlacementDC, reportDC });
    }

    const reportInLocationReportTable = LocationReport.findAll({
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
          where: {
            status: {
              [Sequelize.Op.not]: "Đã xử lý",
            },
          },
        },
      ],
    });

    for (let i = 0; i < reportInLocationReportTable.length; i++) {
      const report = reportInBoardReportTable[i].Report;
      const reportDC = new ReportDC(
        report.id,
        report.submission_time,
        report.name,
        report.email,
        report.phone,
        report.reportContent,
        report.image,
        report.status,
        report.method,
        new ReportTypeDC(report.ReportType.id, report.ReportType.type),
        null,
        report.createdAt
      );
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

      results.push({ adsPlacementDC, reportDC });
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
