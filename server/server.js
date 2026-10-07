import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabases } from './config/dbManager.js';
import { initAllModels } from './models/index.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import favouriteRoutes from './routes/favouriteRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to avoid blocking Postman
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI PG & Hostel Finder Backend - Vadodara',
    stage: 'Stage 3 (AI Layer with Gemini & Deterministic Ranking Engine)',
    features: ['gemini-ai', '2dsphere-geo', 'deterministic-ranking', 'dual-db-mongoose'],
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Server bootstrap
export const startServer = async (portOverride = null) => {
  try {
    // Initialize both logical databases (student_finder_db & hostel_finder_db)
    const { studentDb, hostelDb } = await initDatabases();
    initAllModels({ studentDb, hostelDb });

    // Auto-seed demo accounts and hostels if empty
    try {
      const { Hostel } = await import('./models/Hostel.js');
      const hostelCount = await Hostel.countDocuments();
      if (hostelCount === 0) {
        console.log('[Database] Empty database detected. Auto-seeding Vadodara colleges, demo hostels & users...');
        const { seedDatabase } = await import('./seed.js');
        await seedDatabase();
      }
    } catch (seedErr) {
      console.warn('[Database] Auto-seed note:', seedErr.message);
    }

    const listenPort = portOverride !== null ? portOverride : PORT;
    const server = app.listen(listenPort, () => {
      const boundPort = server.address().port;
      console.log(`\n==================================================`);
      console.log(` StayNear Vadodara Backend Server Active`);
      console.log(` Port: ${boundPort}`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health: http://localhost:${boundPort}/api/health`);
      console.log(`==================================================\n`);
    });

    return { app, server, studentDb, hostelDb };
  } catch (err) {
    console.error('Fatal Server Boot Error:', err);
    process.exit(1);
  }
};

// Start when executed directly
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirectRun || !process.env.NODE_ENV || process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
