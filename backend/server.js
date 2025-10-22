import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import resumeRoutes from './routes/resumeRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import matcherRoutes from './routes/matcherRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('[server] Environment loaded from:', path.join(__dirname, '.env'));
console.log('[server] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('[server] PORT:', process.env.PORT);

const app = express();

// Configure CORS to allow both local and production frontend
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://resume-guide-ai.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Request tracking middleware for monitoring concurrent requests
let activeRequests = 0;
let totalRequests = 0;
let peakConcurrentRequests = 0;

app.use((req, res, next) => {
  activeRequests++;
  totalRequests++;
  peakConcurrentRequests = Math.max(peakConcurrentRequests, activeRequests);
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    activeRequests--;
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      console.log(`[server] Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

// Health check endpoint with server stats
app.get('/api/health', (req, res) => res.json({ 
  status: 'OK',
  stats: {
    activeRequests,
    totalRequests,
    peakConcurrentRequests,
    uptime: Math.floor(process.uptime()),
    memoryUsage: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  }
}));

app.use('/api/resume', resumeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/jd', matcherRoutes);

// static uploads folder (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
app.get("/", (req, res) => {
  res.send("Server is live and working ");
});

app.listen(PORT, () => {
  console.log(`[server] Server running on port ${PORT}`);
  console.log(`[server] Ready to handle multiple concurrent requests`);
});
