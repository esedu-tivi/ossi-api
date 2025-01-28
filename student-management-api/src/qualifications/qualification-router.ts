import express from "express";
import { PartsRouter } from "./parts/parts-router.js";
import { ProjectsRouter } from "./projects/projects-router.js";
import { UnitsRouter } from "./units/units-router.js";

const router = express();

router.use("/parts", PartsRouter);
router.use("/projects", ProjectsRouter);
router.use("/units", UnitsRouter);

export const QualificationRouter = router;
