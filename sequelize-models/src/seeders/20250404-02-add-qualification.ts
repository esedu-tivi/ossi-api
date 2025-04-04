import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert('qualifications', [
    {
      eperuste_id: 7861752,
      name: 'Tieto- ja viestintätekniikan perustutkinto'
    }
  ]);
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('qualifications', null, {});
};
