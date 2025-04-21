import { QualificationProject } from "./qualification-project.js";
import { sequelize } from "./sequelize.js";

import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { QualificationUnitPart } from "./qualification-unit-part.js";
import { Student } from "./student.js";
import { QualificationUnit } from "./qualification-unit.js";

export class AssignedQualificationUnitsForStudents extends Model<InferAttributes<AssignedQualificationUnitsForStudents>, InferCreationAttributes<AssignedQualificationUnitsForStudents>> {
    declare studentId: number
    declare qualificationUnitId: number
}

AssignedQualificationUnitsForStudents.init(
    {
        studentId: {
            type: DataTypes.INTEGER,
            field: "student_id",
            primaryKey: true,
            references: {
                model: Student,
                key: "id"
            }
        },
        qualificationUnitId: {
            type: DataTypes.INTEGER,
            field: "qualification_unit_id",
            primaryKey: true,
            references: {
                model: QualificationUnit,
                key: "id"
            }
        },
    },
    {
        tableName: "assigned_qualification_units_for_students",
        timestamps: false,
        sequelize
    }
);

Student.belongsToMany(QualificationUnitPart, {
    through: "assigned_qualification_units_for_students",
    foreignKey: "student_id",
    otherKey: "qualification_unit_id",
    as: "assignedUnits",
    timestamps: false
});
QualificationUnit.belongsToMany(QualificationProject, {
    through: "assigned_qualification_units_for_students",
    foreignKey: "qualification_unit_id",
    otherKey: "student_id",
    timestamps: false
});
