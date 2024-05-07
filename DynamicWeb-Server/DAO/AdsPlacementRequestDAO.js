const {
    sequelize,
    AdsPlacement,
    Area,
    Account,
    LocationType,
    AdsType,
    AdsPlacementRequest,
} = require("../models");
const {AdsPlacementRequestDC} = require("../DC/AdsPlacementRequestDC")


class AdsPlacementRequestDAO {
    constructor() {}
    static instance = null;
    static getInstance() {
        if (AdsPlacementRequestDAO.instance == null) {
          AdsPlacementRequestDAO.instance = new AdsPlacementRequestDAO();
        }
        return AdsPlacementRequestDAO.instance;
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
            adsPlacementRequest.status, adsPlacementRequest.reason, adsPlacementRequest.requestStatus,
            adsPlacementRequest.AdsPlacement, adsPlacementRequest.LocationType, adsPlacementRequest.AdsType, 
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