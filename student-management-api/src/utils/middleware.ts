import { ErrorRequestHandler } from "express";
import { sequelize } from "sequelize-models";

const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
    await res.locals._transaction.rollback();
    next(error);
};

const beginTransaction = async (req, res, next) => {
    res.locals._transaction = await sequelize.transaction();
    next();
};

const commitTransaction = async (req, res, next) => {
    await res.locals._transaction.commit();
    next();
};

export { errorHandler, beginTransaction, commitTransaction };
