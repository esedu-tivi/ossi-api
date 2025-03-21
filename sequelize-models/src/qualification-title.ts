import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize";
import { Qualification } from "./qualification";

export class QualificationTitle extends Model<InferAttributes<QualificationTitle>, InferCreationAttributes<QualificationTitle>> {
  declare id: CreationOptional<number>;
  declare qualificationId: ForeignKey<Qualification['id']>;
  declare name: string;
}

QualificationTitle.init({
  id: {
    type: DataTypes.INTEGER,
    field: "eperuste_id",
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(128)
  }
}, {
  tableName: "qualification_titles",
  underscored: true,
  timestamps: false,
  sequelize
})

QualificationTitle.belongsTo(Qualification);
Qualification.hasMany(QualificationTitle);