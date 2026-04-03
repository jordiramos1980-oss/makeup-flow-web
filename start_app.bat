@echo off
title Starting Makeup Flow Servers

echo Starting Node.js Server...
start cmd /k "cd server && node index.js"

echo Starting React Client...
start cmd /k "cd client && npm start"

echo All servers initiated. You can close this window.
exit