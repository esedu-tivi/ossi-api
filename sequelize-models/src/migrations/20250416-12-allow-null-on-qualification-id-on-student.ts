import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
    queryInterface.changeColumn("students", "qualification_id", {
        type: DataTypes.INTEGER,
        allowNull: true
    });
};

export const down: Migration = async ({ context: queryInterface }) => {
    queryInterface.changeColumn("students", "qualification_id", {
        type: DataTypes.INTEGER,
    });
};
