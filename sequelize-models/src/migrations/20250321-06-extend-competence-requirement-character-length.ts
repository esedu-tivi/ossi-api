import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn('qualification_competence_requirement', 'description', {
    type: new DataTypes.STRING(256)
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn('qualification_competence_requirement', 'description', {
    type: new DataTypes.STRING(128)
  });
};
