"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Area,
      Report,
      PermitRequest,
      AdsPlacementRequest,
      BoardRequest
    }) {
      // define association here
      this.belongsTo(Area);
      this.hasMany(Report);
      this.hasMany(PermitRequest);
      this.hasMany(AdsPlacementRequest);
      this.hasMany(BoardRequest);
    }
  }
  Account.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
    firstName:  {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName:  {
      type: DataTypes.STRING,
      allowNull: false
    },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiredOtp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "accounts",
      modelName: "Account",
    }
  );
  return Account;
};

