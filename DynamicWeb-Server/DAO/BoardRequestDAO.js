const boardRequest = require("../models/boardRequest");
const {BoardRequestDC} = require("../DC/BoardRequestDC");

class BoardRequestDAO {
    static instance = null;
    constructor() {}
  
    static getInstance() {
      if (this.instance == null) {
        this.instance = new PermitRequestDAO();
      }
  
      return this.instance;
    }

    async getAllBoardRequestsByDistrictWardAndStatus(district, ward, status) {
      let areaCondition = {};
      if (district != null && district.trim() !== "") {
        areaCondition.district = district;
        
        if (ward != null && ward.trim() !== "") {
          areaCondition.ward = ward;
        }
      }
      
      const requestStatusCondition = status !== "" ? {
        requestStatus: status,
      } : {};
      let boardRequests = await BoardRequest.findAll({
        include: [
          BoardType,
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
        where: requestStatusCondition,
      });
      
      return boardRequests.map(boardRequest => {
        return new BoardRequestDC(boardRequest.id, boardRequest.size, boardRequest.quantity, boardRequest.reason, boardRequest.requestStatus, boardRequest.BoardType, boardRequest.Board, boardRequest.Account)
      });
    }

    async updateBoardRequestById(boardRequestId, updateObject) {
      await BoardRequest.update(
        updateObject,
        { where: { id: boardRequestId } }
      );
    }
    
     
}

exports.BoardRequestDAO = BoardRequestDAO;