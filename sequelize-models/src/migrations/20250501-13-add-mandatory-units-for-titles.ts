import { QualificationTitle } from '../qualification-title';
import { QualificationUnit } from '../qualification-unit';
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
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('mandatory_qualification_units_for_title');
};
