import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationProject } from "./qualification-project.js";

export class QualificationUnitPart extends Model<InferAttributes<QualificationUnitPart, { omit: "projects" }>, InferCreationAttributes<QualificationUnitPart, { omit: "projects" }>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare qualificationUnitId: number;

    declare projects?: NonAttribute<QualificationProject[]>;

    declare static associations: {
        projects: Association<QualificationUnitPart, QualificationProject>;
    }
}

QualificationUnitPart.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: new DataTypes.STRING(128),
        qualificationUnitId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: "qualification_unit_id"
        }
    },
    {
        tableName: "qualification_unit_parts",
        timestamps: false,
        sequelize
    }
);
