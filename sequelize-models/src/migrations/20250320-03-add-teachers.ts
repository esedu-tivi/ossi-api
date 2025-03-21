import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('teachers', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "user_id",
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    teachingQualificationTitleId: {
      type: DataTypes.INTEGER
    },
    teachingQualificationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  })
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('teachers');
};
