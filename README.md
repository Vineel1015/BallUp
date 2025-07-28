# BallUp

A basketball pickup game organization app that helps players find and organize games.

## Project Structure

- `backend/` - Node.js/Express API server
- `frontend/` - React Native mobile application
- `planning.md` - Comprehensive development plan

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- React Native CLI
- Android Studio/Xcode (for mobile development)

### Setup
1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Set up environment variables (see .env.example files)
5. Run database migrations: `cd backend && npm run migrate`

### Development
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm start`

## Features
- User authentication and profiles
- Game search and discovery
- Location creation and management
- Real-time game updates