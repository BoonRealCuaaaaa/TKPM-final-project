const { BoardType } = require("../models");

const { BoardTypeDC } = require("../DC/BoardTypeDC");

class BoardTypeDAO {
    static instance = null;
    constructor() { }

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
}

module.exports.BoardTypeDAO = BoardTypeDAO;