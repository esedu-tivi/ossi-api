import { Association, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../sequelize.js";
import { User } from "./user";
import { QualificationUnit } from "./qualification-unit";
import { QualificationProject } from "./qualification-project";

export enum QualificationCompletion {
    FullCompletion = 'FULL_COMPLETION',
    PartialCompletion = 'PARTIAL_COMPLETION'
}

export class Student extends Model<InferAttributes<Student>, InferCreationAttributes<Student>> {
    declare id: ForeignKey<User['id']>;
    declare groupId: string;
    declare qualificationCompletion: QualificationCompletion | null;
    declare qualificationTitleId: number | null;
    declare qualificationId: number | null;

    declare assignedUnits?: NonAttribute<QualificationUnit[]>;
    declare assignedProjects?: NonAttribute<QualificationProject[]>;

    declare static associations: {
        assignedUnits: Association<Student, QualificationUnit>;
    };
}

Student.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "user_id",
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    groupId: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    qualificationCompletion: {
        type: DataTypes.ENUM(...Object.values(QualificationCompletion)),
        allowNull: true
    },
    qualificationTitleId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qualificationId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'students',
    underscored: true,
    timestamps: false,
    sequelize
})

Student.belongsTo(User);
User.hasOne(Student);
