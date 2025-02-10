import express, { json } from 'express';
import { StudentRouter } from './student-router.js';
import { QualificationRouter } from './qualifications/qualification-router.js';

const app = express();

app.use(json());

app.use("/students", StudentRouter);
app.use("/qualification", QualificationRouter);

export default app;