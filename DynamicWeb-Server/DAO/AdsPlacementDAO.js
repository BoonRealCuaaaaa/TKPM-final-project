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
const { Op } = require("sequelize");
const checkInput = require("../util/checkInput");
const { AreaDC } = require("../DC/AreaDC");
const { BoardDC } = require("../DC/BoardDC");
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
        status: status,
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

  async getAdsPlacementById(id) {
    const resultFromDb = await AdsPlacement.findOne({
      where: {
        id: id,
      },
    });

    return new AdsPlacementDC(
      resultFromDb.id,
      resultFromDb.address,
      resultFromDb.status,
      resultFromDb.long,
      resultFromDb.lat,
    );
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

  async getAdsPlacementByOptions(district, ward, search) {
    const results = [];
    const optionsAdsPlacement = {
      attributes: [
        "id",
        "address",
        "status",
        "long",
        "lat",
        "createdAt",
        "updatedAt",
        "AreaId",
        "LocationTypeId",
        "AdsTypeId",
      ],
      include: [
        {
          model: Area,
          attributes: ["id", "district", "ward"],
          where: {},
        },
        {
          model: LocationType,
          attributes: ["id", "locationType"],
        },
        {
          model: AdsType,
          attributes: ["id", "type"],
        },
        {
          model: Board,
          attributes: ["id", "size", "quantity"],
        },
        // ... other associations ...
      ],
    };

    if (search.trim !== "") {
      optionsAdsPlacement.where = {
        [Op.or]: [
          {
            address: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    "$Area.district$": {
                      [Op.like]: `%${search}%`,
                    },
                  },
                  {
                    "$Area.ward$": {
                      [Op.like]: `%${search}%`,
                    },
                  },
                ],
              },
              {
                address: {
                  [Op.notLike]: `%${search}%`,
                },
              },
            ],
          },
        ],
      };
    }
    if (district.trim() !== "") {
      optionsAdsPlacement.include[0].where.district = district;

      if (ward.trim() !== "") {
        optionsAdsPlacement.include[0].where.ward = ward;
      }
    }
    const resultFromDb = await AdsPlacement.findAll(optionsAdsPlacement);

    resultFromDb.forEach((data) => {
      const boards = data.Boards.map(
        (board) => new BoardDC(board.id, board.size, board.quantity)
      );
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
          new AdsTypeDC(data.AdsType.id, data.AdsType.type),
          boards
        )
      );
    });

    return results;
  }

  async createAdPlacement(data) {
    const newAdPlacement = await AdsPlacement.create({
      address: data.address,
      status: "Chưa quy hoạch",
      long: parseFloat(data.long).toFixed(6),
      lat: parseFloat(data.lat).toFixed(6),
      AreaId: data.area,
      LocationTypeId: data.locationType,
      AdsTypeId: data.adsType,
    });

    await newAdPlacement.save();
  }

  async updateAdPlacement(data) {
    await AdsPlacement.update(
      {
        AreaId: data.area,
        address: data.address,
        LocationTypeId: data.locationType,
        AdsTypeId: data.adType,
        status: data.status,
        long: parseFloat(data.long).toFixed(6),
        lat: parseFloat(data.lat).toFixed(6),
      },
      {
        where: {
          id: data.id,
        },
      }
    );
  }

  async updateAdPlacementById(id, updateObject) {
    await AdsPlacement.update(
      updateObject,
      {
        where: {
          id,
        },
      }
    );
  }

  async deleteAdPlacement(data) {
    await AdsPlacement.destroy({
      where: {
        id: data.id,
      },
    });
  }

  static async findAll() {
    const results = [];

    const resultFromDb = await AdsPlacement.findAll({
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

  static async findAllByAreaId(areaId) {
    const results = [];

    const resultFromDb = await AdsPlacement.findAll({
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
      where: {
        areaId: areaId
      }
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
}

module.exports.AdsPlacementDAO = AdsPlacementDAO;
