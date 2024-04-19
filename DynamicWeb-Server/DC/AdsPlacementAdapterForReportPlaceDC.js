const { MapFeatureDC } = require("./MapFeatureDC");
const { AdsPlacementDAO } = require("../DAO/AdsPlacementDAO");

class AdsPlacementAdapterForReportPlaceDC {
  constructor(adsPlacement, report) {
    this.adsPlacement = adsPlacement;
    this.report=report
  }

  async getFeature() {
    const properties = {
      id: this.adsPlacement.id,
      area: this.adsPlacement.area,
      reportType: this.report.ReportType.type,
      address: this.adsPlacement.address,
      lng: this.adsPlacement.long,
      lat: this.adsPlacement.lat,
    };

    const geometry = {
      coordinates: [this.adsPlacement.long, this.adsPlacement.lat],
      type: "Point",
    };

    return new MapFeatureDC(properties, geometry);
  }
}

exports.AdsPlacementAdapterForReportPlaceDC =
  AdsPlacementAdapterForReportPlaceDC;
