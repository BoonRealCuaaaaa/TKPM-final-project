const {
    Account,
    Area,
    AdsPlacementRequest,
    LocationType,
    AdsType
} = require("../models");

const { AccountDC } = require("../DC/AccountDC");
const { AreaDC } = require("../DC/AreaDC");
const { AdsPlacementDC } = require("../DC/AdsPlacementDC");
const { AdsPlacementRequestDC } = require("../DC/AdsPlacementRequestDC");
const { LocationTypeDC } = require("../DC/LocationTypeDC");
const { AdsTypeDC } = require("../DC/AdsTypeDC");

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

    static async findAllByAccountId(accountId) {
        const rows = await AdsPlacementRequest.findAll({
            include: [{ model: LocationType }, { model: AdsType }],
            where: {
                accountId: accountId,
            },
            order: [["id", "ASC"]],
        });

        const results = [];

        rows.forEach((row) => {
            results.push(
                new AdsPlacementRequestDC(
                    row.id,
                    row.address,
                    row.status,
                    new AdsPlacementDC(
                        row.AdsPlacementId,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                    ),
                    new LocationTypeDC(
                        row.LocationType.id,
                        row.LocationType.locationType
                    ),
                    new AdsTypeDC(
                        row.AdsType.id,
                        row.AdsType.type
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

module.exports.AdsPlacementRequestDAO = AdsPlacementRequestDAO;