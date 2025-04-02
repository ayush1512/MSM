@echo off
echo Running in Windows cmd...

:: Start React server in a new cmd window
cd Frontend
start cmd /k "npm run dev"
cd ..

:: Start Flask server in a new cmd window
cd service
call ..\venv\Scripts\activate
start cmd /k "flask run"
cd ..
