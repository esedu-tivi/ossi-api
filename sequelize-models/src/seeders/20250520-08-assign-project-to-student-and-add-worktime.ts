import type { Migration } from '../sequelize';

export const up: Migration = async ({ context: queryInterface }) => {

	await queryInterface.bulkInsert('assigned_projects_for_students', [
		// {
		// 	student_id: 1,
		// 	project_id: 679,
		// 	start_date: "2025-02-05 11:00:00+00:00",
		// 	deadline_date: "2025-07-05 08:00:00+00:00",
		// 	project_plan: "complete project tasks",
		// 	project_report: "link to my github with completed tasks",
		// },
		{
			student_id: 3,
			project_id: 679,
			start_date: "2025-02-05 11:00:00+00:00",
			deadline_date: "2025-07-05 08:00:00+00:00",
			project_plan: "complete project tasks",
			project_report: "link to my github with completed tasks",
		},
	]);


	await queryInterface.bulkInsert('student_worktime_tracker', [
		// {
		// 	student_id: 1,
		// 	project_id: 679,
		// 	start_date: "2025-02-05 12:00:00+00:00",
		// 	end_date: "2025-02-05 14:00:00+00:00",
		// 	description: "Init of project",
		// },
		{
			student_id: 3,
			project_id: 679,
			start_date: "2025-02-05 12:00:00+00:00",
			end_date: "2025-02-05 14:00:00+00:00",
			description: "Init of project",
		},

	]);
};
export const down: Migration = async ({ context: queryInterface }) => {
	await queryInterface.bulkDelete('student_worktime_tracker', null, {});
};
exports.down = down;
