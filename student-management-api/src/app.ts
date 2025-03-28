import express, { json } from 'express';
import { StudentRouter } from './student-router.js';
import { QualificationRouter } from './qualifications/qualification-router.js';
import { beginTransaction, commitTransaction, errorHandler } from './utils/middleware.js';

const app = express();

app.use(json());
app.use(beginTransaction);

app.use("/students", StudentRouter);
app.use("/qualification", QualificationRouter);

app.use(commitTransaction);
app.use(errorHandler);

export default app;
