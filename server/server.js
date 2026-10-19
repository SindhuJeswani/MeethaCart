import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

// ES Module directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev mode for easy testing
    },
    credentials: true
  })
);

// Standard body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'MeethaCart API',
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development',
    emailMode: process.env.EMAIL_MODE || 'dev',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes (M1, M2 & M3)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Ensure admin user configured via env is present, active, and the ONLY admin
const ensureAdminExists = async () => {
  try {
    const { User } = await import('./models/User.js');
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    if (!adminEmail) return;

    // Purge old default admin and any duplicate admin accounts
    await User.deleteMany({
      $or: [
        { email: 'admin@meethacart.com' },
        { role: 'admin', email: { $ne: adminEmail } }
      ]
    });

    let admin = await User.findOne({ email: adminEmail });
    if (!admin && process.env.ADMIN_PASSWORD) {
      admin = await User.create({
        name: 'Sindhu Jeswani',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        isVerified: true,
        sellerStatus: 'approved',
        preferredLanguage: 'en',
        phone: '03000000001'
      });
      console.log('👑 [Auth] Admin account initialized.');
    } else if (admin) {
      let needsSave = false;
      if (admin.role !== 'admin') { admin.role = 'admin'; needsSave = true; }
      if (!admin.isVerified) { admin.isVerified = true; needsSave = true; }
      if (admin.name !== 'Sindhu Jeswani') { admin.name = 'Sindhu Jeswani'; needsSave = true; }
      if (needsSave) {
        await admin.save();
        console.log('👑 [Auth] Admin account synchronized.');
      }
    }
  } catch (err) {
    console.error('⚠️ [Auth] Warning ensuring admin user:', err.message);
  }
};

// Start Server after DB Connection
const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminExists();
    app.listen(PORT, () => {
      console.log(`\n🍰 ===============================================`);
      console.log(`🍰 MeethaCart Server running on http://localhost:${PORT}`);
      console.log(`🍰 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🍰 Email Mode:  ${process.env.EMAIL_MODE || 'dev'}`);
      console.log(`🍰 ===============================================\n`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
