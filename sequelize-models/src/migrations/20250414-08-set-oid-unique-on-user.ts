import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
    queryInterface.changeColumn("users", "oid", {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    });
};

export const down: Migration = async ({ context: queryInterface }) => {
    queryInterface.changeColumn("users", "oid", {
        type: DataTypes.UUID,
        allowNull: false,
    });
};
