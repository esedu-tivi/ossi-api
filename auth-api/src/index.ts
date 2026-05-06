import "dotenv";
import prisma from "prisma-orm";
import { createApp } from "./app.js";

const PORT = 3000;
const app = createApp({
    readinessCheck: async () => {
        await prisma.$queryRawUnsafe("SELECT 1");
        return true;
    }
});

app.listen(PORT, () => {
    console.log(`auth-api running on port ${PORT}`);
});
