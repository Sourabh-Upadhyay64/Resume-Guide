import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('[server] Environment loaded from:', path.join(__dirname, '.env'));
console.log('[server] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('[server] PORT:', process.env.PORT);

import resumeRoutes from './routes/resumeRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import matcherRoutes from './routes/matcherRoutes.js';

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.use('/api/resume', resumeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/jd', matcherRoutes);

// static uploads folder (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
