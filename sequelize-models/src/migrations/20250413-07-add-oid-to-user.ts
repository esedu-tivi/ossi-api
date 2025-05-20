import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
    queryInterface.addColumn("users", "oid", {
        type: DataTypes.UUID,
        allowNull: false
    });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('users', 'oid');
};
