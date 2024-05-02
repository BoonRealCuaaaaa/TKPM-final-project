const {
    Account,
    Area,
    AdsPlacementRequest
} = require("../models");

const { AccountDC } = require("../DC/AccountDC");
const { AreaDC } = require("../DC/AreaDC");
const { AdsPlacementRequestDC } = require("../DC/AdsPlacementRequestDC");

class AdsPlacementRequestDAO {
    static instance = null;
    constructor() { }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new AdsPlacementRequestDAO();
        }
        return this.instance;
    }

    static async create(data) {
        try {
            let request = await AdsPlacementRequest.create({
                AdsPlacementId: data.adsplacementId,
                address: data.address,
                AdsTypeId: data.adsTypeId,
                LocationTypeId: data.locationTypeId,
                status: data.status,
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
            await AdsPlacementRequest.destroy({ where: { id: id } });
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
}

module.exports.AdsPlacementRequestDAO = AdsPlacementRequestDAO;