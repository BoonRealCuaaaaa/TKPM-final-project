const { AdsPlacementDC } = require("../DC/AdsPlacementDC");
const { AdsTypeDC } = require("../DC/AdsTypeDC");
const { AreaDC } = require("../DC/AreaDC");
const { BoardDC } = require("../DC/BoardDC");
const { BoardTypeDC } = require("../DC/BoardTypeDC");
const { LocationTypeDC } = require("../DC/LocationTypeDC");

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

    return results
  }
}

exports.BoardDAO=BoardDAO