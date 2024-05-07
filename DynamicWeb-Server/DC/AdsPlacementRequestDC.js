class AdsPlacementRequestDC {
    id;
    address;
    status;
    reason;
    requestStatus;
    adsPlacement;
    locationType;
    adsType;
    account;
    createdAt;
    constructor(id, address, status, reason, requestStatus, adsPlacement, locationType, adsType, account, createdAt) {
      Object.assign(this, {
        id, address, status, reason, requestStatus, adsPlacement, locationType, adsType, account, createdAt
    });
    }
}
  
exports.AdsPlacementRequestDC = AdsPlacementRequestDC;
  