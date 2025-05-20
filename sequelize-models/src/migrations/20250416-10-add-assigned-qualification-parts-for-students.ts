import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.createTable('assigned_qualification_units_for_students', {
        studentId: {
            type: DataTypes.INTEGER,
            field: "student_id",
            primaryKey: true,
            references: {
                model: "students",
                key: "user_id"
            }
        },
        qualificationUnitPartId: {
            type: DataTypes.INTEGER,
            field: "qualification_unit_id",
            primaryKey: true,
            references: {
                model: "qualification_units",
                key: "eperuste_id"
            }
        }
    });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('assigned_qualification_units_for_students');
};
