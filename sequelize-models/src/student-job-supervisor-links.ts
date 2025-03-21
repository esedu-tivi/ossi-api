import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize";
import { Student } from "./student";
import { JobSupervisor } from "./job-supervisors";

export class StudentJobSupervisorLink extends Model<InferAttributes<StudentJobSupervisorLink>, InferCreationAttributes<StudentJobSupervisorLink>> {
  declare studentId: ForeignKey<Student['id']>;
  declare jobSupervisorId: ForeignKey<JobSupervisor['id']>;
}

StudentJobSupervisorLink.init({
  studentId: {
    type: DataTypes.INTEGER,
    references: {
      model: Student,
      key: 'user_id'
    }
  },
  jobSupervisorId: {
    type: DataTypes.INTEGER,
    references: {
      model: JobSupervisor,
      key: 'user_id'
    }
  }
}, {
  tableName: 'supervised_students_by_job_supervisors',
  underscored: true,
  timestamps: false,
  sequelize
})

JobSupervisor.belongsToMany(Student, { through: StudentJobSupervisorLink });
Student.belongsToMany(JobSupervisor, { through: StudentJobSupervisorLink });