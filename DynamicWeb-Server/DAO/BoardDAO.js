const { AdsPlacementDC } = require("../DC/AdsPlacementDC");
const { AdsTypeDC } = require("../DC/AdsTypeDC");
const { AreaDC } = require("../DC/AreaDC");
const { BoardDC } = require("../DC/BoardDC");
const { BoardTypeDC } = require("../DC/BoardTypeDC");
const { LocationTypeDC } = require("../DC/LocationTypeDC");
const { Op, where } = require("sequelize");

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
    Company
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

  static async create(data) {
    try {
      let newBoard = await Board.create({
        size: data.size,
        quantity: data.quantity,
        BoardTypeId: data.boardTypeId,
        AdsPlacementId: data.adsPlacementId,
      });
      return { id: newBoard.id };
    }
    catch (error) {
      console.error(error);
      return null;
    }
  }

  

  async getBoardById(id) {
    const board = await Board.findByPk(id, {
      include: [
        {
          model: BoardType,
          where: { BoardTypeId: sequelize.col("Board.id") },
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

    const adsPlacement = board.AdsPlacement;
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
      board.id,
      board.size,
      board.quantity,
      new BoardTypeDC(board.BoardType.id, board.BoardType.type),
      adsPlacementDC
    );

    return boardDC;
  }

  async getBoardByOption(district, ward, search) {
    const optionsBoardManagement = {
      attributes: ["id", "size", "quantity", "boardTypeId", "adsPlacementId"],
      include: [
        {
          model: BoardType,
          attributes: ["id", "type"],
          where: { BoardTypeId: sequelize.col("Board.id") },
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

  async updateBoard(data) {
    const board = await Board.update(
      {
        size: data.size,
        quantity: data.quantity,
        BoardTypeId: parseInt(data.boardType),
        AdsPlacementId: data.adsPlacement,
      },
      {
        where: {
          id: data.id,
        },
      }
    );
  }

  async updateBoardById(boardId, updateObject) {
    await Board.update(
      updateObject,
      { where: { id: boardId } }
    );

  }

  async deleteBoard(data) {
    const board = await Board.destroy({
      where: {
        id: data.id,
      },
    });
  }
}

exports.BoardDAO = BoardDAO;
