import "dotenv";

import express from "express";
import { AuthRouter } from "./auth-router.js";

const app = express();

app.use(AuthRouter);

app.listen(3000);
