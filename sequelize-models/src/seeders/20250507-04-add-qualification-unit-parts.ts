/** @format */

import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkInsert('qualification_unit_parts', [
		{
			id: 1,
			name: 'TVP Teema 1',
			description: 'Description',
			materials: 'Materials',
			qualification_unit_id: 6779606,
			unit_order_index: 1,
		},
	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('qualification_unit_parts', null, {});
};
