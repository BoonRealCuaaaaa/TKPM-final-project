const {
    BoardRequest,
    BoardType
} = require("../models");

const { AccountDC } = require("../DC/AccountDC");
const { AreaDC } = require("../DC/AreaDC");
const { BoardRequestDC } = require("../DC/BoardRequestDC");
const { BoardTypeDC } = require("../DC/BoardTypeDC");
const { BoardDC } = require("../DC/BoardDC");

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

    static async findAllByAccountId(accountId) {
        const rows = await BoardRequest.findAll({
            include: [{ model: BoardType }],
            where: { accountId: accountId },
            order: [["id", "ASC"]],
        });

        const results = [];

        rows.forEach((row) => {
            results.push(
                new BoardRequestDC(
                    row.id,
                    row.size,
                    row.quantity,
                    new BoardTypeDC(
                        row.BoardType.id,
                        row.BoardType.type
                    ),
                    new BoardDC(
                        row.BoardId,
                        null,
                        null,
                        null, 
                        null
                    ),
                    row.reason,
                    row.requestStatus,
                    null,
                    row.createdAt
                )
            )
        });

        return results;
    }
}

module.exports.BoardRequestDAO = BoardRequestDAO;