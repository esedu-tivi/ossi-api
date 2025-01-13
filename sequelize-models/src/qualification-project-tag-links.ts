import { QualificationProject } from "./qualification-project.js";
import { QualificationProjectTag } from "./qualification-project-tags.js";
import { sequelize } from "./sequelize.js";

import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class QualificationProjectTagLinks extends Model<InferAttributes<QualificationProjectTagLinks>, InferCreationAttributes<QualificationProjectTagLinks>> {
    declare qualificationProjectId: number
    declare qualificationProjectTagId: number
}

QualificationProjectTagLinks.init(
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
        qualificationProjectTagId: {
            type: DataTypes.INTEGER,
            field: "qualification_project_tag_id",
            primaryKey: true,
            references: {
                model: QualificationProjectTag,
                key: "id"
            }
        }
    },
    {
        tableName: "qualification_projects_tags_relations",
        timestamps: false,
        sequelize
    }
);

QualificationProject.belongsToMany(QualificationProjectTag, {
    through: "qualification_projects_tags_relations",
    foreignKey: "qualification_project_id",
    otherKey: "qualification_project_tag_id",
    as: "tags",
    timestamps: false
});
QualificationProjectTag.belongsToMany(QualificationProject, {
    through: "qualification_projects_tags_relations",
    foreignKey: "qualification_project_tag_id",
    otherKey: "qualification_project_id",
    as: "projects",
    timestamps: false
});
