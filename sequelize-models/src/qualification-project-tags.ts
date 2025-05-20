import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationProject } from "./qualification-project.js";

export class QualificationProjectTag extends Model<InferAttributes<QualificationProjectTag, { omit: "projects" }>, InferCreationAttributes<QualificationProjectTag, { omit: "projects" }>> {
    declare id: CreationOptional<number>;
    declare name: string;

    declare projects: NonAttribute<QualificationProject>;

    declare static associations: {
        projects: Association<QualificationProjectTag, QualificationProject>;
    }
}

QualificationProjectTag.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: new DataTypes.STRING(128),
    },
    {
        tableName: "qualification_project_tags",
        timestamps: false,
        sequelize
    }
);
