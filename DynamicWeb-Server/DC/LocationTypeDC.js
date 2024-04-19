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

class LocationTypeDC {
  constructor(id, locationType) {
    Object.assign(this, {
      id,
      locationType
    });
  }
}

exports.LocationTypeDC = LocationTypeDC;
