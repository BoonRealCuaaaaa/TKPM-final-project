'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BoardType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Board, BoardRequest}) {
      // define association here
      this.hasMany(Board);
      this.hasMany(BoardRequest);
    }
  }
  BoardType.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false 
    }
  }, {
    sequelize,
    tableName: "boardTypes",
    modelName: 'BoardType',
  });
  return BoardType;
};