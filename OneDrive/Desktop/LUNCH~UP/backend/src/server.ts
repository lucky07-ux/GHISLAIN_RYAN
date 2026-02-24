import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const app: Express = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    config.frontendUrl,
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from public directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}, express.static(path.join(process.cwd(), 'public/uploads')));

// Routes
app.use('/api/admin', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

// Error handler middleware (doit être le dernier)
app.use(errorHandler);

// Connexion à MongoDB
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lunchup';

    await mongoose.connect(mongoURI);

    console.log('✓ Connecté à MongoDB');
    console.log('✓ Base de données prête');
  } catch (error) {
    console.error('✗ Erreur de connexion MongoDB:', error);
    console.log('ℹ️  Assurez-vous que MongoDB est installé et démarré localement');
    console.log('ℹ️  Ou configurez MONGODB_URI dans le fichier .env');
    process.exit(1);
  }
};

// Démarrage du serveur
const startServer = async (): Promise<void> => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Démarrage du serveur
const PORT = config.port || 5001;
    app.listen(PORT, () => {
      console.log(`✓ Serveur démarré sur le port ${PORT}`);p[;]
      console.log(`✓ Environnement: ${config.nodeEnv}`);
      console.log(`✓ Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('✗ Erreur au démarrage:', error);
    process.exit(1);
  }
};

startServer();

export default app;
