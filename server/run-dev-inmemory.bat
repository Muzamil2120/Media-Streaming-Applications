@echo off
echo Starting server with in-memory MongoDB (Windows batch)
if not exist node_modules (
  echo node_modules not found — running npm install (this may take a minute)...
  npm install
)

set USE_IN_MEMORY_DB=true
node server.js
