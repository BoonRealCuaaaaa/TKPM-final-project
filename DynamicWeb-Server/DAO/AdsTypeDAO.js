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
const { AdsTypeDC } = require("../DC/AdsTypeDC");
const { AdsPlacementDC } = require("../DC/AdsPlacementDC");

class AdsTypeDAO {
  static instance = null;
  constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new AdsTypeDAO();
    }

    return this.instance;
  }
  async getAdTypeById(id) {
    const resultFromDb = await AdsType.findByPk(id);
    const adType = new AdsTypeDC(resultFromDb.id, resultFromDb.type);
    return adType;
  }
  async getAdTypeByOptions(options) {
    const resultFromDb = await AdsType.findAll(options);
    const results = [];
    resultFromDb.forEach((data) => {
      const adType = new AdsTypeDC(data.id, data.type);
      const adPlacementCount = data.AdsPlacements.length;
      results.push({ adType, adPlacementCount });
    });
    return results;
  }

  async createAdType(data) {
    const newAdType = await AdsType.create({
      type: data.type,
    });
    return newAdType;
  }

  async updateAdType(data) {
    await AdsType.update(
      {
        type: data.type,
      },
      {
        where: {
          id: data.id,
        },
      }
    );
  }

  async deleteAdType(data) {
    const adPlacements = await AdsPlacement.findAll({
      where: {
        AdsTypeId: data.id,
      },
    });

    // Delete Boards associated with each AdsPlacement
    for (const adPlacement of adPlacements) {
      await Board.destroy({
        where: {
          AdsPlacementId: adPlacement.id,
        },
      });
    }

    // Delete AdsPlacements associated with the AdType
    await AdsPlacement.destroy({
      where: {
        AdsTypeId: data.id,
      },
    });

    await AdsType.destroy({
      where: {
        id: data.id,
      },
    });
  }

  static async findAll() {
    const rows = await AdsType.findAll();
    const results = [];

    rows.forEach((row) => {
        results.push(
            new AdsTypeDC(
                row.id,
                row.type
            )
        )
    });

    return results;
}
}

exports.AdsTypeDAO = AdsTypeDAO;
