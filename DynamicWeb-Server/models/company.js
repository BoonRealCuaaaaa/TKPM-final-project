'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({PermitRequest}) {
      // define association here
      this.hasMany(PermitRequest);

    }
  }
  Company.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false 
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false 
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false 
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false 
    },
  }, {
    sequelize,
    tableName: "companies",
    modelName: 'Company',
  });
  return Company;
};