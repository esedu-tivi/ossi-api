import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
import { QualificationCompetenceRequirements } from "./qualification-competence-requirements.js";

export class QualificationCompetenceRequirement extends Model<InferAttributes<QualificationCompetenceRequirement>, InferCreationAttributes<QualificationCompetenceRequirement>> {
    declare id: number;
    declare groupId: ForeignKey<QualificationCompetenceRequirements["id"]>;
    declare description: string;
}

QualificationCompetenceRequirement.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: "eperuste_id",
            primaryKey: true,
        },
        groupId: {
            type: DataTypes.INTEGER.UNSIGNED,
            field: "group_id",
        },
        description: new DataTypes.STRING(1024),
    },
    {
        tableName: "qualification_competence_requirement",
        timestamps: false,
        sequelize
    }
);

QualificationCompetenceRequirement.belongsTo(QualificationCompetenceRequirements, {
    foreignKey: "groupId",
    targetKey: "id"
});

QualificationCompetenceRequirements.hasMany(QualificationCompetenceRequirement, {
    foreignKey: "groupId",
    as: "requirements"
});
