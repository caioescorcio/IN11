import { DataSource } from 'typeorm';
import Evaluation from './entities/evaluation.js';
import EvaluationHate from './entities/evaluationHate.js';
import Hated from './entities/hated.js';
import Movie from './entities/movie.js';
import User from './entities/user.js';

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  entities: [User, Movie, Hated, Evaluation, EvaluationHate],
  migrations: ['migrations/*.cjs'],
  cli: {
    migrationsDir: 'migrations',
  },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
