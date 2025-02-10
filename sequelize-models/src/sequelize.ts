import { Sequelize } from "sequelize";

export const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize("postgres://postgres:postgres@db-test:5432/postgres", { logging: false })
  : new Sequelize("postgres://postgres:postgres@db:5432/postgres");
