const {
  sequelize,
  AdsPlacement,
  Area,
  PermitRequest,
  BoardType,
  Board,
  Company,
  Account,
  LocationReport,
  BoardReport,
  AdsReport,
} = require("../models");

const { PermitRequestDC } = require("../DC/PermitRequestDC");
const { CompanyDC } = require("../DC/CompanyDC");
const { BoardDC } = require("../DC/BoardDC");

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

  async getPermitRequestDetailById(id) {
    const permitRequest = await PermitRequest.findOne({
      include: [
        Company,
        {
          model: Board,
          include: [
            BoardType,
            {
              model: AdsPlacement,
              include: [Area],
            },
          ],
        },
        {
          model: Account,
          attributes: ["firstName", "lastName", "type", "email"],
        },
      ],
      where: {
        id,
      },
    });

    return permitRequest ? new PermitRequestDC(
      permitRequest.id,
      permitRequest.content,
      permitRequest.image,
      permitRequest.start,
      permitRequest.end,
      permitRequest.status,
      permitRequest.Board,
      permitRequest.Company,
      permitRequest.Account
    ) : null;
  }

  async getAllPermitRequestsByDistrictAndWard(district, ward) {
    let areaCondition = {};
    if (district != null && district.trim() !== "") {
      areaCondition.district = district;
      if (ward != null && ward.trim() !== "") {
        areaCondition.ward = ward;
      }  
    }
    
    let permitRequests = await PermitRequest.findAll({
      include: [
        Company,
        {
          model: Board,
          include: [
            BoardType,
            {
              model: AdsPlacement,
              include: [
                {
                  model: Area,
                  where: areaCondition,
                  required: true,
                },
              ],
              required: true,
            },
          ],
          required: true,
        },
        {
          model: Account,
          attributes: ["firstName", "lastName", "type", "email"],
        },
      ],
    });

    return permitRequests.map(permitRequest => {
      return new PermitRequestDC(
        permitRequest.id,
        permitRequest.content,
        permitRequest.image,
        permitRequest.start,
        permitRequest.end,
        permitRequest.status,
        permitRequest.Board,
        permitRequest.Company,
        permitRequest.Account
      );
    })
  }

  async updatePermitRequestById(id, updateObject) {
    await PermitRequest.update(
      updateObject,
      { where: { id } }
    );
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

  static async findAllByAccountId(accountId) {
    const rows = await PermitRequest.findAll({
      include: [{ model: Company }],
      where: {
        accountId: accountId,
      },
      order: [["id", "ASC"]],
    });

    const results = [];

    rows.forEach((row) => {
      results.push(
        new PermitRequestDC(
          row.id,
          row.content,
          row.image,
          row.start,
          row.end,
          row.status,
          new BoardDC(
            row.BoardId,
            null,
            null,
            null,
            null,
          ),
          new CompanyDC(
            row.Company.id,
            row.Company.name,
            row.Company.phone,
            row.Company.address,
            row.Company.email
          ),
          null,
          row.createdAt
        )
      )
    });

    return results;
  }
}

exports.PermitRequestDAO = PermitRequestDAO;
