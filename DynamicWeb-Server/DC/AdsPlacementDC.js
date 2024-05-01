class AdsPlacementDC {
  id;
  address;
  status;
  long;
  lat;
  area;
  locationType;
  adsType;
  boards
  constructor(id, address, status, long, lat, area, locationType, adsType, boards) {
    Object.assign(this, {
      id,
      address,
      status,
      long,
      lat,
      area,
      locationType,
      adsType,
      boards
    });
  }
}

exports.AdsPlacementDC = AdsPlacementDC;
