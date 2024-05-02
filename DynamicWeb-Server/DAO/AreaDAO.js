const { AreaDC } = require("../DC/AreaDC");

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

class AreaDAO {
  static instance = null;
  constructor() { }

  static getInstance() {
    if (this.instance == null) {
      this.instance = new AreaDAO();
    }

    return this.instance;
  }

  async findAreaByWardAndDistrict(ward, district) {
    const selectedArea = await Area.findOne({
      where: {
        ward: ward.trim(),
        district: district.trim(),
      },
    });

    if (selectedArea) {
      return new AreaDC(
        selectedArea.id,
        selectedArea.ward,
        selectedArea.district
      );
    }

    return null;
  }

  static async findWardsByDistrict(district) {
    const wards = await Area.findAll({
      attributes: ["ward"],
      where: { district: district },
    });

    return wards;
  }

  static async findAll() {
    const rows = await Area.findAll({
      order: [
        ["district", "ASC"],
        ["ward", "ASC"],
      ],
    });
    const results = [];

    rows.forEach((row) => {
      results.push(
        new AreaDC(
          row.id,
          row.ward,
          row.district
        )
      )
    });

    return results;
  }

  static async findAreasByDistrict(district) {
    const rows = await Area.findAll({
      where: { district: district },
      order: [["ward", "ASC"]],
    });
    const results = [];

    rows.forEach((row) => {
      results.push(
        new AreaDC(
          row.id,
          row.ward,
          row.district
        )
      )
    });

    return results;
  }
}

exports.AreaDAO = AreaDAO;
