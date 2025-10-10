import "dotenv";

import express from "express";
import { AuthRouter } from "./auth-router";

const app = express();

app.use(AuthRouter);

app.listen(3000);
