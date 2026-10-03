# 💬 PulseChat — Full-Stack Real-Time Messaging Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Protected-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

A modern, production-grade real-time messaging platform engineered with **Express.js**, **Socket.IO**, **MongoDB (with high-performance compound indexing)**, and **React (Vite + Tailwind CSS)**.

---

## 📑 Table of Contents
- [Key Highlights & CV Mapping](#-key-highlights--cv-mapping)
- [Architecture & System Design](#-architecture--system-design)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [MongoDB Schema & Indexing Strategy](#-mongodb-schema--indexing-strategy)
- [REST API Reference (14 Endpoints)](#-rest-api-reference)
- [Socket.IO Real-Time Event Architecture](#-socketio-real-time-event-architecture)
- [Installation & Getting Started](#-installation--getting-started)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Automated Verification & Testing](#-automated-verification--testing)
- [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)

---

## 🎯 Key Highlights & CV Mapping

| CV Specification | Technical Implementation |
|---|---|
| **Real-time chat platform** | Supports both **one-to-one direct messaging** and **multi-user group channels** with persistent conversation history and live search. |
| **Socket.IO event communication** | Instant sub-millisecond message delivery, dedicated chat rooms (`chatId`), real-time typing indicators (`"User is typing..."`), live presence tracking (online/offline), and read receipts. |
| **10+ Scalable REST APIs** | **14 RESTful endpoints** built using Express.js and secured with JWT authentication, bcrypt password hashing, and input validation middleware across User, Chat, Group, and Message modules. |
| **Optimized MongoDB Schemas & Indexes** | High-performance compound indexes on `(chat, createdAt)` and `(users, updatedAt)` to optimize message retrieval and chat ordering under heavy traffic loads. |

---

## 🏛 Architecture & System Design

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (React 18 + Vite)                          |
|                                                                                   |
|   +-------------------+    +--------------------+    +------------------------+   |
|   |   AuthContext     |    |   SocketContext    |    |      ChatContext       |   |
|   | (JWT, User state) |    | (Typing, Presence) |    | (Active Chat, History) |   |
|   +---------+---------+    +---------+----------+    +-----------+------------+   |
+-------------|------------------------|---------------------------|----------------+
              |                        |                           |
       HTTP / REST (Axios)    WebSocket (Socket.IO)       HTTP / REST (Axios)
              |                        |                           |
+-------------v------------------------v---------------------------v----------------+
|                                 BACKEND (Node.js + Express)                       |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                         JWT Auth Middleware & Routes                      |   |
|   +---------------------------------------------------------------------------+   |
|   |  Auth Controller  |  User Controller  |  Chat Controller  |  Msg Controller | |
|   +---------------------------------------------------------------------------+   |
|   |                         Socket.IO Event Gateway                           |   |
|   |       • Personal User Rooms        • Dedicated Chat Rooms (chatId)        |   |
|   |       • Broadcast Typing State     • Live Online/Offline Presence         |   |
|   +---------------------------------------------------------------------------+   |
+--------------------------------------|--------------------------------------------+
                                       |
                           Mongoose ODM & Indexes
                                       |
+--------------------------------------v--------------------------------------------+
|                             DATABASE LAYER (MongoDB)                              |
|                                                                                   |
|   • Users Collection   : unique index on `email`, `username`                      |
|   • Chats Collection   : compound index on `{ users: 1, updatedAt: -1 }`          |
|   • Messages Collection: compound index on `{ chat: 1, createdAt: -1 }`           |
|                                                                                   |
|   *(Includes embedded In-Memory MongoDB fallback for zero-config local testing)*  |
+-----------------------------------------------------------------------------------+
```

---

## ✨ Features

### 🔒 Authentication & User Management
- Secure user registration and login with bcrypt password hashing (10 salt rounds).
- JWT (JSON Web Token) authentication with Bearer token validation middleware.
- User profile customization (display name, bio, avatar selection).
- 1-Click demo authentication buttons for instant testing.

### 💬 Real-Time Messaging & Rooms
- **One-on-One Messaging**: Private, encrypted direct conversations.
- **Group Channels**: Create multi-user channels, add/remove members, update group info, and assign admin roles.
- **Dedicated Chat Rooms**: Socket.IO room isolation per conversation ID.
- **Live Typing Indicators**: Visual broadcast (`"Alice is typing..."`) with debounced reset.
- **Read & Delivery Receipts**: Double checkmarks indicating delivery and read status.
- **Online Presence**: Dynamic detection and broadcast of active users and last seen status.

### 🔎 Search & Discovery
- Fast user search modal with debounced queries against indexed database fields.
- Filter conversations in the sidebar by name or participant in real time.

---

## 🛠 Tech Stack

- **Frontend**:
  - React 18, Vite
  - Tailwind CSS (Modern dark glassmorphism theme)
  - Lucide React (Clean icon system)
  - Socket.IO Client
  - Axios (with request/response interceptors)
  - date-fns (Time formatting)

- **Backend**:
  - Node.js (v18+) & Express.js
  - Socket.IO
  - Mongoose (MongoDB ODM)
  - JSON Web Tokens (`jsonwebtoken`)
  - `bcryptjs`
  - `mongodb-memory-server` (Zero-config embedded fallback)
  - CORS, Dotenv

---

## 📂 Project Directory Structure

```
ChatApp/
├── server/                          # Express & Socket.IO Backend
│   ├── config/
│   │   ├── db.js                    # Database connection manager with auto fallback
│   │   └── seed.js                  # Initial seed dataset (Alice, Bob, Charlie, Diana)
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe
│   │   ├── userController.js        # Search users, update profile
│   │   ├── chatController.js        # 1-on-1 & Group chat management
│   │   └── messageController.js     # Send, fetch paginated history, mark read
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT route protection
│   │   └── errorMiddleware.js       # Global error & 404 handler
│   ├── models/
│   │   ├── User.js                  # User schema with unique indexes & bcrypt hooks
│   │   ├── Chat.js                  # Chat schema with compound indexes (users, updatedAt)
│   │   └── Message.js               # Message schema with compound index (chat, createdAt)
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── userRoutes.js            # /api/users endpoints
│   │   ├── chatRoutes.js            # /api/chats endpoints
│   │   └── messageRoutes.js         # /api/messages endpoints
│   ├── socket/
│   │   └── socketHandler.js         # Socket.IO event handlers
│   ├── test-api.js                  # Automated verification test suite
│   ├── .env                         # Server environment configuration
│   ├── package.json
│   └── server.js                    # HTTP + Socket.IO server entrypoint
│
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx        # Login screen with instant demo logins
│   │   │   │   └── Register.jsx     # Registration screen
│   │   │   ├── chat/
│   │   │   │   ├── Sidebar.jsx      # Chat list, filter, user search trigger
│   │   │   │   ├── ChatListItem.jsx # Individual chat card with badges & snippet
│   │   │   │   ├── ChatArea.jsx     # Main chat viewport & room header
│   │   │   │   ├── MessageBubble.jsx# Message bubble with time & read status
│   │   │   │   ├── MessageInput.jsx # Input with typing emitter & emoji picker
│   │   │   │   ├── UserSearchModal.jsx # User directory search modal
│   │   │   │   ├── GroupModal.jsx   # Group chat creator modal
│   │   │   │   ├── GroupInfoModal.jsx # Group admin & member management modal
│   │   │   │   └── ProfileModal.jsx # User profile editor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication & user state
│   │   │   ├── SocketContext.jsx    # Socket.IO connection & real-time events
│   │   │   └── ChatContext.jsx      # Active chat, messages feed & notifications
│   │   ├── services/
│   │   │   └── api.js               # Axios API client with JWT interceptor
│   │   ├── App.jsx
│   │   ├── index.css                # Tailwind styling & custom scrollbars
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json                     # Root workspace script runner (concurrently)
└── README.md                        # Documentation
```

---

## 🗄 MongoDB Schema & Indexing Strategy

### 1. `User` Schema
- `username`: String (required, unique, indexed, lowercase)
- `email`: String (required, unique, indexed, lowercase)
- `password`: String (bcrypt hashed)
- `name`: String (required)
- `avatar`: String
- `bio`: String
- `isOnline`: Boolean
- `lastSeen`: Date

### 2. `Chat` Schema
- `chatName`: String
- `isGroupChat`: Boolean (default `false`)
- `users`: `[ObjectId]` (refs to `User`)
- `latestMessage`: `ObjectId` (ref to `Message`)
- `groupAdmin`: `ObjectId` (ref to `User`)
- `groupDescription`: String
- `groupAvatar`: String
- **Compound Index**:
  ```javascript
  chatSchema.index({ users: 1, updatedAt: -1 });
  ```
  *Ensures instantaneous fetching and sorting of a user's active conversation list ordered by recent activity.*

### 3. `Message` Schema
- `sender`: `ObjectId` (ref to `User`, indexed)
- `content`: String (required)
- `chat`: `ObjectId` (ref to `Chat`, indexed)
- `readBy`: `[ObjectId]` (refs to `User`)
- `timestamps`: `createdAt`, `updatedAt`
- **Compound Index**:
  ```javascript
  messageSchema.index({ chat: 1, createdAt: -1 });
  ```
  *Optimizes chronological pagination and message retrieval for high-traffic chat rooms.*

---

## 🌐 REST API Reference

All protected endpoints require the header: `Authorization: Bearer <token>`.

### 1. Auth Module
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `username`, `email`, `password`, `avatar`, `bio`) |
| `POST` | `/api/auth/login` | Public | Authenticate user (`loginId`, `password`) and receive JWT token |
| `GET` | `/api/auth/me` | Private | Fetch current authenticated user profile |

### 2. User Module
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users?search=<query>` | Private | Search registered users by name, username, or email |
| `PUT` | `/api/users/profile` | Private | Update user display name, bio, avatar, or password |
| `GET` | `/api/users/:id` | Private | Fetch public user profile by ID |

### 3. Chat & Group Module
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/chats` | Private | Create or fetch existing 1-on-1 direct chat (`userId`) |
| `GET` | `/api/chats` | Private | Fetch all user conversations populated with latest message |
| `GET` | `/api/chats/:id` | Private | Fetch details of a specific chat room |
| `POST` | `/api/chats/group` | Private | Create a group chat (`name`, `users`, `description`) |
| `PUT` | `/api/chats/group/:id/rename` | Private | Rename group chat & update description |
| `PUT` | `/api/chats/group/:id/members` | Private | Add user to group chat |
| `DELETE`| `/api/chats/group/:id/members`| Private | Remove user from group chat (Admin only) |
| `PUT` | `/api/chats/group/:id/leave` | Private | Leave group chat (reassigns admin if needed) |

### 4. Message Module
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/messages` | Private | Send a message (`chatId`, `content`) & update latest message |
| `GET` | `/api/messages/:chatId` | Private | Fetch paginated message history (`?page=1&limit=50`) |
| `PUT` | `/api/messages/:messageId/read`| Private | Mark message as read by current user |

---

## ⚡ Socket.IO Real-Time Event Architecture

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `setup` | Client → Server | `user` | Authenticates socket, joins personal notification room, marks online |
| `connected` | Server → Client | `void` | Acknowledges socket handshake |
| `online_users` | Server → Client | `[userId]` | Broadcasts array of currently connected user IDs |
| `join_chat` | Client → Server | `chatId` | Joins dedicated Socket.IO room for that chat |
| `leave_chat` | Client → Server | `chatId` | Leaves dedicated room |
| `typing` | Client → Server → Room | `{ room, user }` | Broadcasts typing state to other participants in the room |
| `stop_typing`| Client → Server → Room | `{ room, user }` | Broadcasts typing stopped state |
| `new_message` | Client → Server | `message` | Relays message to room participants & emits unread notification |
| `message_received` | Server → Room | `message` | Delivers incoming message to active chat view |
| `notification_received` | Server → User Room | `message` | Delivers unread alert badge to sidebar for inactive chats |
| `group_updated` | Client → Server → Room | `chat` | Broadcasts group updates (rename, members added/removed) |
| `disconnect` | Client → Server | `void` | Cleans up socket, marks user offline if no active connections remain |

---

## 🚀 Installation & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB instance or MongoDB Atlas URI (If not present, the app automatically runs an in-memory MongoDB instance with pre-seeded demo data).

### 1. Clone or Open the Repository
```bash
cd ChatApp
```

### 2. Install All Dependencies
Install root, server, and client packages with a single command:
```bash
npm run install-all
```

Or install individually:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

---

## ⚙️ Environment Configuration

The backend is configured via `server/.env`. A default configuration is already provided:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=super_secret_jwt_key_elevate_labs_2026
CLIENT_URL=http://localhost:5173
```

> **Note**: If `MONGO_URI` is unreachable or local `mongod` is not running, the application automatically launches an embedded In-Memory MongoDB instance and seeds sample data so you can test immediately with zero configuration!

---

## 🖥 Running the Application

### Start Both Frontend & Backend Concurrently
From the project root:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Running Services Separately
- **Backend Only**: `npm run server`
- **Frontend Only**: `npm run client`

---

## 🧪 Automated Verification & Testing

To run the automated backend test suite (verifying user authentication, 1-on-1 chats, group operations, and indexed message queries):

```bash
node server/test-api.js
```

### Build Test
To test production bundling of the frontend:
```bash
npm run build --prefix client
```

---

## 👥 Pre-Seeded Demo Accounts

The database comes pre-populated with demo accounts for instant testing:

| User | Username / Email | Password | Role / Bio |
|---|---|---|---|
| **Alice Johnson** | `alice` / `alice@example.com` | `password123` | Full-stack engineer & team lead |
| **Bob Smith** | `bob` / `bob@example.com` | `password123` | Audio engineer & cloud architect |
| **Charlie Davis** | `charlie` / `charlie@example.com` | `password123` | UI/UX Designer |
| **Diana Prince** | `diana` / `diana@example.com` | `password123` | Product Manager |

> 💡 **Tip**: Open [http://localhost:5173](http://localhost:5173) in two separate browser windows (or one regular and one incognito window) and log into two different accounts (e.g. Alice and Bob) to test real-time instant messaging, typing indicators, and presence updates!

---

## 📄 License
This project is licensed under the MIT License.
