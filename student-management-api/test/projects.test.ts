import { after, before, beforeEach, test } from 'node:test';
import supertest from 'supertest';
import app from '../src/app';
import { sequelize, QualificationProject, QualificationProjectTag, QualificationUnitPart, QualificationCompetenceRequirements, QualificationCompetenceRequirement } from 'sequelize-models';
import { initialParts, initialProjects, initialProjectTags } from './test-helper';
import assert from 'node:assert';
import _ from 'lodash';
import { QualificationUnit } from 'sequelize-models';
import { getExternalQualificationData } from '../src/utils/eperuste';

const api = supertest(app);

beforeEach(async () => {
  if ((await QualificationUnit.findAll()).length == 0) {
    const qualificationData = await getExternalQualificationData(7861752);

    await QualificationUnit.bulkCreate(qualificationData.units);
    await QualificationCompetenceRequirements.bulkCreate(qualificationData.competenceRequirementGroups);
    await QualificationCompetenceRequirement.bulkCreate(qualificationData.competenceRequirements);
  }

  await QualificationProject.truncate({ cascade: true });
  await QualificationProjectTag.truncate({ cascade: true });
  await QualificationUnitPart.truncate({ cascade: true });
  await QualificationProject.bulkCreate(initialProjects);
  await QualificationProjectTag.bulkCreate(initialProjectTags);
  await QualificationUnitPart.bulkCreate(initialParts);
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

test('adding projects works with empty references', async () => {
  await api
    .post('/qualification/projects')
    .send({ name: 'TVP-Projekti 6', description: 'Description', materials: '-', duration: 100, isActive: true, includedInParts: [], tags: [], competenceRequirements: [] })
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
    const expectedProjectData = await QualificationProject.findOne({
        include: [QualificationProject.associations.parts, QualificationProject.associations.tags, QualificationProject.associations.competenceRequirements],
    });

    const response = await api
        .get(`/qualification/projects/${expectedProjectData.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    assert(_.isEqual(expectedProjectData.toJSON(), response.body));
});

test('adding projects works with references', async (t) => {
    const parts = [await QualificationUnitPart.findOne({ raw: true })];
    const tags = [await QualificationProjectTag.findOne({ raw: true })];
    const competenceRequirements = [await QualificationCompetenceRequirement.findOne({ raw: true })];

    const projectCreateData = {
        name: 'TVP-Projekti 6',
        description: 'Description',
        materials: '-',
        duration: 100, 
        isActive: true,
        includedInParts: parts.map(part => part.id),
        tags: tags.map(tag => tag.id),
        competenceRequirements: competenceRequirements.map(req => req.id)
    };

    const response = await api
        .post("/qualification/projects/")
        .send(projectCreateData)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    const expectedProjectData = { 
        id: response.body.id,
        name: 'TVP-Projekti 6',
        description: 'Description',
        materials: '-',
        duration: 100, 
        isActive: true,
        parts: parts,
        tags: tags,
        competenceRequirements: competenceRequirements
    };

    assert(_.isEqual(expectedProjectData, response.body));
});

test('updating projects works with empty references', async (t) => {
    const existingProject = await QualificationProject.findOne();

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

    const projectUpdateData = { name: 'TVP-Projekti Updated', description: 'Description Updated', materials: 'Updated', duration: 101, isActive: false, includedInParts: [], tags: [], competenceRequirements: [] };

    const response = await api
        .put(`/qualification/projects/${existingProject.id}`)
        .send(projectUpdateData)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    
    assert(_.isEqual(expectedProjectData, response.body));
});

test('updating projects works with references', async (t) => {
    const existingProject = await QualificationProject.findOne();

    const parts = [await QualificationUnitPart.findOne({ raw: true })];
    const tags = [await QualificationProjectTag.findOne({ raw: true })];
    const competenceRequirements = [await QualificationCompetenceRequirement.findOne({ raw: true })];

    const expectedProjectData = {
        id: existingProject.id,
        name: 'TVP-Projekti Updated',
        description: 'Description Updated',
        materials: 'Updated',
        duration: 101,
        isActive: false,
        parts: parts,
        tags: tags,
        competenceRequirements: competenceRequirements
    };

    const projectUpdateData = {
        name: 'TVP-Projekti Updated',
        description: 'Description Updated',
        materials: 'Updated',
        duration: 101,
        isActive: false,
        includedInParts: parts.map(part => part.id),
        tags: tags.map(tag => tag.id),
        competenceRequirements: competenceRequirements.map(req => req.id)
    };

    const response = await api
        .put(`/qualification/projects/${existingProject.id}`)
        .send(projectUpdateData)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    assert(_.isEqual(expectedProjectData, response.body));
});

test('all tags are retrieved', async () => {
    const response = await api
        .get("/qualification/projects/tags")
        .send()
        .expect(200)
        .expect('Content-Type', /application\/json/);

    const expectedTags = await QualificationProjectTag.findAll({ raw: true });

    assert(_.isEqual(expectedTags, response.body))
});

test('tags are created', async () => {
    const tagCreateData = { tagName: "test tag" };

    const response = await api
        .post("/qualification/projects/tags")
        .send(tagCreateData)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    const expectedTag = {
        id: response.body.id,
        name: tagCreateData.tagName
    }

    assert(_.isEqual(expectedTag, response.body))
});

after(async () => {
  await sequelize.close();
});
