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
  constructor() { }

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

  static async create(data) {
    try {
      let request = await PermitRequest.create({
        content: data.content,
        image: data.image,
        start: data.start,
        end: data.end,
        status: data.status,
        BoardId: data.boardId,
        CompanyId: data.companyId,
        AccountId: data.accountId,
      });
      return { id: request.id };
    }
    catch (error) {
      console.error(error);
      return null;
    }
  }

  static async destroy(id) {
    try {
      await PermitRequest.destroy({ where: { id: id } });
      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }
}

exports.PermitRequestDAO = PermitRequestDAO;
