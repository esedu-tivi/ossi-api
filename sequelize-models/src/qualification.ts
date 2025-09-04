import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "./sequelize";

export class Qualification extends Model<InferAttributes<Qualification>, InferCreationAttributes<Qualification>> {
  declare id: CreationOptional<number>;
  declare name: string;
}

Qualification.init({
  id: {
    type: DataTypes.INTEGER,
    field: "eperuste_id",
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(256)
  }
}, {
  tableName: "qualifications",
  underscored: true,
  timestamps: false,
  sequelize
})
