# Gate Tool Troubleshooting Guide

## Changes Made

### 1. Fixed app.js (Parent Application)
- Added `gateRendererReady` flag to track when the 3D renderer is fully initialized
- Added 500ms delay after iframe load to allow Ultra renderer to initialize
- Added message listener to receive GATE_READY and GATE_ERROR messages from iframe
- Added gate style validation to prevent invalid style codes
- Improved status messages during gate loading

### 2. Fixed gate_tool/index.html (Gate Renderer)
- Added parent notification when gate renderer is ready (`GATE_READY` message)
- Added error reporting back to parent (`GATE_ERROR` message)
- Improved error handling in command queue processing

## Common Issues & Solutions

### Issue 1: Gate scene shows blank/black screen
**Causes:**
- 3D models not loading (404 errors)
- WebGL not supported in browser
- Iframe communication timing issue

**Solutions:**
1. Open browser DevTools (F12) → Console tab
2. Look for errors mentioning:
   - "404" on `/m/` or `/gate_tool/m/` paths
   - "WebGL" errors
   - "GATE_ERROR" messages

3. If you see 404 errors:
   - Verify you're serving from the correct directory
   - Check that `gate_tool/m/0/`, `m/1/`, `m/2/`, `m/3/` directories exist
   - Run `./diagnose.sh` to verify all files are present

4. If WebGL errors:
   - Try a different browser (Chrome, Firefox, Edge)
   - Update graphics drivers
   - Enable hardware acceleration in browser settings

### Issue 2: Gate styles don't change when selected
**Causes:**
- Style code mismatch between catalog.json and ultra_dsg_min.js
- Iframe not receiving messages
- Renderer not ready when message sent

**Solutions:**
1. Check browser console for "Gate command error" messages
2. Verify style codes in catalog.json match those in ultra_dsg_min.js:
   - UAF-200 (Horizon)
   - UAF-201 (Horizon Pro)
   - UAF-250 (Vanguard)
   - UAB-200 (Haven)
   - UAS-100 (Charleston)
   - UAS-101 (Charleston Pro)
   - UAS-150 (Savannah)

3. The fixes in app.js should resolve timing issues

### Issue 3: "Initializing 3D gate renderer..." message stuck
**Causes:**
- Models failed to load
- Renderer initialization timeout (15 seconds)

**Solutions:**
1. Check Network tab in DevTools for failed requests
2. Look for the fatal error message overlay in the gate iframe
3. Verify all model files exist: `find gate_tool/m -name "*.json" | wc -l` should show 57 files

### Issue 4: Works locally but not when deployed
**Causes:**
- Incorrect base path for assets
- CORS issues
- Missing files in deployment

**Solutions:**
1. Verify all files uploaded:
   - gate_tool/ directory with all subdirectories
   - All .json model files in m/0/, m/1/, m/2/, m/3/
   - All .js files in gate_tool/js/

2. Check browser console for 404 errors
3. Ensure server serves .json files with correct MIME type

## Testing Steps

1. Start local server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open http://localhost:8080 in browser

3. Open DevTools (F12) → Console tab

4. Select "Gate" from Scene dropdown

5. You should see:
   - "ULTRA_DSG_MIN PATCH LOADED v1" in console
   - Gate renderer loads within 2-3 seconds
   - Status message clears when ready

6. Select different gate styles from dropdown

7. Each style should render within 1 second

## Debug Mode

Use the test-gate.html page for detailed debugging:

1. Open http://localhost:8080/test-gate.html
2. Watch the log for iframe communication
3. Use buttons to test specific commands
4. Check if messages are being sent/received

## Still Not Working?

If the gate tool still doesn't work after these fixes:

1. Run the diagnostic: `./diagnose.sh`
2. Check browser console for specific error messages
3. Try the test-gate.html debug page
4. Verify you're using a modern browser (Chrome 90+, Firefox 88+, Edge 90+)
5. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Technical Details

The gate tool uses:
- Three.js r86 for 3D rendering
- WebGL for hardware acceleration
- PostMessage API for iframe communication
- JSON model files loaded dynamically
- Custom Ultra renderer (ultra_dsg_min.js)

The initialization sequence:
1. Parent loads index.html
2. Parent creates iframe pointing to gate_tool/index.html
3. Iframe loads Three.js and Ultra renderer
4. Ultra renderer loads 3D models from m/ directories
5. Iframe sends GATE_READY message to parent
6. Parent can now send style change commands
7. Iframe applies style and re-renders scene
