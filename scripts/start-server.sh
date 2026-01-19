#!/bin/bash

PORT=8080

echo "🚀 Starting Grandview Design Studio server..."
echo ""
echo "   URL: http://localhost:$PORT"
echo "   Debug: http://localhost:$PORT/test-gate.html"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 -m http.server $PORT
