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

const { PermitRequestDC } = require("../DC/PermitRequestDC");

class PermitRequestDAO {
  static instance = null;
  constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new PermitRequestDAO();
    }

    return this.instance;
  }

  async findPermitRequestByBoardId(id) {
    const permitRequest = await PermitRequest.findOne({
      where: {
        boardId: id,
      },
    });

    if (permitRequest) {

      return new PermitRequestDC(
        permitRequest.id,
        permitRequest.content,
        permitRequest.image,
        permitRequest.start,
        permitRequest.end,
        permitRequest.status,
        null,
        null,
        null
      );
    } else {
      return null;
    }
  }
}

exports.PermitRequestDAO = PermitRequestDAO;
