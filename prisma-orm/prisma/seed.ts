import "dotenv";
import prisma, { enumUsersScope } from "../index.js"
import type { QualificationProject, QualificationUnitPart, Qualification, QualificationUnit, StudentGroup, Prisma } from "../index.js"

type TeacherData = {
  user: Prisma.UserCreateInput
  teacher: Omit<Prisma.TeacherCreateInput, 'users'>
  studentGroup: Prisma.StudentGroupCreateInput
}

const userData = {
  oid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  firstName: "etunimi",
  lastName: "sukunimi",
  email: "sposti@localhost.fi",
  phoneNumber: "+358123456789",
  scope: "STUDENT" as enumUsersScope,
}

const teacherData: TeacherData = {
  user: {
    oid: 'dd61f69e-9baf-478a-83ca-cbb5e9c051ec',
    firstName: "ossi",
    lastName: "opettaja",
    email: "ossi.opettaja@esedu.fi",
    phoneNumber: "+358123456789",
    scope: "TEACHER" as enumUsersScope,
  },
  teacher: {
    teachingQualificationId: 7861752,
  },
  studentGroup: {
    groupName: "TiVi24A"
  }
}

const qualification: Qualification = {
  id: 7861752,
  name: "Tieto- ja viestintätekniikan perustutkinto"
}

const qualificationUnit: QualificationUnit = {
  id: 6816481,
  name: "Ohjelmistokehittäjänä toimiminen",
  qualificationId: qualification.id,
  scope: 45
}

const qualificationUnitPart: QualificationUnitPart = {
  id: 172,
  name: 'OKK1 - Full Stack Open',
  description: 'Seuraa Helsingin yliopiston Full Stack Open -kurssin sisältöä. Jokainen kurssin osa on jaettu omaksi projektikseen. Tee projektit järjestyksessä ja seuraa niitä tehdessäsi työaikaa mahdollisimman tarkasti. Kokoa kurssin tehtävät yhteen Git-repositoryyn tai tee jokaisesta osasta oma repository. Kun osa on valmis liitä linkki repositoryyn Raportti-kohtaan.',
  materials: 'https://fullstackopen.com/#course-contents',
  qualificationUnitId: qualificationUnit.id,
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
  try {
    await prisma.$transaction(async (transaction) => {
      const result = await transaction.user.findUnique({ where: { oid: userData.oid } })
      if (result) {
        return console.log('Student is already in the database')
      }
      const createdUser = await transaction.user.create({ data: userData })

      await transaction.student.create({
        data: {
          userId: createdUser.id,
          qualificationTitleId: 10224,
          qualificationId: qualification.id,
        }
      })
      let studentGroup: StudentGroup | null;
      const groupName = 'TiVi23A'

      studentGroup = await transaction.studentGroup.findFirst({
        where: { groupName }
      })
      if (!studentGroup) {
        studentGroup = await transaction.studentGroup.create({
          data: { groupName }
        })
      }

      await transaction.student.update({
        where: { userId: createdUser.id },
        data: {
          studentGroupId: studentGroup.id
        }
      })

      const createdStudent = await transaction.student.findFirst({
        where: { userId: createdUser.id },
        include: {
          group: true
        }
      })

      console.log("Created user & student:", createdUser, createdStudent)
    })
  } catch (error) {
    return console.error(error)
  }
}

const addTags = async () => {
  try {
    await prisma.$transaction(async (transaction) => {
      const tags = ["Ohjelmointi", "Ryhmätyö", "Python", "JavaScript", "React"]
      const existingTags = new Set(
        (await transaction.qualificationProjectTag.findMany({ where: { name: { in: tags } } }))
          .filter((tag: { name: string | null }) => tag.name !== null)
          .map((tag: { name: string | null }) => tag.name as string)
      )

      const newTags = tags.filter(tag => !existingTags.has(tag)).map(tag => ({ name: tag }))

      if (newTags.length === 0) {
        return console.log("All tags already created")
      }

      const addedTags = await transaction.qualificationProjectTag.createManyAndReturn({
        data: newTags
      })

      console.log("Created qualificationProjectTags:", addedTags)
    })
  }
  catch (error) {
    console.error(error)
  }
}

const addQualification = async () => {
  try {
    await prisma.$transaction(async (transaction) => {
      const result = await transaction.qualification.findUnique({ where: { id: qualification.id } })
      if (result) {
        return console.info('qualification already created')
      }
      const createdQualification = await transaction.qualification.create({
        data: qualification
      })
      console.info("Created qualification:", createdQualification)
    })
  }
  catch (error) {
    console.error(error)
  }
}

const addQualificationUnit = async () => {
  try {
    const result = await prisma.qualificationUnit.findFirst({ where: { id: qualificationUnit.id } })
    if (result) {
      return console.log("Qualification unit already created")
    }
    const createdQualificationUnit = await prisma.qualificationUnit.create({ data: qualificationUnit })
    console.log('Created qualificationUnit:', createdQualificationUnit)
  }
  catch (error) {
    console.error(error)
  }
}

const addQualificationUnitParts = async () => {
  try {
    prisma.$transaction(async (transaction) => {
      const result = await transaction.qualificationUnitPart.findFirst({ where: { qualificationUnitId: qualificationUnitPart.qualificationUnitId } })
      if (result) {
        return console.log("QualificationUnitPart already created")
      }

      const createdQualificationUnitPart = await transaction.qualificationUnitPart.create({
        data: qualificationUnitPart
      })

      console.log("Created qualificationUnitPart:", createdQualificationUnitPart)
    })

  }
  catch (error) {
    console.error(error)
  }
}

