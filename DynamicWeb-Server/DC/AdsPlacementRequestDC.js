class AdsPlacementRequestDC {
    constructor(id, address, status, adsPlacement, locationType, adsType, reason, requestStatus, account) {
      Object.assign(this, {
        id,
        address,
        status,
        adsPlacement,
        locationType,
        adsType,
        reason,
        requestStatus,
        account
      });
    }
  }
  
  exports.AdsPlacementRequestDC = AdsPlacementRequestDC;
  