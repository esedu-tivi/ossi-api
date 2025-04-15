import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';
import { QualificationCompletion } from '../student';

export const up: Migration = async ({ context: queryInterface }) => {
    queryInterface.addColumn("students", "qualification_completion", {
        type: DataTypes.ENUM(...Object.values(QualificationCompletion)),
        allowNull: true,
    });
};

export const down: Migration = async ({ context: queryInterface }) => {
    queryInterface.removeColumn("students", "qualification_completion");
};
