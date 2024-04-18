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
    await queryInterface.sequelize.query("SELECT * FROM areas");
    await queryInterface.sequelize.query("SELECT * FROM locationtypes");
    await queryInterface.sequelize.query("SELECT * FROM adstypes");

    const {adsPlacementsData} = require("../data/adsPlacementsData.js");
    await queryInterface.bulkInsert(
      "adsPlacements",
      adsPlacementsData,
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
    await queryInterface.bulkDelete("adsPlacements", null, {});
  },
};
