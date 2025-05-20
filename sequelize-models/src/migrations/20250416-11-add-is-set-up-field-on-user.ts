import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
    queryInterface.addColumn("users", "is_set_up", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_set_up"
    });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('users', 'is_set_up');
};
