import { AssignedProjectsForStudents } from "./models/assigned-qualification-projects-for-students.js";
import { QualificationProject } from "./models/qualification-project.js";
import { QualificationUnitPart } from "./models/qualification-unit-part.js";
import { QualificationUnit } from "./models/qualification-unit.js";
import { Student } from "./models/student.js";
import { WorktimeEntries } from "./models/worktime-entries.js";




export { sequelize } from "./sequelize.js";
export { QualificationProject } from "./models/qualification-project.js";
export { QualificationProjectTag } from "./models/qualification-project-tags.js";
export { QualificationProjectTagLinks } from "./models/qualification-project-tag-links.js";
export { QualificationUnitPart } from "./models/qualification-unit-part.js";
export { QualificationProjectPartLinks } from "./models/qualification-project-part-links.js";
export { QualificationCompetenceRequirements } from "./models/qualification-competence-requirements.js";
export { QualificationCompetenceRequirement } from "./models/qualification-competence-requirement.js";
export { CompetenceRequirementsInProjects } from "./models/competence-requirements-in-projects.js";
export { Qualification } from "./models/qualification.js";
export { QualificationTitle } from "./models/qualification-title.js";
export { User, UserAuthorityScope } from "./models/user.js";
export { Student } from "./models/student.js";
export { Teacher } from "./models/teacher.js";
export { QualificationUnit } from "./models/qualification-unit.js";
export { AssignedQualificationUnitsForStudents } from "./models/assigned-qualification-parts-for-students.js";
export { MandatoryQualificationUnitsForTitle } from "./models/mandatory-qualification-units-for-title.js";
export { AssignedProjectsForStudents } from "./models/assigned-qualification-projects-for-students.js";
export { WorktimeEntries } from "./models/worktime-entries.js"


AssignedProjectsForStudents.belongsTo(QualificationProject, {
    foreignKey: "project_id",
    targetKey: "id",
    as: "parentProject"
})


// WorktimeEntries.belongsTo(AssignedProjectsForStudents, {
//     foreignKey: "assigned_projects_for_students_pkey"
// });

// AssignedProjectsForStudents.hasMany(WorktimeEntries, {
//     foreignKey:""

// })










// Student.belongsToMany(QualificationUnitPart, {
//     through: "assigned_qualification_units_for_students",
//     foreignKey: "student_id",
//     otherKey: "qualification_unit_id",
//     as: "assignedUnits",
//     timestamps: false
// });
// QualificationUnit.belongsToMany(QualificationProject, {
//     foreignKey: "qualification_unit_id",
//     through: "assigned_qualification_units_for_students",
//     otherKey: "student_id",
//     timestamps: false
// });
// Student.belongsToMany(QualificationUnitPart, {
//     through: "assigned_projects_for_students",
//     foreignKey: "student_id",
//     otherKey: "project_id",
//     as: "assignedProjects",
//     timestamps: false
// });
// QualificationUnit.belongsToMany(QualificationProject, {
//     through: "assigned_projects_for_students",
//     foreignKey: "project_id",
//     otherKey: "student_id",
//     timestamps: false
// });
// QualificationProject.hasMany(AssignedProjectsForStudents, {
//     foreignKey: "id",
//     sourceKey: "project_id",
//     as: "assignedProjects"
// });

