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

class AreaDC {
  id;
  ward;
  district;
  constructor(id, ward, district) {
    Object.assign(this, {
      id,
      ward,
      district,
    });
  }
}

exports.AreaDC = AreaDC;
