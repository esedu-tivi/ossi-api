import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize";

export enum UserAuthorityScope {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  JobSupervisor = 'JOB_SUPERVISOR',
  Admin = 'ADMIN'
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare oid: string;
  declare isSetUp: boolean;
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
    primaryKey: true,
  },
  oid: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  isSetUp: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: "is_set_up"
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
