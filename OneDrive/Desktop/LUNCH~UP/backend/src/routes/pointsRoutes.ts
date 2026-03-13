import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { pointsController } from '../controllers/pointsController';

const router = express.Router();

router.use(authenticate, authorize(['user']));

router.get('/balance', pointsController.getBalance);
router.get('/transactions', pointsController.getTransactions);

export default router;

