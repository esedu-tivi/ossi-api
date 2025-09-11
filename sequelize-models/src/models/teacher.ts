import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../sequelize.js";
import { User } from "./user";

export class Teacher extends Model<InferAttributes<Teacher>, InferCreationAttributes<Teacher>> {
    declare id: ForeignKey<User['id']>;
    declare teachingQualificationTitleId: number | null;
    declare teachingQualificationId: number | null;
}

Teacher.init({
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
    teachingQualificationTitleId: {
        type: DataTypes.INTEGER,
    },
    teachingQualificationId: {
        type: DataTypes.INTEGER,
    }
}, {
    tableName: 'teachers',
    timestamps: false,
    sequelize
})
