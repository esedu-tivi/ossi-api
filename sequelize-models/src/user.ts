import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize";

export enum UserAuthorityScope {
  Student = 'student',
  Teacher = 'teacher',
  JobSupervisor = 'job supervisor',
  Admin = 'admin'
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phoneNumber: string;
  declare scope: UserAuthorityScope;
  declare archived: boolean;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  scope: {
    type: DataTypes.ENUM(...Object.values(UserAuthorityScope)),
    allowNull: false
  },
  archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "users",
  underscored: true,
  timestamps: false,
  sequelize
})
