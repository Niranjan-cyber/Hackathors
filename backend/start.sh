#!/bin/bash
set -e

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
  echo "🐍 Activating Python virtual environment..."
  source .venv/bin/activate
fi

# Install dependencies if needed
if [ ! -d ".venv" ] || [ ! -f ".venv/bin/activate" ]; then
  echo "⚠️  No venv found. You may want to create one with: python3 -m venv .venv"
fi

if [ -f requirements.txt ]; then
  echo "📦 Installing Python dependencies..."
  pip install --upgrade pip
  pip install -r requirements.txt
fi

# Start Ollama models in background
ollama run phi3 &
OLLAMA_PHI3_PID=$!
echo "🤖 Started Ollama model: phi3 (PID $OLLAMA_PHI3_PID)"
ollama run llama3.1 &
OLLAMA_LLAMA_PID=$!
echo "🤖 Started Ollama model: llama3.1 (PID $OLLAMA_LLAMA_PID)"

# Trap to kill ollama models on exit
trap 'echo "🛑 Stopping Ollama models..."; kill $OLLAMA_PHI3_PID $OLLAMA_LLAMA_PID; if type deactivate; then echo "🧹 Deactivating virtual environment..."; deactivate; fi' EXIT

# Start FastAPI backend
echo "🚀 Starting FastAPI backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
