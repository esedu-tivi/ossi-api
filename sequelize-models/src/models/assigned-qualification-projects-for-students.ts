import { sequelize } from "../sequelize.js";
import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, } from "sequelize";

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
    declare projectPlan: string
    declare projectReport: string
    declare teacherComment: string
    declare projectStatus: ProjectStatus
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
            allowNull: false,
            defaultValue: DataTypes.DATE,
        },
        deadlineDate: {
            type: DataTypes.DATE,
            field: "deadline_date",
            allowNull: false,
            defaultValue: DataTypes.DATE
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
        },
    },
    {
        tableName: "assigned_projects_for_students",
        timestamps: false,
        sequelize
    }
);
