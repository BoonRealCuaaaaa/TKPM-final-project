class AdsPlacementRequestDC {
    constructor(id, address, status, adsPlacement, locationType, adsType, reason, requestStatus, account, createdAt) {
      Object.assign(this, {
        id,
        address,
        status,
        adsPlacement,
        locationType,
        adsType,
        reason,
        requestStatus,
        account,
        createdAt,
      });
    }
  }
  
exports.AdsPlacementRequestDC = AdsPlacementRequestDC;
  