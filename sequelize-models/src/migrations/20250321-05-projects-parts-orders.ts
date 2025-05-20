import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('qualification_projects_parts_relations', 'part_order_index', {
    type: DataTypes.INTEGER
  });
  await queryInterface.addColumn('qualification_unit_parts', 'unit_order_index', {
    type: DataTypes.INTEGER.UNSIGNED
  })
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('qualification_projects_parts_relations', 'part_order_index');
  await queryInterface.removeColumn('qualification_unit_parts', 'unit_order_index');
};
