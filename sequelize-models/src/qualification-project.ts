import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationProjectTag } from "./qualification-project-tags.js";

export class QualificationProject extends Model<InferAttributes<QualificationProject>, InferCreationAttributes<QualificationProject>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare materials: string;
    declare duration: number;
    declare isActive: boolean;

    declare tags?: NonAttribute<QualificationProjectTag[]>;

    declare static associations: {
        tags: Association<QualificationProject, QualificationProjectTag>;
    }
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
        isActive: {
            type: DataTypes.BOOLEAN,
            field: "is_active",
        },
    },
    {
        tableName: "qualification_projects",
        timestamps: false,
        sequelize
    }
);
