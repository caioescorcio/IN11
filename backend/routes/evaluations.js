import express from 'express';
import { appDataSource } from '../datasource.js';
import Evaluation from '../entities/evaluation.js';
import EvaluationHate from '../entities/evaluationHate.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

const normalizeEvaluation = (
  ev,
  includeMovie = false,
  hasHated = undefined,
) => ({
  evaluation_id: ev.evaluation_id,
  hating: ev.hating,
  comment: ev.comment_deleted ? null : ev.comment,
  comment_deleted: ev.comment_deleted,
  hates_count: ev.hates_count,
  created_at: ev.created_at,
  updated_at: ev.updated_at,
  user: ev.user
    ? {
        user_id: ev.user.user_id,
        firstname: ev.user.firstname,
        lastname: ev.user.lastname,
      }
    : undefined,
  ...(includeMovie && ev.movie
    ? {
        movie: {
          id: ev.movie.movie_id,
          title: ev.movie.title,
          description: ev.movie.description,
          release_date: ev.movie.release_date,
          rating: ev.movie.rating,
          image_link: ev.movie.image_link,
        },
      }
    : {}),
  ...(hasHated !== undefined ? { has_hated: hasHated } : {}),
});

/**
 * @swagger
 * /api/evaluations/movie/{movieId}:
 *   post:
 *     summary: Add or update an evaluation for a movie
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evaluation updated
 *       201:
 *         description: Evaluation created
 */
router.post('/movie/:movieId', authenticateToken, async function (req, res) {
  try {
    const evaluationRepository = appDataSource.getRepository(Evaluation);
    const { hating, comment } = req.body;
    const userId = req.user.userId;
    const movieId = req.params.movieId;

    const existingEval = await evaluationRepository.findOne({
      where: {
        user: { user_id: userId },
        movie: { movie_id: movieId },
      },
    });

    if (existingEval) {
      existingEval.hating = hating;
      existingEval.comment = comment;
      existingEval.comment_deleted = false;
      const updated = await evaluationRepository.save(existingEval);

      return res.status(200).json({
        evaluation_id: updated.evaluation_id,
        hating: updated.hating,
        comment: updated.comment,
        comment_deleted: updated.comment_deleted,
        hates_count: updated.hates_count,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      });
    }

    const newEval = evaluationRepository.create({
      hating,
      comment,
      user: { user_id: userId },
      movie: { movie_id: movieId },
    });

    const saved = await evaluationRepository.save(newEval);

    return res.status(201).json({
      evaluation_id: saved.evaluation_id,
      hating: saved.hating,
      comment: saved.comment,
      comment_deleted: saved.comment_deleted,
      hates_count: saved.hates_count,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while saving the evaluation' });
  }
});

/**
 * @swagger
 * /api/evaluations/movie/{movieId}:
 *   get:
 *     summary: Get all evaluations for a movie
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of evaluations
 */
router.get('/movie/:movieId', optionalAuth, async function (req, res) {
  try {
    const evaluationRepository = appDataSource.getRepository(Evaluation);
    const userId = req.user?.userId;

    const evaluations = await evaluationRepository.find({
      where: { movie: { movie_id: req.params.movieId } },
      relations: ['user'],
      order: { updated_at: 'DESC' },
    });

    let hatedSet = new Set();
    if (userId) {
      const hates = await appDataSource.getRepository(EvaluationHate).find({
        where: { user_id: userId },
      });
      hatedSet = new Set(hates.map((h) => h.evaluation_id));
    }

    res.json({
      evaluations: evaluations.map((ev) =>
        normalizeEvaluation(
          ev,
          false,
          userId ? hatedSet.has(ev.evaluation_id) : undefined,
        ),
      ),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching evaluations' });
  }
});

/**
 * @swagger
 * /api/evaluations/movie/{movieId}/stats:
 *   get:
 *     summary: Get average hating score and review count for a movie
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stats object
 */
router.get('/movie/:movieId/stats', async function (req, res) {
  try {
    const stats = await appDataSource
      .getRepository(Evaluation)
      .createQueryBuilder('evaluation')
      .select('AVG(evaluation.hating)', 'averagehating')
      .addSelect('COUNT(evaluation.evaluation_id)', 'totalReviews')
      .where('evaluation.movie_id = :movieId', { movieId: req.params.movieId })
      .getRawOne();

    res.json({
      average_hating:
        stats.averagehating != null ? parseFloat(stats.averagehating) : null,
      total_reviews: parseInt(stats.totalReviews) || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error calculating stats' });
  }
});

/**
 * @swagger
 * /api/evaluations/mine:
 *   get:
 *     summary: Get all evaluations submitted by the logged-in user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's evaluations with movie data
 */
router.get('/mine', authenticateToken, async function (req, res) {
  try {
    const evaluationRepository = appDataSource.getRepository(Evaluation);
    const userId = req.user.userId;

    const evaluations = await evaluationRepository.find({
      where: { user: { user_id: userId } },
      relations: ['movie'],
      order: { updated_at: 'DESC' },
    });

    res.json({
      evaluations: evaluations.map((ev) => normalizeEvaluation(ev, true)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching your evaluations' });
  }
});

/**
 * @swagger
 * /api/evaluations/{evaluationId}/comment:
 *   delete:
 *     summary: Delete the entire evaluation (owner or admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evaluation removed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Evaluation not found
 */
router.delete(
  '/:evaluationId/comment',
  authenticateToken,
  async function (req, res) {
    try {
      const evaluationRepository = appDataSource.getRepository(Evaluation);
      const evaluation = await evaluationRepository.findOne({
        where: { evaluation_id: req.params.evaluationId },
        relations: ['user'],
      });

      if (!evaluation) {
        return res.status(404).json({ message: 'Evaluation not found' });
      }

      const currentUserId = req.user.userId;
      const isOwner = evaluation.user.user_id === currentUserId;
      const isAdmin = req.user.is_admin === true;

      if (!isOwner && !isAdmin) {
        return res
          .status(403)
          .json({ message: 'Forbidden: You cannot delete this evaluation' });
      }

      await evaluationRepository.delete({
        evaluation_id: req.params.evaluationId,
      });

      res.status(200).json({ message: 'Evaluation successfully removed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting evaluation' });
    }
  },
);

/**
 * @swagger
 * /api/evaluations/{evaluationId}/hate:
 *   put:
 *     summary: Add a hate vote to a comment (once per user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote registered
 *       409:
 *         description: Already voted
 */
router.put('/:evaluationId/hate', authenticateToken, async function (req, res) {
  try {
    const hateRepo = appDataSource.getRepository(EvaluationHate);
    const userId = req.user.userId;
    const evaluationId = req.params.evaluationId;

    const existing = await hateRepo.findOne({
      where: { user_id: userId, evaluation_id: evaluationId },
    });

    if (existing) {
      return res.status(409).json({ message: 'Already voted on this comment' });
    }

    const hate = hateRepo.create({
      user_id: userId,
      evaluation_id: evaluationId,
    });
    await hateRepo.save(hate);
    await appDataSource
      .getRepository(Evaluation)
      .increment({ evaluation_id: evaluationId }, 'hates_count', 1);

    res.status(200).json({ message: 'Comment hated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error hating comment' });
  }
});

/**
 * @swagger
 * /api/evaluations/{evaluationId}/hate:
 *   delete:
 *     summary: Remove a hate vote from a comment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote removed
 *       400:
 *         description: Not voted
 */
router.delete(
  '/:evaluationId/hate',
  authenticateToken,
  async function (req, res) {
    try {
      const hateRepo = appDataSource.getRepository(EvaluationHate);
      const userId = req.user.userId;
      const evaluationId = req.params.evaluationId;

      const result = await hateRepo.delete({
        user_id: userId,
        evaluation_id: evaluationId,
      });

      if (result.affected === 0) {
        return res
          .status(400)
          .json({ message: 'You have not voted on this comment' });
      }

      const evaluation = await appDataSource
        .getRepository(Evaluation)
        .findOne({ where: { evaluation_id: evaluationId } });

      if (evaluation && evaluation.hates_count > 0) {
        await appDataSource
          .getRepository(Evaluation)
          .decrement({ evaluation_id: evaluationId }, 'hates_count', 1);
      }

      res.status(200).json({ message: 'Hate successfully removed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error removing hate' });
    }
  },
);

export default router;