const addQualificationProjects = async () => {
  try {
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
      .filter((project: { name: string | null }) => project.name !== null)
      .map((project: { name: string | null }) => project.name as string))

    const newQualificationProjects = qualificationProjects
      .filter(qualificationProject => qualificationProject.name && !existingQualificationProjectsNames.has(qualificationProject.name))

    if (newQualificationProjects.length === 0) {
      return console.log("QualificationUProjects already created")
    }

    const createdQualificationProjects = await prisma.qualificationProject.createManyAndReturn({ data: newQualificationProjects })
    console.log("Created qualificationProjects:", createdQualificationProjects)
  }
  catch (error) {
    console.error(error)
  }
}

const assignQualificationUnitForStudent = async () => {
  try {
    await prisma.$transaction(async (transaction) => {
      const foundUser = await transaction.user.findUnique({
        where: { oid: userData.oid },
        include: { students: {} }
      })
      const foundQualificationUnit = await transaction.qualificationUnitPart.findFirst({
        where: {
          qualificationUnitId: qualificationUnitPart.qualificationUnitId
        }
      })

      if (foundUser && foundQualificationUnit) {
        const result = await transaction.assignedQualificationUnitsForStudent.findFirst({
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
        await transaction.assignedQualificationUnitsForStudent.create({
          data: {
            studentId: foundUser.id,
            qualificationUnitId: qualificationUnitPart.qualificationUnitId
          }
        })

        console.log(`Assigned qualificationUnit ${qualificationUnitPart.name} for student oid ${foundUser.oid}`)
      }
    })

  }
  catch (error) {
    console.log(error)
  }
}

const addRelationsToUnitPartsAndProjects = async () => {
  try {
    await prisma.$transaction(async (transaction) => {
      const projectIds = qualificationProjects.map(project => project.id)

      const foundRelations = await transaction.qualificationProjectsPartsRelation.findMany({
        where: {
          qualificationProjectId: { in: projectIds }
        }
      })

      if (foundRelations.length === projectIds.length) {
        return console.log("UnitParts and projects relations already exists")
      }

      if (qualificationProjects[0] && qualificationProjects[1]) {
        await transaction.qualificationProjectsPartsRelation.createMany({
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
      }

      console.log("Created relation to UnitParts and Projects")
    })
  }
  catch (error) {
    console.error(error)
  }
}

const assignProjectForStudentAndAddWorktime = async () => {
  try {
    await prisma.$transaction(async (transaction) => {
      const foundUser = await transaction.user.findUnique({
        where: {
          oid: userData.oid
        },
        include: { students: true }
      })

      if (qualificationProjects[0]) {
        const foundQualificationProject = await transaction.qualificationProject.findUnique({
          where: {
            id: qualificationProjects[0].id
          }
        })

        if (!(foundUser && foundUser.students?.userId)) {
          return console.error(`User with ${userData.oid} missing`)
        }
        if (!foundQualificationProject) {
          return console.error("QualificationProject missing")
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

        const foundAssignedProject = await transaction.assignedProjectsForStudent.findFirst({
          where: {
            studentId: foundUser.students.userId,
            projectId: foundQualificationProject.id,
            ...assignedProject
          }
        })
        const foundWorktime = await transaction.worktimeEntries.findFirst({
          where: {
            studentId: foundUser.students.userId,
            projectId: foundQualificationProject.id,
            ...workTime
          }
        })

        if (foundAssignedProject && foundWorktime) {
          return console.log("Project already assigned and worktime added")
        }
        if (!foundAssignedProject) {
          const savedAssignedProject = await transaction.assignedProjectsForStudent.create({
            data: {
              studentId: foundUser.students.userId,
              projectId: foundQualificationProject.id,
              ...assignedProject
            }
          })
          console.log("Assigned project:", savedAssignedProject)
        }
        if (!foundWorktime) {
          const savedWorktime = await transaction.worktimeEntries.create({
            data: {
              studentId: foundUser.students.userId,
              projectId: foundQualificationProject.id,
              ...workTime
            }
          })
          console.log("Added worktime", savedWorktime)
        }
      }
    })
  }
  catch (error) {
    console.error(error)
  }
}

const addTeacher = async (teacherData: TeacherData) => {
  const newTeacher = await prisma.user.upsert(
    {
      where: { oid: teacherData.user.oid },
      update: {},
      create: {
        ...teacherData.user,
        teachers: {
          create: {
            ...teacherData.teacher,
            studentGroups: {
              connectOrCreate: {
                where: { groupName: teacherData.studentGroup.groupName },
                create: { groupName: teacherData.studentGroup.groupName }
              }
            }
          }
        }
      },
      include: {
        teachers: true,
      }
    }
  )

  console.log("Added teacher", newTeacher)
  return newTeacher
}

const main = async () => {
  console.log('seed script started')
  await addStudent()
  await addTags()
  await addQualification()
  await addQualificationUnit()
  await addQualificationUnitParts()
  await addQualificationProjects()
  await assignQualificationUnitForStudent()
  await addRelationsToUnitPartsAndProjects()
  await assignProjectForStudentAndAddWorktime()
  await addTeacher(teacherData)
}

main()
  .catch((error) => {
    if (error instanceof Error) {
      console.error(error);
    }
    else {
      console.log(error)
    }

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })
