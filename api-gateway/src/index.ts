import 'dotenv/config'
import express from 'express';

import { graphqlRouter } from './controllers/graphql.js';

const app = express();

app.use('/graphql', graphqlRouter);

console.log("test")
app.listen(3000)