import { QualificationProject } from "./qualification-project.js";
import { sequelize } from "./sequelize.js";

import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { QualificationUnitPart } from "./qualification-unit-part.js";
import { Student } from "./student.js";
import { QualificationUnit } from "./qualification-unit.js";

export enum ProjectStatus {
    WORKING = "WORKING",
    RETURNED = "RETURNED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export class AssignedProjectsForStudents extends Model<InferAttributes<AssignedProjectsForStudents>, InferCreationAttributes<AssignedProjectsForStudents>> {
    declare studentId: number
    declare projectId: number
    declare startDate: Date
    declare deadlineDate: Date
    declare projectPlan: String
    declare projectReport: String
    declare teacherComment: String
    declare projectStatus: ProjectStatus
}

AssignedProjectsForStudents.init(
    {
        studentId: {
            type: DataTypes.INTEGER,
            field: "student_id",
            allowNull: false,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.INTEGER,
            field: "project_id",
            allowNull: false,
            primaryKey: true,
        },
        startDate: {
            type: DataTypes.DATE,
            field: "start_date",
            allowNull: false,
            defaultValue: DataTypes.NOW,
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

Student.belongsToMany(QualificationUnitPart, {
    through: "assigned_projects_for_students",
    foreignKey: "student_id",
    otherKey: "project_id",
    as: "assignedProjects",
    timestamps: false
});
QualificationUnit.belongsToMany(QualificationProject, {
    through: "assigned_projects_for_students",
    foreignKey: "project_id",
    otherKey: "student_id",
    timestamps: false
});
