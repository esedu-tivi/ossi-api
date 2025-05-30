import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkInsert('users', [
		{
			id: 3,
			oid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			first_name: 'etunimi',
			last_name: 'sukunimi',
			email: 'sposti@localhost.fi',
			phone_number: '+358123456789',
			scope: 'STUDENT',
		},
	]);
	await queryInterface.bulkInsert('students', [
		{
			user_id: 3,
			group_id: 'TiVi23A',
			qualification_title_id: 10224,
			qualification_id: 7861752,
		},

	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('students', null, {});
	await queryInterface.bulkDelete('users', null, {});
};
