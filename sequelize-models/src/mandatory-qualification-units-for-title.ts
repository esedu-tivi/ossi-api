import { Association, CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationUnit } from "./qualification-unit.js";
import { QualificationTitle } from "./qualification-title.js";

// TODO: check if a unit can belong to many titles
export class MandatoryQualificationUnitsForTitle extends Model<InferAttributes<MandatoryQualificationUnitsForTitle>, InferCreationAttributes<MandatoryQualificationUnitsForTitle>> {
    declare unitId: ForeignKey<QualificationUnit["id"]>;
    declare titleId: ForeignKey<QualificationTitle["id"]>
}

MandatoryQualificationUnitsForTitle.init(
    {
        unitId: {
            type: DataTypes.INTEGER,
            field: "unit_id",
            primaryKey: true,
            references: {
                model: QualificationUnit,
                key: "id"
            }
        },
        titleId: {
            type: DataTypes.INTEGER,
            field: "title_id",
            primaryKey: true,
            references: {
                model: QualificationTitle,
                key: "id"
            }
        }
    },
    {
        tableName: "mandatory_qualification_units_for_title",
        timestamps: false,
        sequelize
    }
);

QualificationTitle.belongsToMany(QualificationUnit, {
    through: MandatoryQualificationUnitsForTitle,
    foreignKey: "title_id",
    otherKey: "unit_id",
    as: "units",
    timestamps: false,
    onDelete: "CASCADE"
});

QualificationUnit.belongsToMany(QualificationTitle, {
    through: MandatoryQualificationUnitsForTitle,
    foreignKey: "unit_id",
    timestamps: false
});
