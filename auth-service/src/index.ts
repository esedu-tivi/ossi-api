import express from 'express';
import { authRouter } from './auth-router.js';

const app = express();

app.use("/auth", authRouter)

app.listen(3001)