import { QualificationProject } from "./qualification-project.js";
import { sequelize } from "../sequelize.js";
import { WorktimeEntries } from "./worktime-entries.js";

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

export class AssignedProjectsForStudents extends Model<InferAttributes<AssignedProjectsForStudents>, InferCreationAttributes<AssignedProjectsForStudents>> {
    // declare assignedProjectPkey: number
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
        // assignedProjectPkey: {
        //     type: DataTypes.INTEGER,
        //     primaryKey: true,
        //     field: "assigned_projects_for_students_pkey",
        // },
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
            allowNull: false,
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
