import { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";

export const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize("postgres://postgres:postgres@db-test:5432/postgres", { logging: false })
  : new Sequelize("postgres://postgres:postgres@db:5432/postgres");

export const umzug = new Umzug({
  migrations: { glob: 'dist/migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console
});

export type Migration = typeof umzug._types.migration;
