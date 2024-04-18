'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BoardRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({BoardType, Board, Account}) {
      // define association here
      this.belongsTo(BoardType);
      this.belongsTo(Board);
      this.belongsTo(Account);
    }
  }
  BoardRequest.init({
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    requestStatus: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // image: DataTypes.STRING,
  }, {
    sequelize,
    tableName: "boardRequests",
    modelName: 'BoardRequest',
  });
  return BoardRequest;
};