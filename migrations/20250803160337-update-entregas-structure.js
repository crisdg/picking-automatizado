'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // PASO 1: Agregar unique constraint a nroEntrega en tabla Entregas
    await queryInterface.addConstraint('Entregas', {
      fields: ['nroEntrega'],
      type: 'unique',
      name: 'entregas_nroEntrega_unique'
    });

    // PASO 2: Agregar columna nroEntrega a tabla EntregaProductos
    await queryInterface.addColumn('EntregaProductos', 'nroEntrega', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true
    });

    // PASO 3: Eliminar la columna entregaId de EntregaProductos (si existe)
    try {
      await queryInterface.removeColumn('EntregaProductos', 'entregaId');
    } catch (error) {
      console.log('Columna entregaId no existe o ya fue eliminada');
    }
  },

  async down(queryInterface, Sequelize) {
    // PASO 1: Agregar de vuelta la columna entregaId
    await queryInterface.addColumn('EntregaProductos', 'entregaId', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true
    });

    // PASO 2: Eliminar la columna nroEntrega
    await queryInterface.removeColumn('EntregaProductos', 'nroEntrega');

    // PASO 3: Eliminar el unique constraint
    await queryInterface.removeConstraint('Entregas', 'entregas_nroEntrega_unique');
  }
};
