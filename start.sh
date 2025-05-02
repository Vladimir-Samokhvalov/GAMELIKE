#!/bin/bash

# Check if Python is installed
if command -v python3 &>/dev/null; then
    echo "Starting server on http://localhost:8000"
    python3 -m http.server 8000
elif command -v python &>/dev/null; then
    echo "Starting server on http://localhost:8000"
    python -m http.server 8000
else
    echo "Python is not installed. Please install Python to run this server."
    exit 1
fi 