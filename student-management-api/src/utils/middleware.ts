import { ErrorRequestHandler } from "express";
import { Prisma } from "prisma-orm";
import { sequelize } from "sequelize-models";

const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
    console.error('Error:', error)
    if (error.name === 'PrismaClientKnownRequestError') {
        if (error.code === "P2025") {
            return res.json({
                status: 404,
                success: false,
                message: error.message
            })
        }
    }
    if (res.locals._transaction) {
        await res.locals._transaction.rollback();
    }

    next(error);
};

const beginTransaction = async (req, res, next) => {
    res.locals._transaction = await sequelize.transaction();
    next();
};

const commitTransaction = async (req, res, next) => {
    await res.locals._transaction.commit();
};

const parseId = (req, res, next) => {
    if (req.params) {
        const { id } = req.params

        if (isNaN(id)) {
            return res.json({
                status: 400,
                success: false,
                message: "malformatted id"
            })
        }
        req.id = Number(id)
    }
    next()
}

export { errorHandler, beginTransaction, commitTransaction, parseId };
