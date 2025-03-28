import { after, beforeEach, test } from 'node:test';
import supertest from 'supertest';
import app from '../src/app';
import { QualificationCompetenceRequirement, QualificationCompetenceRequirements, QualificationProject, QualificationUnit, QualificationUnitPart, sequelize } from 'sequelize-models';
import { initialParts, initialProjects } from './test-helper';
import assert from 'node:assert';
import { getExternalQualificationData } from '../src/utils/eperuste';
import _ from 'lodash';

const api = supertest(app);

beforeEach(async () => {
  if ((await QualificationUnit.findAll()).length == 0) {
    const qualificationData = await getExternalQualificationData(7861752);

    await QualificationUnit.bulkCreate(qualificationData.units);
    await QualificationCompetenceRequirements.bulkCreate(qualificationData.competenceRequirementGroups);
    await QualificationCompetenceRequirement.bulkCreate(qualificationData.competenceRequirements);
  }

  await QualificationProject.truncate({ cascade: true });
  await QualificationUnitPart.truncate({ cascade: true });
  await QualificationProject.bulkCreate(initialProjects);
  await QualificationUnitPart.bulkCreate(initialParts);
});

test('right number of unit parts are returned as json', async () => {
  const response = await api
    .get('/qualification/parts')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.length, initialParts.length);
});

test('right unit part is returned when using id', async () => {
  const partToRequest = await QualificationUnitPart.findOne();

  const response = await api
    .get(`/qualification/parts/${partToRequest.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  
  assert.strictEqual(response.body.name, partToRequest.name);
});

test('adding parts works', async () => {
  await api
    .post('/qualification/parts')
    .send({ name: 'Ohjelmointi Teema 4', description: 'Description', materials: '-', parentQualificationUnit: 6816480})
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await api
    .get('/qualification/parts');

  assert.strictEqual(response.body.length, initialParts.length + 1);
});

test('updating parts works', async () => {
  const partToUpdate = await QualificationUnitPart.findOne();
  const projects = (await QualificationProject.findAll({ include: [{ association: QualificationProject.associations.tags }] })).reverse();

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

  assert(_.isEqual(partData.body, expectedPartData));
  projects.forEach(project => assert(projectData.body.find(projectTransported => projectTransported.id == project.id)))
});

after(async () => {
  await sequelize.close();
});
