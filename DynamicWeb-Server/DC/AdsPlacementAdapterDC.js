const {MapFeatureDC} = require("./MapFeatureDC");
const { AdsPlacementDAO } = require("../DAO/AdsPlacementDAO");

class AdsPlacementAdapterDC  {
  constructor(adsPlacement, status) {
    this.adsPlacement = adsPlacement;
  }

  async getFeature() {
    const properties = {
      id: this.adsPlacement.id,
      area: this.adsPlacement.area,
      locationType: this.adsPlacement.locationType.locationType,
      adsType: this.adsPlacement.adsType.type,
      address: this.adsPlacement.address,
      status: this.adsPlacement.status,
      numBoard: await AdsPlacementDAO.getInstance().getNumBoardByAdsPlacementId(
        this.adsPlacement.id
      ),
    };

    const geometry = {
      coordinates: [this.adsPlacement.long, this.adsPlacement.lat],
      type: "Point",
    };


    return new MapFeatureDC(properties,geometry)
  }
}

exports.AdsPlacementAdapterDC = AdsPlacementAdapterDC;
