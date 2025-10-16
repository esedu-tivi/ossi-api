import { after, beforeEach, test } from 'node:test';
import supertest from 'supertest';
import app from '../src/app.js';
import { initialParts, writePartsAndProjectsTestBaseData } from './test-helper.js';
import assert from 'node:assert';
import { getExternalQualificationData } from '../src/utils/eperuste.js';
import _ from 'lodash';
import prisma from '../src/prisma-client.js';

const api = supertest(app);

beforeEach(async () => {
  const qualificationData = await getExternalQualificationData(7861752);
  await writePartsAndProjectsTestBaseData(qualificationData)
});

test('right number of unit parts are returned as json', async () => {
  const response = await api
    .get('/qualification/parts')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.parts.length, initialParts.length);
});

test('right unit part is returned when using id', async () => {
  const partToRequest = await prisma.qualificationUnitPart.findFirst();

  const response = await api
    .get(`/qualification/parts/${partToRequest.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.part.name, partToRequest.name);
});

test('adding parts works', async () => {
  await api
    .post('/qualification/parts')
    .send({ name: 'Ohjelmointi Teema 4', description: 'Description', materials: '-', parentQualificationUnit: 6816480 })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await api
    .get('/qualification/parts');

  assert.strictEqual(response.body.parts.length, initialParts.length + 1);
});

test('updating parts works', async () => {
  const partToUpdate = await prisma.qualificationUnitPart.findFirst();
  const projects = (await prisma.qualificationProject
    .findMany({
      include: { tags: true }
    }))
    .reverse();

  const updatedPart = {
    name: "Updated",
    qualificationUnitId: partToUpdate.qualificationUnitId,
    description: "Updated",
    materials: "Updated",
    projectsInOrder: projects.map(project => project.id)
  };

  const expectedPartData = {
    id: partToUpdate.id,
    name: "Updated",
    qualificationUnitId: partToUpdate.qualificationUnitId,
    description: "Updated",
    materials: "Updated",
  };

  const partData = await api
    .put(`/qualification/parts/${partToUpdate.id}`)
    .send(updatedPart)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const projectData = await api
    .get(`/qualification/parts/${partToUpdate.id}/projects`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  console.log(partData.body)
  console.log(expectedPartData)

  assert(_.isEqual(partData.body.part, expectedPartData));
  projects.forEach(project => assert(projectData.body.find(projectTransported => projectTransported.id === project.id)))
});

after(async () => {
  await prisma.$disconnect();
});
