import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db/database';
import authRoutes from './server/routes/auth.routes';
import studentRoutes from './server/routes/students.routes';
import fleetRoutes from './server/routes/fleet.routes';
import paymentRoutes from './server/routes/payments.routes';
import generalRoutes from './server/routes/general.routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database before starting the server
  try {
    await initDatabase();
  } catch (error) {
    console.error('🚨 FATAL: Database connection is not established. Cannot start the server:', error);
    process.exit(1);
  }

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/fleet', fleetRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api', generalRoutes);

  // Vite middleware for development & Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Full-Stack SBFMS Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
