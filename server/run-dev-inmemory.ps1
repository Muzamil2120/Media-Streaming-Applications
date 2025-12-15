<#
Run the backend server using an in-memory MongoDB (mongodb-memory-server).
This is intended for Windows PowerShell users who don't have `mongod` installed.

Usage:
 - Right-click -> Run with PowerShell, or
 - Open PowerShell, cd to this folder and run: .\run-dev-inmemory.ps1

Notes:
 - This will run `npm install` in the `server` folder (if packages missing).
 - Data is ephemeral and lost when the process exits.
#>

Write-Host "=== Starting server (in-memory MongoDB) ==="

if (!(Test-Path -Path "node_modules")) {
    Write-Host "node_modules not found - running npm install (this may take a minute)..."
    npm install
}

$env:USE_IN_MEMORY_DB = 'true'

# Start server
node server.js
