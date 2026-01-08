import { type ErrorRequestHandler } from "express";
import { HttpError } from "../classes/HttpError.js";

const errorHandler: ErrorRequestHandler = async (error, req, res, next) => {
    console.error('Error:', error)
    if (error.name === 'PrismaClientKnownRequestError') {
        if (error.code === "P2025") {
            return res.json({
                status: 404,
                success: false,
                message: `[${error.code}] Not found`
            })
        }
        if (error.code === "P2002") {
            return res.json({
                status: 400,
                success: false,
                message: `[${error.code} ${error.message}]`
            })
        }
    }
    if (error instanceof HttpError) {
        return res.json({
            status: error.statusCode,
            success: false,
            message: error.message
        })
    }

    next(error);
};

const parseId = (req, res, next) => {
    if (req.params) {
        const { id } = req.params

        if (id === "" || Number.isNaN(Number(id))) {
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

export { errorHandler, parseId };
