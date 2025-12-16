import "dotenv";

import express from "express";
import { AuthRouter } from "./routes/auth-router.js";
import { MagicLinkRouter } from "./routes/magicLink-router.js";

const app = express();
app.use(express.json());

const PORT = 3000;


app.use("/login", AuthRouter)
app.use("/auth/magic-link", MagicLinkRouter)


app.listen(PORT, () => {
    console.log(`auth-api running on port ${PORT}`)
});
