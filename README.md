# GameNite

A full-stack real-time platform where you can play games with friends, chat, and discuss everything in one place.

## The Problem

Ever notice how you need like 5 different apps just to game with your friends? You've got Discord for chat, a gaming client for the actual games, maybe a forum somewhere for discussions... it's a mess. GameNite brings all of that together—games, chat, forums, profiles, everything in one spot. No more context switching.

## What You Can Do

### 🎮 Play Games
- **Nim**: The classic game where you take turns removing tokens. Sounds simple, but it's deceptively strategic
- **Number Guesser**: Collaborate with friends to guess a secret number with real-time feedback
- Everything syncs instantly across all players—no refresh needed

### 💬 Socialize
- **Forums**: Start discussions, reply to threads, build community
- **Live Chat**: Chat with other players in real-time (especially during games)
- **Profiles**: See what other players are up to and their game history

### 👤 Stay Connected
- Create an account, customize your profile
- Your game history and stats follow you around
- Only authenticated users can see the fun stuff

## How It's Built

```
Browser (React)          ←→  Node.js Server (Express)  ←→  MongoDB
Components & Forms           API Routes & Game Logic       User Data
  • Game Panels              • User Auth                   • Threads
  • Chat UI                  • Game State Manager          • Messages
  • Thread Views             • Chat Service               • Game States
  • User Profiles            • Forum Logic

           ↔ WebSocket (Socket.IO) ↔
        (Real-time game moves & chat)
```

The frontend is built with **React** + **TypeScript**, the backend runs **Node.js** + **Express**, and they talk to each other through HTTP for big stuff and WebSockets for real-time updates. The monorepo structure means the frontend and backend share type definitions—no more wondering if your API actually returns what you think it returns.

## Why I Built It This Way

When you're building a project like this, you make choices that shape everything. Here are mine and why:

**Monorepo (One repo, three projects)**
- Shared type definitions between client and server = no mismatches
- Easier to make atomic commits where frontend and backend changes go together
- Simpler than managing three separate repos

**WebSockets for Real-Time Stuff**
- Games need to feel instant. WebSockets give you <100ms latency for moves
- Chat needs to actually feel live
- Socket.IO handles reconnections automatically, which is nice

**Abstract Game Logic**
- Adding new games should be easy. If it's not, something's wrong
- Each game (Nim, Guess) lives in its own file but implements the same interface
- Makes it dead simple to add more games later

**React Context for State**
- Redux and Zustand felt like overkill for this project
- Context is built into React, so it's one less dependency
- Good enough for managing auth state, game list, and real-time updates

**Keyv for Database Abstraction**
- You can swap between in-memory (dev), Redis (staging), or MongoDB (production)
- Makes testing way easier since you're not bound to one database
- Clean separation between business logic and data storage

**Typed Socket Events**
- All Socket.IO events are defined in one file with proper types
- No more "did I emit 'game:move' or 'move'?" bugs
- IDE autocomplete actually works

## Getting Started

### What You Need
- Node.js 18 or higher
- npm 9 or higher
- MongoDB (optional—it'll use in-memory storage by default if you don't have it)

### Quick Start

1. **Clone and install**
```bash
git clone https://github.com/yourusername/gamenite.git
cd gamenite
npm install
```

2. **(Optional) Add MongoDB**
Create `.env` in the `/server` folder if you want to use MongoDB:
```env
MONGO_STR=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB_NAME=GameNite
```

3. **Run it**
Open two terminals:

Terminal 1:
```bash
npm run dev -w=server
```

Terminal 2:
```bash
npm run dev -w=client
```

Head to `http://localhost:4530` and log in. Try these:
- **user0** / `pwd0000`
- **user1** / `pwd1111`
- **user2** / `pwd2222`
- **user3** / `pwd3333`

## Data Model

This web application stores information about users, forum posts, games, and messages. The data structure is represented by this entity-relationship diagram:

