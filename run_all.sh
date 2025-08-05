#!/bin/bash

# Start backend
echo "🔄 Starting backend..."
./backend/start.sh &
BACKEND_PID=$!

# Start frontend
echo "🔄 Starting frontend..."
./frontend/start.sh &
FRONTEND_PID=$!

# Trap to kill both on Ctrl+C
trap "echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

# Wait for both to exit
wait $BACKEND_PID
wait $FRONTEND_PID
