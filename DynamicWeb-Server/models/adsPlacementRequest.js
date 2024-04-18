"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdsPlacementRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      AdsPlacement,
      LocationType,
      AdsType,
      Account,
    }) {
      // define association here
      this.belongsTo(AdsPlacement);
      this.belongsTo(LocationType);
      this.belongsTo(AdsType);
      this.belongsTo(Account);
    }
  }
  AdsPlacementRequest.init(
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
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      requestStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "adsPlacementRequests",
      modelName: "AdsPlacementRequest",
    }
  );
  return AdsPlacementRequest;
};
