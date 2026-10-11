#!/bin/bash
set -e

# Start Ollama in background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
for i in {1..20}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "Ollama is ready."
        break
    fi
    sleep 2
done

# Pull bge-m3 model (cached after first pull)
echo "Pulling bge-m3 model..."
ollama pull bge-m3

echo "bge-m3 ready. Starting FastAPI server..."

# Start FastAPI on the Railway-provided PORT
exec uvicorn api:app --host 0.0.0.0 --port "${PORT:-8000}"
