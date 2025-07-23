#!/bin/bash

echo "Restarting server..."

# Kill existing server process
pkill -f "node server.cjs"

# Wait a moment for process to die
sleep 2

# Start server in background
cd /Users/rohitkelapure/projects/8090DompeAIRiskPortal/8090-risk-portal
nohup node server.cjs > server.log 2>&1 &

echo "Server restarted. PID: $!"
echo "Waiting for server to be ready..."
sleep 3

# Test if server is responding
curl -s http://localhost:8080/api/v1/controls > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is ready!"
else
    echo "❌ Server might not be ready yet. Check server.log for details."
fi