Server development helper
=======================

This folder contains convenience scripts to run the backend without installing a system `mongod` instance.

Run with in-memory MongoDB (Windows PowerShell):

```powershell
cd server
.\run-dev-inmemory.ps1
```

Or double-click `run-dev-inmemory.bat` (Windows) to run the same flow.

Notes:
- The script will run `npm install` in the `server` folder if `node_modules` is missing.
- It sets `USE_IN_MEMORY_DB=true` so `server/db.js` will attempt to start an in-memory MongoDB (data is ephemeral).
- For production or persistent data use a real MongoDB (Atlas or local `mongod`) and set `MONGODB_URI` in your `.env`.

If you'd rather use a real MongoDB:

1. Start local service (if installed):

```powershell
net start MongoDB
node server.js
```

2. Or set an Atlas URI (remember to URL-encode special chars in the password):

```powershell
$env:MONGODB_URI='mongodb+srv://user:pa%24%24word@cluster0.mongodb.net/mediastream'
node server.js
```
