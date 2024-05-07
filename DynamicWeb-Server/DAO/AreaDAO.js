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

  async findAreaByDistrict(district) {
    let option = {};
    if (district != null && district !== "") {
      option = { 
        where: { district, } 
      }
    }
    const areas = await Area.findAll(option);
    return areas.map(area => {
      return new AreaDC(area.id, area.ward, area.district);
    })
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

  async getAllDistinctDistrict() {
    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas`
    );
    return districts;
  }

  async getAllAreas(district, page, perPage) {
    const areas = await Area.findAll({
      where: district == "" ? {} : { district: district },
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    return areas.map((area) => {
      return new AreaDC(area.id, area.ward, area.district);
    });
  }

  async getAreaById(id) {
    const area = await Area.findByPk(id);
    return new AreaDC(area.id, area.ward, area.district);
  }

  async editArea(data) {
    return await Area.update(
      { ward: data.ward, district: data.district },
      {
        where: { id: data.id },
      }
    );
  }

  async createArea(data) {
    let newArea = await Area.create({
      ward: data.ward,
      district: data.district,
    });
    newArea.save();
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
