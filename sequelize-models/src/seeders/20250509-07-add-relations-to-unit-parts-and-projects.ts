import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkInsert('qualification_projects_parts_relations', [
		{
			qualification_project_id: 1,
			qualification_unit_part_id:1,
			part_order_index: 1,
		},
	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('qualification_projects_parts_relations', null, {});
};
exports.down = down;
