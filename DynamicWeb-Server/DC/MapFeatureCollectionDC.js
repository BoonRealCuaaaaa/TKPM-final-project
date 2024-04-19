class MapFeatureCollectionDC {
  constructor() {
    (this.type = "FeatureCollection"), (this.features = []);
  }

  appendToList(item) {
    this.features.push(item);
  }
}

exports.MapFeatureCollectionDC = MapFeatureCollectionDC