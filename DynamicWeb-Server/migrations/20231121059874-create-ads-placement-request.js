'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('adsPlacementRequests', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: DataTypes.STRING,
      adsPlacementId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      locationTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      adsTypeId: {
        type: DataTypes.INTEGER,
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
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('adsPlacementRequests');
  }
};