import { Association, CreationOptional, DataTypes, ForeignKey, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationProject } from "./qualification-project.js";
import { QualificationUnit } from "./qualification-unit.js";

export class QualificationUnitPart extends Model<InferAttributes<QualificationUnitPart, { omit: "projects" }>, InferCreationAttributes<QualificationUnitPart, { omit: "projects" }>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare materials: string;
    declare qualificationUnitId: ForeignKey<QualificationUnit["id"]>;

    declare projects?: NonAttribute<QualificationProject[]>;
    declare unit?: NonAttribute<QualificationUnit>;

    declare addProject: HasManyAddAssociationMixin<QualificationProject, number>;

    declare static associations: {
        projects: Association<QualificationUnitPart, QualificationProject>;
        unit: Association<QualificationUnitPart, QualificationUnit>;
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
        description: new DataTypes.TEXT(),
        materials: new DataTypes.TEXT(),
        qualificationUnitId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: "qualification_unit_id",
            references: {
                model: QualificationUnit,
                key: "id"
            }
        },
    },
    {
        tableName: "qualification_unit_parts",
        timestamps: false,
        sequelize
    }
);


QualificationUnitPart.belongsTo(QualificationUnit, {
    as: "unit",
    foreignKey: "qualificationUnitId",
    targetKey: "id",
})

QualificationUnit.hasMany(QualificationUnitPart, {
    foreignKey: "qualificationUnitId"
});
