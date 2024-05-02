const { AdsType } = require("../models");

const { AdsTypeDC } = require("../DC/AdsTypeDC");

class AdsTypeDAO {
    static instance = null;
    constructor() { }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new AdsTypeDAO();
        }

        return this.instance;
    }

    static async findAll() {
        const rows = await AdsType.findAll();
        const results = [];

        rows.forEach((row) => {
            results.push(
                new AdsTypeDC(
                    row.id,
                    row.type
                )
            )
        });

        return results;
    }
}

module.exports.AdsTypeDAO = AdsTypeDAO;