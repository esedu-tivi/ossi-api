import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";

export class QualificationProject extends Model<InferAttributes<QualificationProject>, InferCreationAttributes<QualificationProject>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare materials: string;
    declare duration: number;
    declare is_active: boolean;
}

QualificationProject.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: new DataTypes.STRING(128),
        description: new DataTypes.STRING(1024),
        materials: new DataTypes.STRING(1024),
        duration: DataTypes.INTEGER.UNSIGNED,
        is_active: DataTypes.BOOLEAN,
    },
    {
        tableName: "qualification_projects",
        timestamps: false,
        sequelize
    }
);
