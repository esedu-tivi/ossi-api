import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../sequelize.js";
import { QualificationProject } from "./qualification-project.js";
import { QualificationCompetenceRequirement } from "./qualification-competence-requirement.js";

export class CompetenceRequirementsInProjects extends Model<InferAttributes<CompetenceRequirementsInProjects>, InferCreationAttributes<CompetenceRequirementsInProjects>> {
    declare projectId: ForeignKey<QualificationProject["id"]>;
    declare competenceRequirementId: ForeignKey<QualificationCompetenceRequirement["id"]>;
}

CompetenceRequirementsInProjects.init(
    {
        projectId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "qualification_project_id",
        },
        competenceRequirementId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            field: "qualification_competence_requirement_id",
        },
    },
    {
        tableName: "competence_requirements_in_projects",
        timestamps: false,
        sequelize
    }
);

QualificationProject.belongsToMany(QualificationCompetenceRequirement, {
    through: "competence_requirements_in_projects",
    foreignKey: "qualification_project_id",
    otherKey: "qualification_competence_requirement_id",
    as: "competenceRequirements",
    timestamps: false
});

QualificationCompetenceRequirement.belongsToMany(QualificationProject, {
    through: "competence_requirements_in_projects",
    foreignKey: "qualification_competence_requirement_id",
    otherKey: "qualification_project_id",
    timestamps: false
});
