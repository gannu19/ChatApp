const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { setupSocket } = require('./socket/socketHandler');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Elevate Labs ChatApp Server',
    timestamp: new Date().toISOString(),
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Setup Socket.IO Events
setupSocket(io);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] ChatApp Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
