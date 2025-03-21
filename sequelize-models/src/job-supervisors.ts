import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize";
import { User } from "./user";

export class JobSupervisor extends Model<InferAttributes<JobSupervisor>, InferCreationAttributes<JobSupervisor>> {
  declare id: ForeignKey<User['id']>;
}

JobSupervisor.init({
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
}, {
  tableName: 'job_supervisors',
  underscored: true,
  timestamps: false,
  sequelize
})

JobSupervisor.belongsTo(User);
User.hasOne(JobSupervisor);
