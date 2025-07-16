#!/bin/bash
# Start Vite in background and monitor it

echo "Starting Vite dev server..."
npx vite --host 0.0.0.0 --port 3000 &
VITE_PID=$!

echo "Vite PID: $VITE_PID"
sleep 3

# Check if process is still running
if ps -p $VITE_PID > /dev/null; then
    echo "Vite is running on PID $VITE_PID"
    
    # Test connection
    echo "Testing connection..."
    curl -v http://localhost:3000 2>&1 | head -20
    
    # Check what ports the process has open
    echo "Checking open ports for PID $VITE_PID..."
    lsof -p $VITE_PID | grep LISTEN
else
    echo "Vite process died!"
    echo "Exit code: $?"
fi