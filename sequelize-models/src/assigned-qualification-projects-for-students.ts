import { QualificationProject } from "./qualification-project.js";
import { sequelize } from "./sequelize.js";

import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, } from "sequelize";
// import { QualificationUnitPart } from "./qualification-unit-part.js";
// import { Student } from "./student.js";
// import { QualificationUnit } from "./qualification-unit.js";

export enum ProjectStatus {
    WORKING = "WORKING",
    RETURNED = "RETURNED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export class AssignedProjectsForStudents extends Model {

}

AssignedProjectsForStudents.init(
    {
        studentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "student_id",
            allowNull: false,
        },
        projectId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "project_id",
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            field: "start_date",
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        deadlineDate: {
            type: DataTypes.DATE,
            field: "deadline_date",
            allowNull: true,
        },
        projectPlan: {
            type: DataTypes.STRING,
            field: "project_plan",
            allowNull: true,
        },
        projectReport: {
            type: DataTypes.STRING,
            field: "project_report",
            allowNull: true,
        },
        teacherComment: {
            type: DataTypes.STRING,
            field: "teacher_comment",
            allowNull: true,
        },
        projectStatus: {
            type: DataTypes.ENUM(...Object.values(ProjectStatus)),
            field: "project_status",
            defaultValue: "WORKING",
        }
    },
    {
        tableName: "assigned_projects_for_students",
        timestamps: false,
        sequelize
    }
);
AssignedProjectsForStudents.belongsTo(QualificationProject, {
    foreignKey: "projectId",
    targetKey: "id",
    as: "parentProject"
})



// // Student.belongsToMany(QualificationUnitPart, {
// //     through: "assigned_projects_for_students",
// //     foreignKey: "student_id",
// //     otherKey: "project_id",
// //     as: "assignedProjects",
// //     timestamps: false
// // });
// // QualificationUnit.belongsToMany(QualificationProject, {
// //     through: "assigned_projects_for_students",
// //     foreignKey: "project_id",
// //     otherKey: "student_id",
// //     timestamps: false
// // });
