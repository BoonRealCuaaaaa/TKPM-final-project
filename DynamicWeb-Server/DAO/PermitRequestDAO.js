const {
  sequelize,
  AdsPlacement,
  Area,
  PermitRequest,
  BoardType,
  Board,
  Company,
  Account
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


}

exports.PermitRequestDAO = PermitRequestDAO;
