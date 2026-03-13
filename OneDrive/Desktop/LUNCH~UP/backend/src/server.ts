import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
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
import vendorRoutes from './routes/vendorRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import vendorPortalRoutes from './routes/vendorPortalRoutes.js';
import pointsRoutes from './routes/pointsRoutes.js';
import clientRoutes from './routes/clientRoutes.js';

const app: Express = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', ({ userId, role }) => {
    if (userId) {
      socket.data.userId = userId;
      socket.data.role = role;
      socket.join(`${role}_${userId}`);
      console.log(`User ${role}_${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io for use in controllers/routes
export { io };

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
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
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/admin/vendors', vendorRoutes);
app.use('/api/admin/loyalty', loyaltyRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/vendor', vendorPortalRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/client', clientRoutes);

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

    // Démarrage du serveur HTTP avec Socket.io
    const PORT = config.port || 5000;
    server.listen(PORT, () => {
      console.log(`✓ Serveur démarré sur le port ${PORT}`);
      console.log(`✓ Socket.io connecté`);
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
