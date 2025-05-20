import { QualificationProject } from "./qualification-project.js";
import { sequelize } from "./sequelize.js";

import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { QualificationUnitPart } from "./qualification-unit-part.js";

export class QualificationProjectPartLinks extends Model<InferAttributes<QualificationProjectPartLinks>, InferCreationAttributes<QualificationProjectPartLinks>> {
    declare qualificationProjectId: number
    declare qualificationUnitPartId: number
    declare partOrderIndex: number
}

QualificationProjectPartLinks.init(
    {
        qualificationProjectId: {
            type: DataTypes.INTEGER,
            field: "qualification_project_id",
            primaryKey: true,
            references: {
                model: QualificationProject,
                key: "id"
            }
        },
        qualificationUnitPartId: {
            type: DataTypes.INTEGER,
            field: "qualification_unit_part_id",
            primaryKey: true,
            references: {
                model: QualificationUnitPart,
                key: "id"
            }
        },
        partOrderIndex: {
            type: DataTypes.INTEGER,
            field: "part_order_index"
        }
    },
    {
        tableName: "qualification_projects_parts_relations",
        timestamps: false,
        sequelize
    }
);

QualificationProject.belongsToMany(QualificationUnitPart, {
    through: "qualification_projects_parts_relations",
    foreignKey: "qualification_project_id",
    otherKey: "qualification_unit_part_id",
    as: "parts",
    timestamps: false
});
QualificationUnitPart.belongsToMany(QualificationProject, {
    through: "qualification_projects_parts_relations",
    foreignKey: "qualification_unit_part_id",
    otherKey: "qualification_project_id",
    as: "projects",
    timestamps: false
});
