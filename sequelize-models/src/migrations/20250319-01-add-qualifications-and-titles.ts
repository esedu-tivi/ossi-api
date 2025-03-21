import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('qualifications', {
    id: {
      type: DataTypes.INTEGER,
      field: "eperuste_id",
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(128)
    }
  });
  await queryInterface.createTable('qualification_titles', {
    id: {
      type: DataTypes.INTEGER,
      field: "eperuste_id",
      primaryKey: true
    },
    qualificationId: {
      type: DataTypes.INTEGER,
      field: "qualification_id",
      references: {
        model: "qualifications",
        key: "eperuste_id"
      }
    },
    name: {
      type: DataTypes.STRING(128)
    }
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('qualification_titles');
  await queryInterface.dropTable('qualifications');
};
