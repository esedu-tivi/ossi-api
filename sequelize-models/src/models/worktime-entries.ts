import { AssignedProjectsForStudents } from "./assigned-qualification-projects-for-students.js";
import { QualificationProject } from "./qualification-project.js";
import { sequelize } from "../sequelize.js";
import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, } from "sequelize";





export class WorktimeEntries extends Model<
    InferAttributes<WorktimeEntries>,
    InferCreationAttributes<WorktimeEntries>
> {
    declare id: number;
    declare studentId: number;
    declare projectId: number;
    declare startDate: Date;
    declare endDate: Date;
    declare description: string | null;
    declare keyStudentProject: string
}


WorktimeEntries.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        studentId: {
            type: DataTypes.INTEGER,
            field: "student_id",
            allowNull: false,
            references: {
                model: AssignedProjectsForStudents,
                key: "studentId",
            }
        },
        projectId: {
            type: DataTypes.INTEGER,
            field: "project_id",
            allowNull: false,
            references: {
                model: AssignedProjectsForStudents,
                key: "projectId",
            }
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
            type: DataTypes.STRING,
            field: "description",
            allowNull: true,
        },
        keyStudentProject: {
            type: DataTypes.STRING,
            field: "key_student_project",
            defaultValue: function () {
                return `${this.studentId}${this.projectId}`;
            }, allowNull: false,
        },
    },

    {
        sequelize,
        tableName: "student_worktime_tracker",
        timestamps: false
    }
)

