import "dotenv";
import { Prisma, PrismaClient, QualificationProject, User, enumUsersScope } from "../dist/client"
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const userData = {
  oid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  firstName: "etunimi",
  lastName: "sukunimi",
  email: "sposti@localhost.fi",
  phoneNumber: "+358123456789",
  scope: "STUDENT" as enumUsersScope,
}

const qualificationUnitPart = {
  id: 172,
  name: 'OKK1 - Full Stack Open',
  description: 'Seuraa Helsingin yliopiston Full Stack Open -kurssin sisältöä. Jokainen kurssin osa on jaettu omaksi projektikseen. Tee projektit järjestyksessä ja seuraa niitä tehdessäsi työaikaa mahdollisimman tarkasti. Kokoa kurssin tehtävät yhteen Git-repositoryyn tai tee jokaisesta osasta oma repository. Kun osa on valmis liitä linkki repositoryyn Raportti-kohtaan.',
  materials: 'https://fullstackopen.com/#course-contents',
  qualificationUnitId: 6779606,
  unitOrderIndex: 1,
}

const qualificationProjects: QualificationProject[] = [{
  id: 679,
  name: 'Full Stack Open - osa 0 - Web-sovellusten toiminnan perusteet',
  description: 'Tutustu kurssin johdanto-osaan ja tee siihen liittyvät tehtävät. Palauta osan tehtävät kurssin ohjeiden mukaisesti github-repositoryyn. Liitä linkki repositoryyn projektin raportti-kohtaan. Voit myös kirjoittaa raporttiin huomioita oppimistasi asioista. Muista täyttää työajanseurantaa koko projektin suorituksen ajan.',
  materials: 'https://fullstackopen.com/osa0',
  duration: 100,
  isActive: true,
},
{
  id: 681,
  name: 'Full Stack Open - osa 1 - Reactin perusteet',
  description: 'Tässä projektissa tutustut Reactin alkeisiin. Tutustu materiaaliin ja esimerkkeihin. Esimerkit kannattaa kokeilla käytännössä itsekin. Voit myös katsoa osaan 1 liittyvät luentovideot. Videot löytyvät tämän projektin materiaaleista. Tee kaikki osan tehtävät ja palauta ne samaan github-repositorylinkkinä. Voit tehdä osaa varten oman repositoryn tai voit käyttää samaa repositoryä, johon teit myös osan 0 tehtävät.',
  materials: 'https://fullstackopen.com/osa1',
  duration: 100,
  isActive: true,
}]

const addStudent = async () => {
  const result = await prisma.user.findUnique({ where: { oid: userData.oid } })
  if (result) {
    return console.log('Student is already in the database')
  }
  const createdUser = await prisma.user.create({ data: userData })
  const createdStudent = await prisma.student.create({
    data: {
      userId: createdUser.id,
      groupId: 'TiVi23A',
      qualificationTitleId: 10224,
      qualificationId: 7861752,
    }
  })

  console.log("Created user & student:", createdUser, createdStudent)
}

const addTags = async () => {
  const tags = ["Ohjelmointi", "Ryhmätyö", "Python", "JavaScript", "React"]
  const existingTags = new Set((await prisma.qualificationProjectTag.findMany({ where: { name: { in: tags } } })).map(tag => tag.name))

  const newTags = tags.filter(tag => !existingTags.has(tag)).map(tag => ({ name: tag }))

  if (newTags.length === 0) {
    return console.log("All tags already created")
  }

  const addedTags = await prisma.qualificationProjectTag.createManyAndReturn({
    data: newTags
  })

  console.log("Created qualificationProjectTags:", addedTags)
}

const addQualificationUnitParts = async () => {

  const result = await prisma.qualificationUnitPart.findFirst({ where: { qualificationUnitId: qualificationUnitPart.qualificationUnitId } })
  if (result) {
    return console.log("QualificationUnitPart already created")
  }

  const createdQualificationUnitPart = await prisma.qualificationUnitPart.create({
    data: qualificationUnitPart
  })

  console.log("Created qualificationUnitPart:", createdQualificationUnitPart)
}

