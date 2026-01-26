import express, { json } from 'express';
import { StudentRouter } from './handlers/student-router.js';
import { QualificationRouter } from './handlers/qualification-router.js';
import { PartsRouter } from "./handlers/parts-router.js";
import { ProjectsRouter } from "./handlers/projects-router.js";
import { UnitsRouter } from "./handlers/units-router.js";
import { ProjectTagsRouter } from "./handlers/project-tags-router.js"
import { errorHandler } from './utils/middleware.js';
import { TeacherRouter } from './handlers/teacher-router.js';
import { TitlesRouter } from './handlers/titles-router.js';
import { WorkplaceRouter } from './handlers/workplace-router.js';
import { InternshipRouter } from './handlers/internship-router.js';
import { JobSupervisorRouter } from './handlers/job-supervisor-router.js';

const app = express();

app.use(json());

app.use("/students", StudentRouter);
app.use("/teachers", TeacherRouter);
app.use("/qualification/projects/tags", ProjectTagsRouter)
app.use("/qualification/projects", ProjectsRouter);
app.use("/qualification/parts", PartsRouter);
app.use("/qualification/units", UnitsRouter);
app.use("/qualification/titles", TitlesRouter);
app.use("/qualification", QualificationRouter);
app.use("/workplace", WorkplaceRouter)
app.use("/internship", InternshipRouter)
app.use("/jobSupervisor", JobSupervisorRouter)

app.use(errorHandler);

export default app;
