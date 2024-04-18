"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class boardReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Board, Report }) {
      // define association here
      this.belongsTo(Board, { foreignKey: { allowNull: true } });
      this.belongsTo(Report);
      //this.belongsTo(AdsPlacement, { foreignKey: { allowNull: true } });
    }
  }
  boardReport.init(
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
      tableName: "boardreports",
      modelName: "BoardReport",
    }
  );
  return boardReport;
};
