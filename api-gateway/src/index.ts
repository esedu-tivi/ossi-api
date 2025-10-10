import express from 'express';
import graphqlRouter from './controllers/graphql.js';

const app = express();

app.use('/graphql', graphqlRouter);

app.listen(3000)
