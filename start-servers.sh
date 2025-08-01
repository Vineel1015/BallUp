#!/bin/bash

# BallUp Application Startup Script

echo "🏀 Starting BallUp Application..."

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd backend
    
    # Check if backend is already running
    if check_port 3000; then
        echo "✅ Backend already running on port 3000"
    else
        echo "⚡ Starting backend on port 3000..."
        npm run dev &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
        
        # Wait for backend to start
        sleep 5
        
        # Verify backend is running
        if curl -s http://localhost:3000/health > /dev/null; then
            echo "✅ Backend started successfully!"
        else
            echo "❌ Backend failed to start"
            exit 1
        fi
    fi
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd frontend
    
    # Check if frontend is already running
    if check_port 8080; then
        echo "✅ Frontend already running on port 8080"
    else
        echo "⚡ Starting frontend on port 8080..."
        python3 -m http.server 8080 &
        FRONTEND_PID=$!
        echo "Frontend PID: $FRONTEND_PID"
        
        # Wait for frontend to start
        sleep 2
        echo "✅ Frontend started successfully!"
    fi
    
    cd ..
}

# Main execution
echo "📍 Current directory: $(pwd)"

# Start backend
start_backend

# Start frontend  
start_frontend

echo ""
echo "🎉 BallUp Application is ready!"
echo ""
echo "🔗 Frontend: http://localhost:8080"
echo "🔗 Backend API: http://localhost:3000"
echo "🔗 Backend Health: http://localhost:3000/health"
echo ""
echo "To stop the servers:"
echo "  - Find processes: lsof -i :3000 -i :8080"
echo "  - Kill processes: kill <PID>"
echo ""
echo "Press Ctrl+C to stop this script (servers will continue running)"

# Keep script running
while true; do
    sleep 30
    
    # Check if servers are still running
    if ! check_port 3000; then
        echo "⚠️  Backend server stopped"
    fi
    
    if ! check_port 8080; then
        echo "⚠️  Frontend server stopped"
    fi
done