const { LocationType } = require("../models");

const { LocationTypeDC } = require("../DC/LocationTypeDC");

class LocationTypeDAO {
    static instance = null;
    constructor() { }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new LocationTypeDAO();
        }

        return this.instance;
    }

    static async findAll() {
        const rows = await LocationType.findAll();
        const results = [];

        rows.forEach((row) => {
            results.push(
                new LocationTypeDC(
                    row.id,
                    row.locationType
                )
            )
        });

        return results;
    }
}

module.exports.LocationTypeDAO = LocationTypeDAO;