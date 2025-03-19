import { after, beforeEach, test } from 'node:test';
import supertest from 'supertest';
import app from '../src/app';
import { QualificationUnitPart, sequelize } from 'sequelize-models';
import { initialParts } from './test-helper';
import assert from 'node:assert';

const api = supertest(app);

beforeEach(async () => {
  await QualificationUnitPart.truncate({ cascade: true });
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
  const partToRequest = initialParts[0];

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
  const partToUpdate = initialParts[0];

  const updatedPart = { name: 'Ohjelmointi Teema 4', projects: [] };

  await api
    .put(`/qualification/parts/${partToUpdate.id}`)
    .send(updatedPart)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const partAfterUpdate = await QualificationUnitPart.findOne({ where: { id: partToUpdate.id }});

  assert.strictEqual(partAfterUpdate.name, updatedPart.name);
});

after(async () => {
  await sequelize.close();
});
