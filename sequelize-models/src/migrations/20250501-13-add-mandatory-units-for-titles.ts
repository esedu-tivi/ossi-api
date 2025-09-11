import { MandatoryQualificationUnitsForTitle } from '../models/mandatory-qualification-units-for-title';
// Update the import path if the file is located elsewhere, for example:
import { QualificationTitle } from '../models/qualification-title';
// Or ensure that '../qualification-title.ts' exists in the correct directory.
import { QualificationUnit } from '../models/qualification-unit';
import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.createTable('mandatory_qualification_units_for_title',
        {
            unitId: {
                type: DataTypes.INTEGER,
                field: "unit_id",
                primaryKey: true,
                references: {
                    model: "qualification_units",
                    key: "eperuste_id"
                }
            },
            titleId: {
                type: DataTypes.INTEGER,
                field: "title_id",
                primaryKey: true,
                references: {
                    model: "qualification_titles",
                    key: "eperuste_id"
                }
            }
        }
    );
    QualificationTitle.belongsToMany(QualificationUnit, {
        through: MandatoryQualificationUnitsForTitle,
        foreignKey: "title_id",
        otherKey: "unit_id",
        timestamps: false,
        onDelete: "CASCADE"
    });
};
export const down: Migration = async ({ context: queryInterface }) => {
    await queryInterface.dropTable('mandatory_qualification_units_for_title');
};
