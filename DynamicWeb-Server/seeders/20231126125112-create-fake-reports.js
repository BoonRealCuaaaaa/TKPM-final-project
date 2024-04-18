"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.sequelize.query('SELECT * FROM boards');
    await queryInterface.sequelize.query('SELECT * FROM adsplacements');
    await queryInterface.sequelize.query('SELECT * FROM reporttypes');
    await queryInterface.sequelize.query('SELECT * FROM accounts');
    await queryInterface.sequelize.query('SELECT * FROM reporttypes');
    
    const {reports} = require("../data/reportsData");
    await queryInterface.bulkInsert(
      "reports",
      reports,
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("reports", null, {});
  },
};
