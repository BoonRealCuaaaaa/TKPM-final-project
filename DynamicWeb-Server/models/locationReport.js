"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LocationReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Area, Report }) {
      // define association here
      this.belongsTo(Area);
      this.belongsTo(Report);
    }
  }
  LocationReport.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
      tableName: "locationReports",
      modelName: "LocationReport",
    }
  );
  return LocationReport;
};
