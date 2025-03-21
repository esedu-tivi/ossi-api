import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('job_supervisors', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "user_id",
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
  })
  await queryInterface.createTable('supervised_students_by_job_supervisors', {
    studentId: {
        type: DataTypes.INTEGER,
        field: 'student_id',
        references: {
          model: 'students',
          key: 'user_id'
        }
      },
      jobSupervisorId: {
        type: DataTypes.INTEGER,
        field: 'job_supervisor_id',
        references: {
          model: 'job_supervisors',
          key: 'user_id'
        }
      }
  })
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('supervised_students_by_job_supervisors');
  await queryInterface.dropTable('job_supervisors');
};
