#!/bin/bash

echo "🎨 Starting React frontend..."

# Always run npm commands from the correct directory
cd "$(dirname "$0")"


if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start React dev server (works for CRA or Vite)
npm run dev