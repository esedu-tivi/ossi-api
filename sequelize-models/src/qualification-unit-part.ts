import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationProject } from "./qualification-project.js";

export class QualificationUnitPart extends Model<InferAttributes<QualificationUnitPart>, InferCreationAttributes<QualificationUnitPart>> {
    declare id: CreationOptional<number>;
    declare name: string;

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
    },
    {
        tableName: "qualification_unit_parts",
        timestamps: false,
        sequelize
    }
);
