# MERN Mediastream

Professionalized setup and instructions for the Media Streaming application.

## Prerequisites
- Node.js (v16+ recommended)
- npm (or yarn)
- MongoDB Atlas account or local MongoDB

## Repository layout
- `server/` - Express API, MongoDB models and routes
- `client/` - React frontend (Create React App)

## Environment
1. Copy `server/.env.example` to `server/.env` and fill values (especially `MONGODB_URI`).
2. Copy `client/.env.example` to `client/.env.local` and update `REACT_APP_API_URL` if needed.

## Install & Run

Server (root):
```bash
npm install
npm run dev
```

Client:
```bash
cd client
npm install
npm start
```

Open the client at http://localhost:3000 and check API health at `http://localhost:5001/api/health`.

## Notes
- Do not commit `.env` files. Use `.env.example` as a template.
- Uploads are stored in `server/uploads` (add backup/cleanup as needed).

## Optional
- To run server+client concurrently, install `concurrently` and add a `start:dev` script in root `package.json` (I can add this if you'd like).
# Media-Streaming-Applications