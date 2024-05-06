const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const checkInput = require("../util/checkInput");
const { LocationTypeDC } = require("../DC/LocationTypeDC");

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

class LocationTypeDAO {
  static instance = null;
  constructor() { }

  static getInstance() {
    if (this.instance == null) {
      this.instance = new LocationTypeDAO();
    }

    return this.instance;
  }

  async getLocationTypeById(id) {
    const resultFromDb = await LocationType.findByPk(id);
    const locationType = new LocationTypeDC(resultFromDb.id, resultFromDb.type);
    return locationType;
  }

  async getLocationTypeByOptions(options) {
    const resultFromDb = await LocationType.findAll(options);
    const results = [];
    resultFromDb.forEach((data) => {
      const locationType = new LocationTypeDC(data.id, data.locationType);
      const adsPlacementCount = data.AdsPlacements.length;
      results.push({ locationType, adsPlacementCount });
    });
    return results;
  }

  async createLocationType(data) {
    const newLocationType = await LocationType.create({
      locationType: data.locationType,
    });
  }

  async updateLocationType(data) {
    await LocationType.update(
      {
        locationType: data.locationType,
      },
      {
        where: {
          id: data.id,
        },
      }
    );
  }

  async deleteLocationType(data) {
    const adsPlacements = await AdsPlacement.findAll({
      where: {
        LocationTypeId: data.id,
      },
    });

    // Delete Boards associated with each AdsPlacement
    for (const adsPlacement of adsPlacements) {
      await Board.destroy({
        where: {
          AdsPlacementId: adsPlacement.id,
        },
      });
    }

    // Delete AdsPlacements associated with the LocationType
    await AdsPlacement.destroy({
      where: {
        LocationTypeId: data.id,
      },
    });

    await LocationType.destroy({
      where: {
        id: data.id,
      },
    });
  }

  static async findAll() {
    const rows = await LocationType.findAll();
    const results = [];

    rows.forEach((row) => {
      results.push(
        new LocationTypeDC(
          row.id,
          row.locationType
        )
      )
    });

    return results;
  }
}

exports.LocationTypeDAO = LocationTypeDAO;