import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import knex from 'knex';
import knexConfig from './knexfile';

const db = knex(knexConfig.development);

db.raw('SELECT 1')
  .then(() => console.log('Postgres connection successful!'))
  .catch(err => console.error('Postgres connection failed:', err))
  .finally(() => db.destroy());
