const { AdsPlacementDC } = require("../DC/AdsPlacementDC");
const { AdsTypeDC } = require("../DC/AdsTypeDC");
const { AreaDC } = require("../DC/AreaDC");
const { BoardDC } = require("../DC/BoardDC");
const { BoardTypeDC } = require("../DC/BoardTypeDC");
const { LocationTypeDC } = require("../DC/LocationTypeDC");
const { Op } = require("sequelize");

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

class BoardDAO {
  static instance = null;
  constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new BoardDAO();
    }

    return this.instance;
  }

  async getBoardByAdsPlacementId(id) {
    const results = [];

    const placement = await AdsPlacement.findByPk(id);
    const boards = await placement.getBoards({
      include: [
        {
          model: BoardType,
          required: true,
        },
        {
          model: AdsPlacement,
          required: true,
          include: [
            {
              model: LocationType,
              required: true,
            },
            {
              model: AdsType,
              required: true,
            },
            {
              model: Area,
              required: true,
            },
          ],
        },
      ],
    });

    for (let i = 0; i < boards.length; i++) {
      const adsPlacement = boards[i].AdsPlacement;
      const adsPlacementDC = new AdsPlacementDC(
        adsPlacement.id,
        adsPlacement.address,
        adsPlacement.status,
        adsPlacement.long,
        adsPlacement.lat,
        new AreaDC(
          adsPlacement.Area.id,
          adsPlacement.Area.ward,
          adsPlacement.Area.district
        ),
        new LocationTypeDC(
          adsPlacement.LocationType.id,
          adsPlacement.LocationType.locationType
        ),
        new AdsTypeDC(adsPlacement.AdsType.id, adsPlacement.AdsType.type)
      );

      const boardDC = new BoardDC(
        boards[i].id,
        boards[i].size,
        boards[i].quantity,
        new BoardTypeDC(boards[i].BoardType.id, boards[i].BoardType.type),
        adsPlacementDC
      );

      results.push(boardDC);
    }

    return results;
  }

  async getBoardByOption(district, ward, search) {
    const optionsBoardManagement = {
      attributes: ["id", "size", "quantity", "boardTypeId", "adsPlacementId"],
      include: [
        {
          model: BoardType,
          attributes: ["id", "type"],
        },
        {
          model: AdsPlacement,
          attributes: ["id", "address", "areaId", "long", "lat"],
          where: {},

          include: [
            {
              model: Area,
              attributes: ["id", "district", "ward"],
              where: {},
            },
            {
              model: LocationType,
              attributes: ["id", "locationType"],
            },
            {
              model: AdsType,
              attributes: ["id", "type"],
            },
          ],
        },
      ],
    };

    if (search.trim() !== "") {
      optionsBoardManagement.where = {
        [Op.or]: [
          {
            "$AdsPlacement.Area.district$": {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$AdsPlacement.Area.ward$": {
              [Op.like]: `%${search}%`,
            },
          },
          {
            "$AdsPlacement.address$": {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      };
    }

    if (district.trim() !== "") {
      optionsBoardManagement.include[1].include[0].where.district = district;
      if (ward.trim() !== "") {
        optionsBoardManagement.include[1].include[0].where.ward = ward;
      }
    }
    const results = [];
    const resultFromDb = await Board.findAll(optionsBoardManagement);

    resultFromDb.forEach((data) => {
      const adsPlacement = data.AdsPlacement;
      const adsPlacementDC = new AdsPlacementDC(
        adsPlacement.id,
        adsPlacement.address,
        adsPlacement.status,
        adsPlacement.long,
        adsPlacement.lat,
        new AreaDC(
          adsPlacement.Area.id,
          adsPlacement.Area.ward,
          adsPlacement.Area.district
        ),
        new LocationTypeDC(
          adsPlacement.LocationType.id,
          adsPlacement.LocationType.locationType
        ),
        new AdsTypeDC(adsPlacement.AdsType.id, adsPlacement.AdsType.type)
      );

      const boardDC = new BoardDC(
        data.id,
        data.size,
        data.quantity,
        new BoardTypeDC(data.BoardType.id, data.BoardType.type),
        adsPlacementDC
      );

      results.push(boardDC);
    });

    return results;
  }

  async createBoard(data) {
    const newBoard = await Board.create({
      size: data.size,
      quantity: data.quantity + " trụ/bảng",
      BoardTypeId: parseInt(data.boardType),
      AdsPlacementId: data.adsPlacement,
    });
    newBoard.save();
  }
}

exports.BoardDAO = BoardDAO;
