import { after, beforeEach, test } from 'node:test';
import supertest from 'supertest';
import app from '../src/app';
import { sequelize, QualificationProject, QualificationProjectTag } from 'sequelize-models';
import { initialProjects, initialProjectTags } from './test-helper';
import assert from 'node:assert';

const api = supertest(app);

beforeEach(async () => {
  await QualificationProject.truncate({ cascade: true });
  await QualificationProjectTag.truncate({ cascade: true });
  await QualificationProject.bulkCreate(initialProjects);
  await QualificationProjectTag.bulkCreate(initialProjectTags);
});

test('right number of projects are returned as json', async () => {
  const response = await api
    .get('/qualification/projects')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  
  assert.strictEqual(response.body.length, initialProjects.length);
});

test('right number of project tags are returned as json', async () => {
  const response = await api
    .get('/qualification/projects/tags')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  
  assert.strictEqual(response.body.length, initialProjectTags.length);
});

test('adding projects works', async () => {
  await api
    .post('/qualification/projects')
    .send({ name: 'TVP-Projekti 6', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [] })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await api
    .get('/qualification/projects');

  assert.strictEqual(response.body.length, initialProjects.length + 1);
});

test('adding project tags works', async () => {
  await api
    .post('/qualification/projects/tags')
    .send({ name: 'React' })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const response = await api
    .get('/qualification/projects/tags');

  assert.strictEqual(response.body.length, initialProjectTags.length + 1);
});

test('right project is returned when using id', async () => {
  const projectToReturn = initialProjects[0];

  const response = await api
    .get(`/qualification/projects/${projectToReturn.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.name, projectToReturn.name);
  assert.strictEqual(response.body.description, projectToReturn.description);
});

after(async () => {
  await sequelize.close();
});
