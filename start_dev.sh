#!/bin/bash

echo "Starting development environment..."

# Kill any processes running on ports 3000 and 5000
echo "Killing any processes on ports 3000 and 5000..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    taskkill //F //PID $(netstat -ano | findstr :3000 | awk '{print $5}') 2>/dev/null
    taskkill //F //PID $(netstat -ano | findstr :5000 | awk '{print $5}') 2>/dev/null
else
    # Unix/Linux/Mac
    kill -9 $(lsof -t -i:3000) 2>/dev/null
    kill -9 $(lsof -t -i:5000) 2>/dev/null
fi

# Start backend server
echo "Starting Flask backend..."
cd service
source ../venv/Scripts/activate
flask run --host='0.0.0.0' --port=5000 --debug &
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 3

# Start frontend
echo "Starting React frontend..."
cd Frontend
npm run dev

echo "Development environment stopped!"
