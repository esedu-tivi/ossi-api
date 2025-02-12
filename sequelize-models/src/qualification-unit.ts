import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";

export class QualificationUnit extends Model<InferAttributes<QualificationUnit>, InferCreationAttributes<QualificationUnit>> {
    declare id: CreationOptional<number>;
    declare qualificationId: number;
    declare name: string;
    declare scope: number;

//    declare parts?: NonAttribute<QualificationUnitPart[]>;

    declare static associations: {
//        parts: Association<QualificationUnit, QualificationUnitPart>;
    }
}

QualificationUnit.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: "eperuste_id",
            primaryKey: true,
        },
        qualificationId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: "qualification_id"
        },
        name: new DataTypes.STRING(128),
        scope: DataTypes.INTEGER.UNSIGNED,
    },
    {
        tableName: "qualification_units",
        timestamps: false,
        sequelize
    }
);