const addQualificationProjects = async () => {
  const qualificationProjectNames = qualificationProjects
    .map(qualificationProject => qualificationProject.name)
    .filter(name => name !== null)

  const existingQualificationProjectsNames = new Set((
    await prisma.qualificationProject.findMany({
      where: {
        name: {
          in: qualificationProjectNames
        }
      }
    })
  )
    .map(project => project.name))

  const newQualificationProjects = qualificationProjects
    .filter(qualificationProject => qualificationProject.name && !existingQualificationProjectsNames.has(qualificationProject.name))

  if (newQualificationProjects.length === 0) {
    return console.log("QualificationUProjects already created")
  }

  const createdQualificationProjects = await prisma.qualificationProject.createMany({ data: newQualificationProjects })
  console.log("Created qualificationProjects:", createdQualificationProjects)
}

const assignQualificationUnitForStudent = async () => {
  const foundUser = await prisma.user.findUnique({
    where: { oid: userData.oid },
    include: { students: {} }
  })
  const foundQualificationUnit = await prisma.qualificationUnitPart.findFirst({
    where: {
      qualificationUnitId: qualificationUnitPart.qualificationUnitId
    }
  })

  if (foundUser && foundQualificationUnit) {
    const result = await prisma.assignedQualificationUnitsForStudent.findFirst({
      where: {
        AND: [
          { studentId: foundUser.id },
          { qualificationUnitId: qualificationUnitPart.qualificationUnitId }
        ]
      }
    })
    if (result) {
      return console.log(`Student oid: '${foundUser.oid}' is already assigned to '${foundQualificationUnit.name}'`)
    }
    await prisma.assignedQualificationUnitsForStudent.create({
      data: {
        studentId: foundUser.id,
        qualificationUnitId: qualificationUnitPart.qualificationUnitId
      }
    })

    console.log(`Assigned qualificationUnit ${qualificationUnitPart.name} for student oid ${foundUser.oid}`)
  }
}

const addRelationsToUnitPartsAndProjects = async () => {
  const projectIds = qualificationProjects.map(project => project.id)

  const foundRelations = await prisma.qualificationProjectsPartsRelation.findMany({
    where: {
      qualificationProjectId: { in: projectIds }
    }
  })

  if (foundRelations.length === projectIds.length) {
    return console.log("UnitParts and projects relations already exists")
  }

  await prisma.qualificationProjectsPartsRelation.createMany({
    data: [
      {
        qualificationProjectId: qualificationProjects[0].id,
        qualificationUnitPartId: qualificationUnitPart.id,
        partOrderIndex: 1
      },
      {
        qualificationProjectId: qualificationProjects[1].id,
        qualificationUnitPartId: qualificationUnitPart.id,
        partOrderIndex: 1
      }
    ]
  })

  console.log("Created relation to UnitParts and Projects")
}

const assignProjectForStudentAndAddWorktime = async () => {
  const foundUser = await prisma.user.findUnique({
    where: {
      oid: userData.oid
    },
    include: { students: true }
  })

  const foundQualificationProject = await prisma.qualificationProject.findUnique({ where: { id: qualificationProjects[0].id } })

  if (!(foundUser && foundUser.students?.userId)) {
    return console.log(`User with ${userData.oid} missing`)
  }
  if (!foundQualificationProject) {
    return console.log("QualificationProject missing")
  }

  const assignedProject = {
    startDate: "2025-02-05 11:00:00+00:00",
    deadlineDate: "2025-07-05 08:00:00+00:00",
    projectPlan: "complete project tasks",
    projectReport: "link to my github with completed tasks"
  }

  const workTime = {
    startDate: "2025-02-05 12:00:00+00:00",
    endDate: "2025-02-05 14:00:00+00:00",
    description: "Init of project",
  }

  const foundAssignedProject = await prisma.assignedProjectsForStudent.findFirst({ where: { studentId: foundUser.students.userId, projectId: foundQualificationProject.id, ...assignedProject } })
  /* const foundWorktime = await prisma.studentWorktimeTracker.findFirst({ where: { studentId: foundUser.students.userId, projectId: foundQualificationProject.id, ...workTime } })
  
  if (foundAssignedProject && foundWorktime) { */
  if (foundAssignedProject) {
    return console.log("project already assigned and worktime added")
  }
  if (!foundAssignedProject) {
    const savedAssignedProject = await prisma.assignedProjectsForStudent.create({
      data: {
        studentId: foundUser.students.userId,
        projectId: foundQualificationProject.id,
        ...assignedProject
      }
    })
    console.log("Assigned project:", savedAssignedProject)
  }

}

const main = async () => {
  await addStudent()
  await addTags()
  await addQualificationUnitParts()
  await addQualificationProjects()
  await assignQualificationUnitForStudent()
  await addRelationsToUnitPartsAndProjects()
  await assignProjectForStudentAndAddWorktime()
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })