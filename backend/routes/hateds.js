import express from 'express';
import { appDataSource } from '../datasource.js';
import Hated from '../entities/hated.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const normalizeHated = (hated) => ({
  user_id: hated.user_id,
  movie_id: hated.movie_id,
  movie: hated.movie
    ? {
        id: hated.movie.movie_id,
        title: hated.movie.title,
        description: hated.movie.description,
        release_date: hated.movie.release_date,
        rating: hated.movie.rating,
        image_link: hated.movie.image_link,
      }
    : undefined,
});

/**
 * @swagger
 * /api/hateds:
 *   get:
 *     summary: Get the logged-in user's hated movies
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of hated movies
 */
router.get('/', authenticateToken, function (req, res) {
  const currentUserId = req.user.userId;

  appDataSource
    .getRepository(Hated)
    .find({
      where: { user_id: currentUserId },
      relations: ['movie'],
    })
    .then(function (hateds) {
      res.json({ Hateds: hateds.map(normalizeHated) });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while fetching hateds' });
    });
});

/**
 * @swagger
 * /api/hateds/add:
 *   post:
 *     summary: Add a movie to the user's hateds
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movie_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie added to hateds
 *       400:
 *         description: Movie already in hateds
 */
router.post('/add', authenticateToken, function (req, res) {
  const hatedRepository = appDataSource.getRepository(Hated);
  const currentUserId = req.user.userId;

  const newHated = hatedRepository.create({
    user_id: currentUserId,
    movie_id: req.body.movie_id,
  });

  hatedRepository
    .insert(newHated)
    .then(function (newDocument) {
      res.status(201).json(newDocument);
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505') {
        res
          .status(400)
          .json({ message: 'This movie is already in your hateds.' });
      } else {
        res.status(500).json({ message: 'Error while creating the Hated' });
      }
    });
});

/**
 * @swagger
 * /api/hateds/{movieId}:
 *   delete:
 *     summary: Remove a movie from the user's hateds
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Removed successfully
 *       404:
 *         description: Hated not found
 */
router.delete('/:movieId', authenticateToken, function (req, res) {
  const currentUserId = req.user.userId;

  appDataSource
    .getRepository(Hated)
    .delete({
      user_id: currentUserId,
      movie_id: req.params.movieId,
    })
    .then(function (result) {
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Hated not found' });
      }
      res.status(204).send();
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while removing the Hated' });
    });
});

export default router;
