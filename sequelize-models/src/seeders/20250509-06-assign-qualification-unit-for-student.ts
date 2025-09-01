import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkInsert('assigned_qualification_units_for_students', [
		{
			student_id: 3,
			qualification_unit_id: 6779606,
		},
	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('assigned_qualification_units_for_students', null, {});
};
exports.down = down;
