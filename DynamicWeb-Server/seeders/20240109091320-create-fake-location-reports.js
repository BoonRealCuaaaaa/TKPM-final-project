'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.sequelize.query('SELECT * FROM areas');
    await queryInterface.sequelize.query('SELECT * FROM reporttypes');
    await queryInterface.sequelize.query('SELECT * FROM accounts');
    
    const {locationReports} = require("../data/locationReportsData");
    await queryInterface.bulkInsert(
      "locationReports",
      locationReports,
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("locationReports", null, {});
  }
};
