#!/bin/bash

# Detect if running in Git Bash (MINGW) or Windows cmd
if [[ "$(uname -s)" == *"MINGW"* ]]; then
    echo "Running in Git Bash"

    # Start React server in the background
    cd Frontend
    npm run dev &

    # Navigate to backend
    cd ../service
    source ../venv/Scripts/activate  # Activate virtual environment
    flask run &  # Run Flask in the background

    cd ..

else
    echo "Running in Windows cmd"

    cd Frontend
    start cmd /k "npm run dev"

    cd ../service
    call ..\venv\Scripts\activate
    start cmd /k "flask run"

    cd ..
fi
