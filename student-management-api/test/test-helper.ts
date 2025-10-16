import prisma from "../src/prisma-client.js";

export const initialProjects = [
  { name: 'TVP-Projekti 1', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [] },
  { name: 'TVP-Projekti 2', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [] },
  { name: 'TVP-Projekti 3', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [] },
  { name: 'TVP-Projekti 4', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [] },
  { name: 'TVP-Projekti 5', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [] }
];

export const initialProjectTags = [
  { name: 'Ohjelmointi' },
  { name: 'Ryhmätyö' },
  { name: 'Python' },
  { name: 'JavaScript' },
  { name: 'React' }
];

export const initialParts = [
  { unitOrderIndex: 1, name: 'TVP Teema 1', description: 'Description', materials: '-', qualificationUnitId: 6779606 },
  { unitOrderIndex: 2, name: 'TVP Teema 2', description: 'Description', materials: '-', qualificationUnitId: 6779606 },
  { unitOrderIndex: 3, name: 'TVP Teema 3', description: 'Description', materials: '-', qualificationUnitId: 6779606 },
  { unitOrderIndex: 4, name: 'Ohjelmointi Teema 1', description: 'Description', materials: '-', qualificationUnitId: 6816480 },
  { unitOrderIndex: 5, name: 'Ohjelmointi Teema 2', description: 'Description', materials: '-', qualificationUnitId: 6816480 },
  { unitOrderIndex: 6, name: 'Ohjelmointi Teema 3', description: 'Description', materials: '-', qualificationUnitId: 6816480 }
];

// Define interfaces for the data structures
interface QualificationData {
  units: any[];
  competenceRequirementGroups: any[];
  competenceRequirements: any[];
}

interface QualificationProject {
  name: string;
  description: string;
  materials: string;
  duration: number;
  isActive: boolean;
  includedInParts: any[];
}

export const writePartsAndProjectsTestBaseData = async (qualificationData: QualificationData): Promise<void> => {
  if ((await prisma.qualificationUnit.count()) === 0) {

    await prisma.qualificationUnit.createMany({ data: qualificationData.units });
    await prisma.qualificationCompetenceRequirements.createMany({ data: qualificationData.competenceRequirementGroups });
    await prisma.qualificationCompetenceRequirement.createMany({ data: qualificationData.competenceRequirements });
  }

  // Delete all data from qualification_projects and qualification_unit_parts tables
  await prisma.$queryRawUnsafe(`TRUNCATE TABLE "qualification_projects" RESTART IDENTITY CASCADE`)
  await prisma.$queryRawUnsafe(`TRUNCATE TABLE "qualification_unit_parts" RESTART IDENTITY CASCADE`)

  await prisma.qualificationProject.createMany({
    data: initialProjects.map((project: QualificationProject) => ({
      name: project.name,
      description: project.description,
      materials: project.materials,
      duration: project.duration,
      isActive: project.isActive
    }))
  });

  await prisma.qualificationUnitPart.createMany({ data: initialParts });
}
