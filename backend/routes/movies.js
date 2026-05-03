import express from 'express';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movie.js';
import { authenticateToken } from '../middlewares/auth.js';

/**
 * @swagger
 * tags:
 *   - name: Movies
 *     description: Movies routes
 */

const router = express.Router();

const normalizeMovie = (movie) => ({
  id: movie.movie_id,
  title: movie.title,
  description: movie.description,
  release_date: movie.release_date,
  rating: movie.rating,
  image_link: movie.image_link,
});

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Récupérer la liste des films
 *     responses:
 *       200:
 *         description: Liste des films
 */

router.get('/', function (req, res) {
  appDataSource
    .getRepository(Movie)
    .find({})
    .then(function (movies) {
      res.json({ movies: movies.map(normalizeMovie) });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while fetching movies' });
    });
});

/**
 * @swagger
 * /api/movies/{movieId}:
 *   get:
 *     summary: Get a single movie
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie data
 *       404:
 *         description: Movie not found
 */
router.get('/:movieId', function (req, res) {
  appDataSource
    .getRepository(Movie)
    .findOneBy({ movie_id: req.params.movieId })
    .then(function (movie) {
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      res.json({ movie: normalizeMovie(movie) });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while fetching the movie' });
    });
});

/**
 * @swagger
 * /api/movies/new:
 *   post:
 *     summary: Ajouter un film
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               release_date:
 *                 type: string
 *               rating:
 *                 type: number
 *               image_link:
 *                 type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Film ajouté
 *       500:
 *         description: Erreur serveur
 */
router.post('/new', authenticateToken, function (req, res) {
  const movieRepository = appDataSource.getRepository(Movie);
  const newMovie = movieRepository.create({
    title: req.body.title,
    description: req.body.description,
    release_date: req.body.release_date,
    rating: req.body.rating,
    image_link: req.body.image_link,
  });

  movieRepository
    .insert(newMovie)
    .then(function (newDocument) {
      res.status(201).json(newDocument);
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505') {
        res.status(400).json({
          message: `Movie with the title "${newMovie.title}" already exists`,
        });
      } else {
        res.status(500).json({ message: 'Error while creating the movie' });
      }
    });
  console.log(req.body);
});

/**
 * @swagger
 * /api/movies/{movieId}:
 *   delete:
 *     summary: Delete a movie
 *     description: Deletes a movie by its ID
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the movie to delete
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Movie successfully deleted
 *       500:
 *         description: Error while deleting the movie
 */
router.delete('/:movieId', authenticateToken, function (req, res) {
  appDataSource
    .getRepository(Movie)
    .delete({ movie_id: req.params.movieId })
    .then(function () {
      res.status(204).json({ message: 'Movie successfully deleted' });
    })
    .catch(function () {
      res.status(500).json({ message: 'Error while deleting the movie' });
    });
});

export default router;
