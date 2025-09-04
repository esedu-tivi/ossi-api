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
  // await queryInterface.removeConstraint("qualification_titles", "mandatory_qualification_units_for_title_title_id_fkey");
  // // Then delete from referenced table
  // await queryInterface.bulkDelete('qualification_titles', null, {});
  // Finally, remove the constraint if it still exists
  console.log("skip")
};
