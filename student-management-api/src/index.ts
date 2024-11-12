import 'dotenv/config'
import express from 'express';
import { StudentRouter } from './student-router.js';
import { QualificationRouter } from './qualification-router.js';

const app = express();

app.use("/students", StudentRouter);
app.use("/qualification", QualificationRouter);

app.listen(3000)
