'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Expenses', 'note', {
      type: Sequelize.STRING,
      allowNull: true // or false if you want to make it required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Expenses', 'note');
  }
};
