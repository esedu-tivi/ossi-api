import { after, test } from 'node:test';
import supertest from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma-client.js';

const api = supertest(app);

test('students are returned as json', async () => {
  await api
    .get('/students')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

after(async () => {
  await prisma.$disconnect();
});
