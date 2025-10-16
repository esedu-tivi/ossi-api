import { after, beforeEach, test } from 'node:test';
import supertest from 'supertest';
import app from '../src/app.js';
import { initialParts, initialProjects, initialProjectTags, writePartsAndProjectsTestBaseData } from './test-helper.js';
import assert from 'node:assert';
import _ from 'lodash';
import { getExternalQualificationData } from '../src/utils/eperuste.js';
import prisma from '../src/prisma-client';

const api = supertest(app);

beforeEach(async () => {
  const qualificationData = await getExternalQualificationData(7861752);
  await writePartsAndProjectsTestBaseData(qualificationData)

  //await QualificationProjectTag.truncate({ cascade: true });
  await prisma.$queryRawUnsafe(`TRUNCATE TABLE "qualification_project_tags" RESTART IDENTITY CASCADE`)
  await prisma.qualificationProjectTag.createMany({ data: initialProjectTags });

  const competenceRequirementCount = await prisma.qualificationCompetenceRequirement.count()
  const competenceRequirementsCount = await prisma.qualificationCompetenceRequirements.count()

  if (!competenceRequirementCount) {
    await prisma.qualificationCompetenceRequirement.createMany({ data: qualificationData.competenceRequirements });
  }
  if (!competenceRequirementsCount) {
    await prisma.qualificationCompetenceRequirements.createMany({ data: qualificationData.competenceRequirementGroups });
  }

});

test('right number of projects are returned as json', async () => {
  const response = await api
    .get('/qualification/projects')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.projects.length, initialProjects.length);
});

test('right number of project tags are returned as json', async () => {
  const response = await api
    .get('/qualification/projects/tags')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.tags.length, initialProjectTags.length);
});

test('adding projects works with empty references', async () => {
  await api
    .post('/qualification/projects')
    .send({ name: 'TVP-Projekti 6', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [], tags: [], competenceRequirements: [] })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await api
    .get('/qualification/projects');

  assert.strictEqual(response.body.projects.length, initialProjects.length + 1);
});

test('adding project tags works', async () => {
  await api
    .post('/qualification/projects/tags')
    .send({ name: 'React' })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await api
    .get('/qualification/projects/tags');

  assert.strictEqual(response.body.tags.length, initialProjectTags.length + 1);
});

test('right project is returned when using id', async () => {
  const expectedProjectData = await prisma.qualificationProject.findFirst({
    include: {
      parts: true,
      tags: true,
      competenceRequirements: true
    },
  });

  const response = await api
    .get(`/qualification/projects/${expectedProjectData.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert(_.isEqual(expectedProjectData, response.body.project));
});

test('adding projects works with references', async () => {
  const part = await prisma.qualificationUnitPart.findFirst();
  const tag = await prisma.qualificationProjectTag.findFirst();
  const competenceRequirement = await prisma.qualificationCompetenceRequirement.findFirst();

  const projectCreateData = {
    name: 'TVP-Projekti 6',
    description: 'Description',
    materials: '-',
    duration: 100,
    isActive: true,
    includedInParts: [part.id],
    tags: [tag.id],
    competenceRequirements: [competenceRequirement.id]
  };

  const response = await api
    .post("/qualification/projects/")
    .send(projectCreateData)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const expectedProjectData = {
    id: response.body.project.id,
    name: 'TVP-Projekti 6',
    description: 'Description',
    materials: '-',
    duration: 100,
    isActive: true,
    parts: [part],
    tags: [tag],
    competenceRequirements: [{
      ...competenceRequirement,
      qualificationProjectId: response.body.project.id
    }]
  };

  assert(_.isEqual(expectedProjectData, response.body.project));
});

test('updating projects works with empty references', async () => {
  const existingProject = await prisma.qualificationProject.findFirst();

  const expectedProjectData = {
    id: existingProject.id,
    name: 'TVP-Projekti Updated',
    description: 'Description Updated',
    materials: 'Updated',
    duration: 101,
    isActive: false,
    parts: [],
    tags: [],
    competenceRequirements: [],
  };

  const projectUpdateData = {
    name: 'TVP-Projekti Updated',
    description: 'Description Updated',
    materials: 'Updated',
    duration: 101,
    isActive: false,
    includedInParts: [],
    tags: [],
    competenceRequirements: []
  };

  const response = await api
    .put(`/qualification/projects/${existingProject.id}`)
    .send(projectUpdateData)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert(_.isEqual(expectedProjectData, response.body.project));
});

test('updating projects works with references', async () => {
  const existingProject = await prisma.qualificationProject.findFirst();

  const part = await prisma.qualificationUnitPart.findFirst();
  const tag = await prisma.qualificationProjectTag.findFirst();
  const competenceRequirement = await prisma.qualificationCompetenceRequirement.findFirst();

  const projectUpdateData = {
    name: 'TVP-Projekti Updated',
    description: 'Description Updated',
    materials: 'Updated',
    duration: 101,
    isActive: false,
    includedInParts: [part.id],
    tags: [tag.id],
    competenceRequirements: [competenceRequirement.id]
  };

  const response = await api
    .put(`/qualification/projects/${existingProject.id}`)
    .send(projectUpdateData)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const expectedProjectData = {
    id: existingProject.id,
    name: 'TVP-Projekti Updated',
    description: 'Description Updated',
    materials: 'Updated',
    duration: 101,
    isActive: false,
    parts: [part],
    tags: [tag],
    competenceRequirements: [{
      ...competenceRequirement,
      qualificationProjectId: response.body.project.id
    }]
  };

  assert(_.isEqual(expectedProjectData, response.body.project));
});

test('all tags are retrieved', async () => {
  const response = await api
    .get("/qualification/projects/tags")
    .send()
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const expectedTags = await prisma.qualificationProjectTag.findMany();

  assert(_.isEqual(expectedTags, response.body.tags))
});

test('tags are created', async () => {
  const tagCreateData = { name: "test tag" };

  const response = await api
    .post("/qualification/projects/tags")
    .send(tagCreateData)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const expectedTag = {
    id: response.body.tag.id,
    name: tagCreateData.name
  }

  assert(_.isEqual(expectedTag, response.body.tag))
});

after(async () => {
  await prisma.$disconnect();
});
