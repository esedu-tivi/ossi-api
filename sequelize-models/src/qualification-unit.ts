import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";

export class QualificationUnit extends Model<InferAttributes<QualificationUnit>, InferCreationAttributes<QualificationUnit>> {
    declare id: CreationOptional<number>;
    declare name: string;

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
        name: new DataTypes.STRING(128),
    },
    {
        tableName: "qualification_units",
        timestamps: false,
        sequelize
    }
);
