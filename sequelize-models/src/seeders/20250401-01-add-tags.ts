import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkInsert('qualification_project_tags', [
    {
      name: 'Ohjelmointi'
    },
    {
      name: 'Ryhmätyö'
    },
    {
      name: 'Python'
    },
    {
      name: 'JavaScript'
    },
    {
      name: 'React'
    }
  ]);
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('qualification_project_tags', null, {});
};
