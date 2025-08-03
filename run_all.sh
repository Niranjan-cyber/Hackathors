#!/bin/bash

# echo "🔁 Starting backend..."
# ./backend/start.sh &
# BACKEND_PID=$!

echo "🔁 Starting frontend..."
./frontend/start.sh &
FRONTEND_PID=$!

# Trap to kill both on Ctrl+C
trap "echo '🛑 Stopping...'; kill $FRONTEND_PID" EXIT

# Wait to keep script running
wait
