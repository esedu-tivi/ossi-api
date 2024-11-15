import express from "express";
import { PartsRouter } from "./parts/parts-router.js";
import { ProjectsRouter } from "./projects/projects-router.js";

const router = express();

router.use("/parts", PartsRouter);
router.use("/projects", ProjectsRouter);

export const QualificationRouter = router;
