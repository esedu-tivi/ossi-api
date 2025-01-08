import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

export class QualificationProjectTag extends Model<InferAttributes<QualificationProjectTag>, InferCreationAttributes<QualificationProjectTag>> {
    declare id: CreationOptional<number>;
    declare name: string;
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
