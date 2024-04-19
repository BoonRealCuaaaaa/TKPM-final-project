"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class adsReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ AdsPlacement, Report }) {

      this.belongsTo(AdsPlacement, { foreignKey: { allowNull: true } });
      this.belongsTo(Report, { foreignKey: { allowNull: true }});

    }
  }
  adsReport.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      tableName: "adsreports",
      modelName: "AdsReport",
    }
  );
  return adsReport;
};
