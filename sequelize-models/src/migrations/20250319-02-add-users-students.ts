import type { Migration } from '../sequelize';
import { DataTypes } from 'sequelize';
import { UserAuthorityScope } from '../models/user';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(128),
      field: "first_name",
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(128),
      field: "last_name",
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(128),
      field: "phone_number",
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
  });
  await queryInterface.createTable('students', {
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
      field: "group_id",
      allowNull: false
    },
    qualificationTitleId: {
      type: DataTypes.INTEGER,
      field: "qualification_title_id"
    },
    qualificationId: {
      type: DataTypes.INTEGER,
      field: "qualification_id",
      allowNull: false
    }
  })
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('students', {});
  await queryInterface.dropTable('users', {}); // empty options needed otherwise enums cause problems
};
