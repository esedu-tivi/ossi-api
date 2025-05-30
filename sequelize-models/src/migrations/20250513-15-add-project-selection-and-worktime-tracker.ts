import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';
import { ProjectStatus } from '../assigned-qualification-projects-for-students';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('assigned_projects_for_students', {
    studentId: {
      type: DataTypes.INTEGER,
      field: "student_id",
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      field: "project_id",
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      field: "start_date",
      allowNull: false,
    },
    deadlineDate: {
      type: DataTypes.DATE,
      field: "deadline_date",
      allowNull: true,
    },
    projectPlan: {
      type: DataTypes.TEXT,
      field: "project_plan",
      allowNull: true,

    },
    projectReport: {
      type: DataTypes.TEXT,
      field: "project_report",
      allowNull: true,

    },
    teacherComment: {
      type: DataTypes.TEXT,
      field: "teacher_comment",
      allowNull: true,
    },
    ProjectStatus: {
      type: DataTypes.ENUM(...Object.values(ProjectStatus)),
      field: "project_status",
      defaultValue: "WORKING",
    }
  });


  await queryInterface.createTable('student_worktime_tracker', {
    studentId: {
      type: DataTypes.INTEGER,
      field: "student_id",
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      field: "project_id",
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      field: "start_date",
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      field: "end_date",
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    }
  });

};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('student_worktime_tracker');

  await queryInterface.dropTable('assigned_projects_for_students');
};
