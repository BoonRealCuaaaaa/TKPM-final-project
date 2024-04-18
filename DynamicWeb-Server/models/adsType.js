'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdsType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      AdsPlacement,
      AdsPlacementRequest,
    }) {
      // define association here
      this.hasMany(AdsPlacement);
      this.hasMany(AdsPlacementRequest);
    }
  }
  AdsType.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    type: { 
      type:DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: "adsTypes",
    modelName: 'AdsType',
  });
  return AdsType;
};