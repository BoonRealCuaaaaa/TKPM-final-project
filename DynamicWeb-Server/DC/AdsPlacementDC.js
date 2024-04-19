class AdsPlacementDC {
  id;
  address;
  status;
  long;
  lat;
  area;
  locationType;
  adsType;
  constructor(id, address, status, long, lat, area, locationType, adsType) {
    Object.assign(this, {
      id,
      address,
      status,
      long,
      lat,
      area,
      locationType,
      adsType,
    });
  }
}

exports.AdsPlacementDC = AdsPlacementDC;
