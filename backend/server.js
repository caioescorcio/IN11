import cors from 'cors';
import express from 'express';
import logger from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { appDataSource } from './datasource.js';
import { swaggerSpec } from './docs/swagger.js';
import evaluationsRouter from './routes/evaluations.js';
import hatedsRouter from './routes/hateds.js';
import moviesRouter from './routes/movies.js';
import usersRouter from './routes/users.js';
import { jsonErrorHandler } from './services/jsonErrorHandler.js';
import { routeNotFoundJsonHandler } from './services/routeNotFoundJsonHandler.js';

const apiRouter = express.Router();
const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/', (req, res) => {
  res.send('Hello from Express!');
});
apiRouter.use('/users', usersRouter);
apiRouter.use('/movies', moviesRouter);
apiRouter.use('/hateds', hatedsRouter);
apiRouter.use('/evaluations', evaluationsRouter);
app.use('/api', apiRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(routeNotFoundJsonHandler); // this middleware must be registered after all routes to handle 404 correctly
app.use(jsonErrorHandler); // this error handler must be registered after all middleware to catch all errors
let isInitialized = false;

export async function ensureDb() {
  if (isInitialized) {
    return;
  }

  await appDataSource
    .initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
      isInitialized = true;
      console.log('DB initialized');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err);
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

export default app;
