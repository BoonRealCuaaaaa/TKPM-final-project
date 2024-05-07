const {
    sequelize,
    AdsPlacement,
    Area,
    Account,
    LocationType,
    AdsType,
    AdsPlacementRequest,
} = require("../models");

const { AccountDC } = require("../DC/AccountDC");
const { AreaDC } = require("../DC/AreaDC");
const { AdsPlacementDC } = require("../DC/AdsPlacementDC");
const { AdsPlacementRequestDC } = require("../DC/AdsPlacementRequestDC");
const { LocationTypeDC } = require("../DC/LocationTypeDC");
const { AdsTypeDC } = require("../DC/AdsTypeDC");


class AdsPlacementRequestDAO {
    constructor() {}
    static instance = null;
    static getInstance() {
        if (AdsPlacementRequestDAO.instance == null) {
          AdsPlacementRequestDAO.instance = new AdsPlacementRequestDAO();
        }
        return AdsPlacementRequestDAO.instance;
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


    async getAdsPlacementRequestsWithByDistrictWardAndStatus(district, ward, status) {
        let areaCondition = {};
        if (district != null && district.trim() !== "") {
            areaCondition.district = district;

            if (ward != null && ward.trim() !== "") {
              areaCondition.ward = ward;
            }
        }

        const statusCondition = {};
        if (status != null && status.trim() !== "") {
            statusCondition.requestStatus = status;
        }

        let adsPlacementRequests = await AdsPlacementRequest.findAll({
            include: [
              {
                model: Account,
                attributes: ["firstName", "lastName", "type", "email"],
              },
              {
                model: AdsPlacement,
                include: [
                  {
                    model: Area,
                    where: areaCondition,
                    attributes: ["ward", "district"],
                    required: true,
                  },
                ],
                required: true,
              },
              LocationType,
              AdsType,
            ],
            where: statusCondition,
        });

        return adsPlacementRequests.map(adsPlacementRequest => {
          return new AdsPlacementRequestDC(adsPlacementRequest.id, adsPlacementRequest.address,
            adsPlacementRequest.status, adsPlacementRequest.AdsPlacement, adsPlacementRequest.LocationType,
            adsPlacementRequest.AdsType, adsPlacementRequest.reason, adsPlacementRequest.requestStatus,
            adsPlacementRequest.Account, adsPlacementRequest.createdAt);
        })
    }

    async updateAdsPlacementRequestById(id, updateObject) {
      await AdsPlacementRequest.update(
        updateObject,
        {
          where: {
            id,
          },
        }
      );
    }
}

exports.AdsPlacementRequestDAO = AdsPlacementRequestDAO;
