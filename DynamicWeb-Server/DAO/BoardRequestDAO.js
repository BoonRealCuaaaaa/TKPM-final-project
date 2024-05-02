const {
    BoardRequest
} = require("../models");

const { AccountDC } = require("../DC/AccountDC");
const { AreaDC } = require("../DC/AreaDC");
const { BoardRequestDC } = require("../DC/BoardRequestDC");

class BoardRequestDAO {
    static instance = null;
    constructor() { }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new BoardRequestDAO();
        }

        return this.instance;
    }

    static async create(data) {
        try {
            let request = await BoardRequest.create({
                BoardId: data.boardId,
                size: data.size,
                quantity: data.quantity,
                BoardTypeId: data.boardTypeId,
                reason: data.reason,
                AccountId: data.accountId,
                requestStatus: data.requestStatus,
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
            await BoardRequest.destroy({ where: { id: id } });
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
}

module.exports.BoardRequestDAO = BoardRequestDAO;