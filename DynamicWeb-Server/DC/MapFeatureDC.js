const {AdsPlacementDAO} = require("../DAO/AdsPlacementDAO");

class MapFeatureDC {
  constructor(properties, geometry) {
    this.type = "Feature";
    Object.assign(this, {
      properties,
      geometry,
    });
  }

  getFeature() {
    return this;
  }
}

exports.MapFeatureDC = MapFeatureDC;
