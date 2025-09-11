import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  queryInterface.addColumn("student_worktime_tracker", "id", {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('student_worktime_tracker', 'id');
};
