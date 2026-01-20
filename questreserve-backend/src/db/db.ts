import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import knex from 'knex';
import knexConfig from './knexfile';
import pkg from 'pg';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

export async function sanityCheckDbConnection() {
  const { Client } = pkg;
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  console.log('Establishing DB connection...');
  try {
    await client.connect();
    console.log('DB connection successful.');
  } catch (err) {
    console.error('DB connection failed: ', err);
    throw err;
  } finally {
    await client.end();
  }
}

export default db;
