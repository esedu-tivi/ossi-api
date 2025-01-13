import { Association, CreationOptional, DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationProjectTag } from "./qualification-project-tags.js";
import { QualificationUnitPart } from "./qualification-unit-part.js";

export class QualificationProject extends Model<InferAttributes<QualificationProject, { omit: "tags" | "parts" }>, InferCreationAttributes<QualificationProject, { omit: "tags" | "parts" }>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare materials: string;
    declare duration: number;
    declare isActive: boolean;

    declare addTag: HasManyAddAssociationMixin<QualificationProjectTag, number>;
    declare addTags: HasManyAddAssociationsMixin<QualificationProjectTag, number>;

    declare tags?: NonAttribute<QualificationProjectTag[]>;
    declare parts?: NonAttribute<QualificationUnitPart[]>;

    declare static associations: {
        tags: Association<QualificationProject, QualificationProjectTag>;
        parts: Association<QualificationProject, QualificationUnitPart>;
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