```
    Auth {
        string username "unique key"
        userId userId "unique"
        string password ""
    }

    User {
        userId userId "generated key"
        username username "unique"
        string display ""
        Date createdAt ""
    }
    User ||--|| Auth: "User.username"
    Auth ||--|| User: "Auth.userId"

    Thread {
        threadId threadId "generated key"
        string title ""
        string text ""
        Date createdAt ""
        userId createdBy ""
        commentId[] comments ""
    }
    Thread ||--|| User: "Thread.createdBy"
    Thread ||--o{ Comment: "Thread.comments"

    Comment {
        commentId commentId "generated key"
        string text ""
        userId createdBy ""
        Date createdAt ""
        Date editedAt "can be null"
    }
    Comment ||--|| User: "Comment.createdBy"

    Game {
        gameId gameId "generated key"
        GameKey type ""
        unknown state ""
        boolean done ""
        chatId chat ""
        userId[] players ""
        Date createdAt ""
        userId createdBy ""
    }
    Game ||--|| Chat: "Game.chat"
    Game ||--|| User: "Game.createdBy"
    Game ||--o{ User: "Game.players"

    Chat {
        chatId chatId "generated key"
        messageId[] messages ""
        Date createdAt ""
    }
    Chat ||--o{ Message: "Chat.messages"

    Message {
        messageId messageId "generated key"
        string text ""
        Date createdAt ""
    }
    Message ||--|| User: "Message.createdBy"
```

**Key relationships:**
- **Auth**: Stores credentials mapped 1:1 to Users
- **User**: Core entity with profile information
- **Thread**: Discussion topics created by users, containing multiple comments
- **Comment**: Replies to threads, with optional edit timestamps
- **Game**: Multiplayer game sessions with associated chat and player list
- **Chat**: Isolated message channels (one per game)
- **Message**: Individual messages in a chat channel

### Authentication
- `POST /api/users/login` - Authenticate user (returns user profile + token)
- `POST /api/users/register` - Create new account
- `PATCH /api/users/:userId` - Update user profile

### Games
- `GET /api/games` - List all active games
- `POST /api/games` - Create a new game
- `GET /api/games/:gameId` - Get game details
- `DELETE /api/games/:gameId` - Abandon or finish a game

### Threads & Comments
- `GET /api/threads` - List all discussion threads
- `POST /api/threads` - Create new thread
- `GET /api/threads/:threadId` - Get thread with comments
- `POST /api/threads/:threadId/comments` - Add comment to thread

### Messaging
- Socket events: `new-message`, `message-history`, `new-chat`

## Building & Testing

To build for production:
```bash
npm run build -w=client
npm start -w=server
```

Run the tests:
```bash
npm test                    # Everything
npm test -w=server          # Just backend tests
npm test -w=client          # Just frontend tests
npm run playwright -w=client # E2E tests
```

## What's Here (Folder Layout)

```
client/              → Everything you see in your browser
  src/components/   → UI building blocks (buttons, panels, etc.)
  src/pages/        → Full page views (Login, Game, Profile)
  src/hooks/        → React hooks (form handling, data fetching)
  src/services/     → Talks to the API
  src/games/        → Game-specific UI

server/              → The brains of the operation
  src/controllers/  → Handles incoming requests
  src/services/     → Business logic (games, auth, chat)
  src/games/        → Game rules and logic

shared/              → Both client and server use this
  src/             → Type definitions everyone shares
```

## How the Pieces Fit Together

When you start a game, here's what actually happens under the hood:

**Game Start:**
1. You create a new Nim game → API call to the backend
2. Backend creates the game, stores it, starts tracking the state
3. Other player joins via WebSocket
4. Both of you get the initial game state instantly

**During the Game:**
1. You make a move → sent to server via WebSocket
2. Server validates it (can't take more tokens than exist, etc.)
3. Server updates the game state
4. Both players get updated instantly
5. When someone wins, the game ends and gets archived

**Authentication (Behind the Scenes):**
1. You log in with username/password
2. Server checks the database and validates
3. Frontend stores auth info in React Context
4. Every API call includes your auth token
5. Try to visit a game page without logging in? Redirected to login

**Chat During Games:**
1. Game creates a chat room automatically
2. Both players are in that room
3. Messages broadcast in real-time
4. All messages get saved so new players see history

## Ideas for the Future

**Performance & Scale:**
- Cache frequently accessed data with Redis
- Use a message queue so game logic doesn't block chat
- Deploy multiple servers and keep users sticky

**More Games:**
- Turn-based strategy games
- Card games
- Trivia with scoring

**Social Features:**
- Friend lists and blocking
- Leaderboards and rankings
- Achievements and badges
- Game replays you can watch move-by-move

**Community:**
- Better moderation tools
- User reports
- Spam filtering

## Who Made This

This is all me—Nicole Contreras. Built for CS 4530: Software Engineering at Northeastern University. All the code is original work I created, from the database design to the UI components to the game logic.

## License

MIT License - use it however you want. Check the [LICENSE](LICENSE) file if you care about the legal stuff.