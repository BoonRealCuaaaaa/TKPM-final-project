'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('boardRequests', {
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
      boardTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      boardId:  {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      requestStatus: {
        type: DataTypes.STRING,
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
    await queryInterface.dropTable('boardRequests');
  }
};