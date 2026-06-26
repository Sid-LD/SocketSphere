# SocketSphere 💬

A full-stack real-time chat application built with the MERN stack and WebSockets, featuring instant messaging, live online presence tracking, and secure user authentication.

---

## 🚀 Live Demo

> _Deploy link here (e.g. Render / Railway / Vercel)_

---

## ✨ Features

- 🔐 **Secure Authentication** — Sign up / sign in via Clerk (OAuth + email)
- ⚡ **Real-Time Messaging** — Instant message delivery using Socket.io WebSockets (no page refresh needed)
- 🟢 **Live Online Status** — See which users are currently online, updated in real time
- 💬 **Conversation History** — All messages stored in MongoDB and loaded when you open a chat
- 🖼️ **Media Sharing** — Send images and videos in chat, uploaded via ImageKit CDN
- 📱 **Responsive UI** — Works on both desktop and mobile with an adaptive sidebar layout

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component library |
| **Vite** | Fast dev server & build tool |
| **Tailwind CSS v4** | Utility-first styling |
| **HeroUI** | Pre-built accessible UI components |
| **Zustand** | Lightweight global state management |
| **Clerk** | Authentication (sign in, sign up, session) |
| **Socket.io Client** | Real-time WebSocket connection |
| **Axios** | HTTP API requests |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **Socket.io** | WebSocket server for real-time events |
| **MongoDB + Mongoose** | NoSQL database & data modelling |
| **Clerk SDK (Express)** | Server-side auth middleware |
| **ImageKit** | Media storage and CDN for images/videos |
| **Multer** | File upload middleware |

---

## 🏗️ Architecture Overview

```
Client (React + Zustand)
    │
    ├── REST API (Axios) ──────► Express Server ──► MongoDB
    │                                  │
    └── WebSocket (Socket.io) ◄────────┘
```

- The **frontend** makes HTTP calls (via Axios) for fetching users, conversations, and message history.
- **New messages** are delivered instantly using a persistent Socket.io WebSocket connection — no polling.
- **Online presence** is tracked server-side using a `userId → socketId` map and broadcast to all connected clients.

---

## 📁 Project Structure

```
├── backend/
│   └── src/
│       ├── controllers/     # Request handlers (auth, messages)
│       ├── middlewares/     # Auth guard, file upload
│       ├── models/          # Mongoose schemas (User, Message)
│       ├── routes/          # Express route definitions
│       ├── lib/             # DB connection, Socket.io setup
│       └── webhooks/        # Clerk user sync webhook
└── frontend/
    └── src/
        ├── components/      # Reusable UI components
        │   ├── auth/        # Auth page components
        │   └── chat/        # Chat UI components
        ├── pages/           # ChatPage, AuthPage
        ├── store/           # Zustand stores (auth, chat)
        ├── hooks/           # Custom React hooks
        └── lib/             # Axios instance, utilities
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Clerk account (free)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/socketsphere.git
cd socketsphere
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
CLERK_SECRET_KEY=your_clerk_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
FRONTEND_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```

```bash
npm run dev    # starts on http://localhost:3000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173
```

---

## 🔑 Key Concepts Demonstrated

- **WebSocket event lifecycle** — connection, message emit, room management, disconnection cleanup
- **Zustand state management** — global stores without Redux boilerplate
- **REST + WebSocket hybrid** — HTTP for CRUD, sockets only for real-time push
- **Auth middleware pattern** — protecting routes with Clerk on both client and server
- **Mongoose aggregation pipeline** — used to build the conversations sidebar with `$group`, `$lookup`, `$replaceRoot`

---

## 👨‍💻 Author

**Your Name**  
B.Tech Computer Science · 2nd Year  
[GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-profile)

---

## 📄 License

MIT License — feel free to use this project for learning purposes.
