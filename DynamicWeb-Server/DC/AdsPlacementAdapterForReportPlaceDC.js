const { MapFeatureDC } = require("./MapFeatureDC");
const { AdsPlacementDAO } = require("../DAO/AdsPlacementDAO");

class AdsPlacementAdapterForReportPlaceDC {
  constructor(adsPlacement, report) {
    this.adsPlacementDC = adsPlacement;
    this.reportDC=report
  }

  async getFeature() {
    const properties = {
      id: this.adsPlacementDC.id,
      area: this.adsPlacementDC.area,
      reportType: this.reportDC.reportType.type,
      address: this.adsPlacementDC.address,
      lng: this.adsPlacementDC.long,
      lat: this.adsPlacementDC.lat,
    };

    const geometry = {
      coordinates: [this.adsPlacementDC.long, this.adsPlacementDC.lat],
      type: "Point",
    };

    return new MapFeatureDC(properties, geometry);
  }
}

exports.AdsPlacementAdapterForReportPlaceDC =
  AdsPlacementAdapterForReportPlaceDC;
