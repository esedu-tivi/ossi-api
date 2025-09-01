import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {




  console.log("skip")
  // await queryInterface.bulkInsert('qualification_titles', [
  //   {
  //     eperuste_id: 10224,
  //     qualification_id: 7861752,
  //     name: 'Ohjelmistokehittäjä'
  //   }
  // ]);
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('qualification_titles', null, {});
};
