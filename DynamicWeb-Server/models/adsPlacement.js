"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdsPlacement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Area,
      LocationType,
      AdsType,
      Board,
      Report,
      AdsPlacementRequest,
    }) {
      // define association here
      this.belongsTo(Area);
      this.belongsTo(LocationType);
      this.belongsTo(AdsType);
      this.hasMany(Board);
      this.hasMany(AdsPlacementRequest);
    }
  }
  AdsPlacement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: DataTypes.STRING,
      long: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      lat: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "adsPlacements",
      modelName: "AdsPlacement",
    }
  );
  return AdsPlacement;
};
