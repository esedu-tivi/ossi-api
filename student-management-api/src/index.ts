import 'dotenv/config'
import express from 'express';
import { StudentRouter } from './student-router.js';

const app = express();

app.use("/students", StudentRouter);

app.listen(3000)
