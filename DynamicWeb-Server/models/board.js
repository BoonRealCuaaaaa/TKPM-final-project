'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Board extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({BoardType, AdsPlacement, Report, PermitRequest, BoardRequest}) {
      // define association here
      this.belongsTo(BoardType);
      this.belongsTo(AdsPlacement);
      this.hasOne(PermitRequest);
      this.hasMany(BoardRequest);
    }
  }
  Board.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // image: DataTypes.STRING,
  }, {
    sequelize,
    tableName: "boards",
    modelName: 'Board',
  });
  return Board;
};