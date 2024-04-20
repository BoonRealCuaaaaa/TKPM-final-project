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
}

exports.AreaDAO = AreaDAO;
