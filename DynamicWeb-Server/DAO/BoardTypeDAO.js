const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const checkInput = require("../util/checkInput");
const { BoardTypeDC } = require("../DC/BoardTypeDC");
const { AdsPlacementDC } = require("../DC/AdsPlacementDC");

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

class BoardTypeDAO {
  static instance = null;
  constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new BoardTypeDAO();
    }

    return this.instance;
  }

  static async findAll() {
    const rows = await BoardType.findAll();
    const results = [];

    rows.forEach((row) => {
        results.push(
            new BoardTypeDC(
                row.id,
                row.type
            )
        )
    });

    return results;
}

  async getBoardTypeById(id) {
    const resultFromDb = await BoardType.findByPk(id);
    const boardType = new BoardTypeDC(resultFromDb.id, resultFromDb.type);
    return boardType;
  }

  async getBoardTypeByOptions(options) {
    const resultFromDb = await BoardType.findAll(options);
    const results = [];
    resultFromDb.forEach((data) => {
      const boardType = new BoardTypeDC(data.id, data.type);
      const boardCount = data.Boards.length;
      results.push({ boardType, boardCount });
    });
    return results;
  }

  async createBoardType(data) {
    const newBoardType = await BoardType.create({
      type: data.type,
    });
    return newBoardType;
  }

  async updateBoardType(data) {
    await BoardType.update(
      {
        type: data.type,
      },
      {
        where: {
          id: data.id,
        },
      }
    );
  }

  async deleteBoardType(data) {
    const boards = await Board.findAll({
      where: {
        BoardTypeId: data.id,
      },
    });

    // Delete Boards associated with each AdsPlacement
    for (const board of boards) {
      await Board.destroy({
        where: {
          id: board.id,
        },
      });
    }

    // Delete AdsPlacements associated with the BoardType
    await Board.destroy({
      where: {
        BoardTypeId: data.id,
      },
    });

    await BoardType.destroy({
      where: {
        id: data.id,
      },
    });
  }
}

exports.BoardTypeDAO = BoardTypeDAO;
