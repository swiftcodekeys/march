#!/bin/bash

echo "=== Grandview Gate Tool Diagnostic ==="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ ERROR: Run this script from the designstudioworkingmvp directory"
    exit 1
fi

echo "✓ Found index.html"

# Check for required files
echo ""
echo "Checking required files..."

files=(
    "gate_tool/index.html"
    "gate_tool/js/ultra_dsg_min.js"
    "gate_tool/js/three.min_086.js"
    "catalog.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ MISSING: $file"
    fi
done

# Check for model directories
echo ""
echo "Checking 3D model directories..."

for dir in 0 1 2 3; do
    if [ -d "gate_tool/m/$dir" ]; then
        count=$(find "gate_tool/m/$dir" -name "*.json" | wc -l)
        echo "  ✓ gate_tool/m/$dir/ ($count JSON files)"
    else
        echo "  ❌ MISSING: gate_tool/m/$dir/"
    fi
done

# Check catalog.json for gate styles
echo ""
echo "Checking catalog.json gate styles..."
if command -v python3 &> /dev/null; then
    python3 -c "
import json
with open('catalog.json') as f:
    data = json.load(f)
    if 'gate_styles' in data:
        print('  ✓ Found', len(data['gate_styles']), 'gate styles:')
        for style in data['gate_styles']:
            print('    -', style['code'], ':', style['label'])
    else:
        print('  ❌ No gate_styles found in catalog.json')
" 2>/dev/null || echo "  ⚠ Python3 not available, skipping JSON check"
fi

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "To test the gate tool:"
echo "1. Start a local server: python3 -m http.server 8080"
echo "2. Open: http://localhost:8080"
echo "3. Select 'Gate' from the Scene dropdown"
echo "4. Open browser DevTools (F12) and check Console for errors"
echo ""
