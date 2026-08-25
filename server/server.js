const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Configs and Middlewares
const errorMiddleware = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const historyRoutes = require('./routes/historyRoutes');
const noteRoutes = require('./routes/noteRoutes');
const codeRoutes = require('./routes/codeRoutes');
const questionRoutes = require('./routes/questionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Socket Handler
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// CORS setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes Mounts
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint ${req.method} ${req.originalUrl} not found.` });
});

// Centralized error handler middleware
app.use(errorMiddleware);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: corsOptions,
});

app.set('io', io);

// Run socket logic
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 WebSocket server initialized`);
});

// Trigger dev server database reload
// Clear temporary memory database again
