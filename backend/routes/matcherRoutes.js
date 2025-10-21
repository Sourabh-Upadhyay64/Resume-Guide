import express from 'express';
import { matchJD } from '../controllers/matcherController.js';

const router = express.Router();

router.post('/match', matchJD);

export default router;
