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
  constructor() {}

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
}

exports.AreaDAO = AreaDAO;
