import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("postgres://postgres:postgres@db:5432/postgres");
