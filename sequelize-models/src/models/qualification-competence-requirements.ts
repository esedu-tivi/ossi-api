import { Association, CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../sequelize.js";
import { QualificationCompetenceRequirement } from "./qualification-competence-requirement.js";
import { QualificationUnit } from "./qualification-unit.js";

export class QualificationCompetenceRequirements extends Model<InferAttributes<QualificationCompetenceRequirements>, InferCreationAttributes<QualificationCompetenceRequirements>> {
    declare id: CreationOptional<number>;
    declare qualificationUnitId: ForeignKey<QualificationUnit["id"]>
    declare title: string;

    declare requirements: NonAttribute<QualificationCompetenceRequirement[]>;

    declare static associations: {
        requirements: Association<QualificationCompetenceRequirements, QualificationCompetenceRequirement>;
    }
}

QualificationCompetenceRequirements.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            field: "eperuste_id"
        },
        title: new DataTypes.STRING(128),
        qualificationUnitId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: "qualification_unit_id",
            references: {
                model: QualificationUnit,
                key: "id"
            }
        }
    },
    {
        tableName: "qualification_competence_requirements",
        timestamps: false,
        sequelize
    }
);
