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

class AdsTypeDC {
  constructor(id, type) {
    Object.assign(this, {
      id,
      type,
    });
  }
}

exports.AdsTypeDC = AdsTypeDC;
