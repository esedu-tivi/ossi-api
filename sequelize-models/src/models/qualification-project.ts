import { Association, CreationOptional, DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyRemoveAssociationsMixin, HasManyRemoveAssociationsMixinOptions, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../sequelize.js";
import { QualificationProjectTag } from "./qualification-project-tags.js";
import { QualificationUnitPart } from "./qualification-unit-part.js";
import { QualificationCompetenceRequirement } from "./qualification-competence-requirement.js";
import { AssignedProjectsForStudents } from "./assigned-qualification-projects-for-students.js";

export class QualificationProject extends Model<InferAttributes<QualificationProject, { omit: "tags" | "parts" }>, InferCreationAttributes<QualificationProject, { omit: "tags" | "parts" }>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare materials: string;
    declare duration: number;
    declare isActive: boolean;

    declare addTag: HasManyAddAssociationMixin<QualificationProjectTag, number>;
    declare addTags: HasManyAddAssociationsMixin<QualificationProjectTag, number>;
    declare removeTags: HasManyRemoveAssociationsMixin<QualificationProjectTag, number>

    declare addCompetenceRequirement: HasManyAddAssociationMixin<QualificationCompetenceRequirement, number>;
    declare addCompetenceRequirements: HasManyAddAssociationsMixin<QualificationCompetenceRequirement, number>;
    declare removeCompetenceRequirements: HasManyRemoveAssociationsMixin<QualificationCompetenceRequirement, number>

    declare addPart: HasManyAddAssociationMixin<QualificationUnitPart, number>;
    declare addParts: HasManyAddAssociationsMixin<QualificationUnitPart, number>;
    declare removeParts: HasManyRemoveAssociationsMixin<QualificationUnitPart, number>

    declare tags?: NonAttribute<QualificationProjectTag[]>;
    declare parts?: NonAttribute<QualificationUnitPart[]>;
    declare competenceRequirements?: NonAttribute<QualificationCompetenceRequirement[]>;

    declare static associations: {
        tags: Association<QualificationProject, QualificationProjectTag>;
        parts: Association<QualificationProject, QualificationUnitPart>;
        competenceRequirements: Association<QualificationProject, QualificationCompetenceRequirement>;
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

// Association: QualificationProject hasMany AssignedProjectsForStudents
// QualificationProject.hasMany(AssignedProjectsForStudents, {
//     foreignKey: "projectId",
//     sourceKey: "id",
//     as: "assignedProjects"
// });
