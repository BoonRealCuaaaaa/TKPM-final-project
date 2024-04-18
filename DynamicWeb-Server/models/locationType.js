'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LocationType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      AdsPlacement,
      AdsPlacementRequest
    }) {
      // define association here
      this.hasMany(AdsPlacement);
      this.hasMany(AdsPlacementRequest);
    }
  }
  LocationType.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    locationType: {
      type: DataTypes.STRING,
      allowNull: false 
    },
  }, {
    sequelize,
    tableName: "locationTypes",
    modelName: 'LocationType',
  });
  return LocationType;
};