require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

// Routes
const projectRoutes = require('./routes/projects');
const sessionRoutes = require('./routes/sessions');
const strategyRoutes = require('./routes/strategies');
const optimizerRoutes = require('./routes/promptOptimizer');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

// Middleware
const { authenticate } = require('./middleware/auth');

// Services
const { AttackLoopService } = require('./services/attackLoop');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io and prisma available to routes
app.set('io', io);
app.set('prisma', prisma);

// Prisma middleware for routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', authenticate, projectRoutes);
app.use('/api/sessions', authenticate, sessionRoutes);
app.use('/api/strategies', authenticate, strategyRoutes);
app.use('/api/optimizer', authenticate, optimizerRoutes);
app.use('/api/reports', authenticate, reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join session room for real-time updates
  socket.on('join-session', (sessionId) => {
    socket.join(`session:${sessionId}`);
    console.log(`Client ${socket.id} joined session: ${sessionId}`);
  });

  socket.on('leave-session', (sessionId) => {
    socket.leave(`session:${sessionId}`);
    console.log(`Client ${socket.id} left session: ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Initialize attack loop service
const attackLoopService = new AttackLoopService(prisma, io);
app.set('attackLoopService', attackLoopService);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Felsefiy Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});
