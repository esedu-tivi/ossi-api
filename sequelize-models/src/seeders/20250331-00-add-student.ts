import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert('users', [
    {
      id: 1,
      first_name: 'etunimi',
      last_name: 'sukunimi',
      email: 'sposti@localhost.fi',
      phone_number: '+358123456789',
      scope: 'student'
    }
  ]);
  await queryInterface.bulkInsert('students', [
    {
      user_id: 1,
      group_id: 'TiVi23A',
      qualification_title_id: 10224,
      qualification_id: 7861752
    }
  ]);
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('students', null, {});
  await queryInterface.bulkDelete('users', null, {});
};
