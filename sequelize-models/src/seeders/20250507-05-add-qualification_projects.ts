import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkInsert('qualification_projects', [
		{
			id: 1,
			name: 'TVP-Projekti 1',
			description: 'Project description',
			materials: 'Project materials',
			duration: 100,
			is_active: true,
		},
	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('qualification_projects', null, {});
};
exports.down = down;
