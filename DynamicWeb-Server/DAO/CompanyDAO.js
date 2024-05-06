const { Company } = require("../models");

const Sequelize = require("sequelize");

const { CompanyDC } = require("../DC/CompanyDC");

class CompanyDAO {
    static instance = null;
    constructor() { }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new CompanyDAO();
        }

        return this.instance;
    }

    static async findAll() {
        const rows = await Company.findAll();
        const results = [];

        rows.forEach((row) => {
            results.push(
                new CompanyDC(
                    row.id,
                    row.name,
                    row.phone,
                    row.address,
                    row.email
                )
            )
        });

        return results;
    }

    static async create(data) {
        try {
            let newCompany = await Company.create({
                name: data.name,
                phone: data.phone,
                address: data.address,
                email: data.email
            });
            return { id: newCompany.id };
          }
          catch (error) {
            console.error(error);
            return null;
          }
    }
}

module.exports.CompanyDAO = CompanyDAO;