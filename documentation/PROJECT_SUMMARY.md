# Grandview Fence Design Studio - Project Summary

## Project Overview
**Location:** `/Users/saraheb/Desktop/Engagements/repo/github/designstudio/designstudioworkingmvp/`

A web-based fence and gate design visualization tool with three scenes:
- **Front Yard** - 2D canvas rendering (background + overlay PNG)
- **Back Yard** - 2D canvas rendering (background + overlay PNG)  
- **Gate** - 3D WebGL rendering via iframe (Three.js r86 + Ultra renderer)

## Architecture

### Main Application (Parent)
- **index.html** - Main UI with scene selector and style dropdown
- **app.js** - Application logic, handles scene switching and iframe communication
- **styles.css** - UI styling
- **catalog.json** - Configuration for scenes, styles, and asset paths

### Gate Tool (Embedded iframe)
- **gate_tool/index.html** - Embedded 3D gate renderer
- **gate_tool/js/ultra_dsg_min.js** - Proprietary Ultra gate renderer (minified)
- **gate_tool/m/** - 3D model files (JSON format, ~57 files across 4 subdirectories)
- **gate_tool/t/** - Texture files (JPG/PNG)

## Current Issue: Gate Scene Not Rendering

### Symptoms
- Console shows: "Initial render complete, scene children: 2"
- Three.js WebGL renderer initializes successfully
- No visual output on canvas (blank/black screen)
- No JavaScript errors after latest fixes

### Root Cause Analysis
The Ultra renderer (`ultra_dsg_min.js`) provides these key functions:
- `stl(callback)` - Loads a gate style
- `rndr()` - Renders one frame
- `viz()` - Shows/hides UI elements (causes errors in embed mode)
- `gOpt(bool)` - Sets gate options
- `scene` - Three.js scene object
- `renderer` - Three.js WebGL renderer
- `camera` - Three.js camera

**The Problem:** WebGL requires continuous rendering via `requestAnimationFrame`. The Ultra renderer's `rndr()` function must be called every frame, but we're only calling it once via `stl(rndr)`.

### Current Implementation (gate_tool/index.html)

```javascript
function flushQueue(){
  if (!isReady()) return;
  
  // Initial setup
  window.gOpt(true);
  window.stl(window.rndr);  // Loads style and renders ONCE
  
  // Animation loop added
  function animate(){
    requestAnimationFrame(animate);
    if (typeof window.rndr === 'function') window.rndr();
  }
  animate();
}
```

### What Should Work (But Doesn't Yet)
1. Ultra loads 3D models from `gate_tool/m/` directories
2. `stl()` applies the selected gate style
3. `rndr()` is called every frame in animation loop
4. WebGL renders to canvas `#usicv`

### Possible Remaining Issues
1. **Camera positioning** - Camera might be pointing away from models
2. **Lighting** - Scene might be too dark (HDR environment disabled via patch)
3. **Material loading** - Materials might not be fully initialized
4. **Ultra's internal state** - Ultra might expect additional initialization we're skipping

## Ultra Renderer Reference
**Note:** Ultra is a proprietary/commercial 3D configurator. No public documentation available.

Likely vendors (based on code patterns):
- Custom in-house solution
- Modified Three.js configurator
- Commercial 3D product configurator platform

**Key Ultra Functions:**
- `window.stlArr` - Array of available gate styles
- `window.gN` - Current gate style index
- `window.gOpt(bool)` - Initialize gate options
- `window.stl(callback)` - Load style, call callback when done
- `window.rndr()` - Render current frame
- `window.viz()` - Toggle UI visibility (breaks in embed mode)
- `window.kMnu()` - Update menu state

## File Structure
```
designstudioworkingmvp/
├── index.html              # Main app UI
├── app.js                  # Main app logic
├── styles.css              # Main app styles
├── catalog.json            # Configuration
├── assets/
│   ├── backgrounds/        # Scene background images
│   ├── overlays/          # Fence style overlay PNGs
│   └── logo.png
├── gate_tool/             # Embedded 3D gate renderer
│   ├── index.html         # Gate renderer HTML
│   ├── css/
│   │   └── ultra_ds_g.css
│   ├── js/
│   │   ├── three.min_086.js
│   │   ├── ultra_dsg_min.js  # Proprietary renderer
│   │   └── [other libs]
│   ├── m/                 # 3D models (JSON)
│   │   ├── 0/            # Posts
│   │   ├── 1/            # Rails
│   │   ├── 2/            # Pickets
│   │   └── 3/            # Hardware
│   ├── t/                # Textures
│   └── th/               # Thumbnails
└── [other files]
```

## Communication Flow
```
Parent (index.html) 
  ↓ postMessage
iframe (gate_tool/index.html)
  ↓ Ultra renderer
Three.js WebGL → Canvas
  ↑ postMessage
Parent receives GATE_READY
```

## Next Steps to Debug

### 1. Check Camera
```javascript
console.log('Camera:', window.camera);
console.log('Camera position:', window.camera.position);
console.log('Camera looking at:', window.camera.target || 'unknown');
```

### 2. Check Scene Contents
```javascript
console.log('Scene children:', window.scene.children);
window.scene.children.forEach((obj, i) => {
  console.log(i, obj.type, obj.name, obj.visible);
});
```

### 3. Check Renderer State
```javascript
console.log('Renderer:', window.renderer);
console.log('Renderer size:', window.renderer.getSize());
console.log('Canvas:', document.getElementById('usicv'));
```

### 4. Try Manual Render
```javascript
// In browser console after gate loads
window.renderer.render(window.scene, window.camera);
```

### 5. Check for Ultra's Animation Loop
Ultra might have its own animation loop that we need to start:
```javascript
// Look for these in ultra_dsg_min.js
window.startRender?.();
window.animate?.();
window.loop?.();
```

## Working Features
✅ Front Yard scene - renders correctly  
✅ Back Yard scene - renders correctly  
✅ Gate scene iframe loads  
✅ Ultra renderer initializes  
✅ 3D models load (scene has 2 children)  
✅ No JavaScript errors  
❌ Gate scene visual output  

## Code Changes Made
1. Fixed indentation in `gate_tool/index.html`
2. Removed `viz()` calls (caused errors with hidden UI elements)
3. Added `requestAnimationFrame` loop calling `rndr()` every frame
4. Fixed syntax error (duplicate code fragment)

## Test URLs
- Main app: `http://localhost:8080/`
- Gate tool direct: `http://localhost:8080/gate_tool/`
- Test page: `http://localhost:8080/test-gate.html`

## Browser Console Commands for Debugging
```javascript
// Check if Ultra is loaded
console.log('Ultra loaded:', typeof window.stl !== 'undefined');

// Check scene
console.log('Scene:', window.scene);
console.log('Children:', window.scene?.children.length);

// Force render
if (window.renderer && window.scene && window.camera) {
  window.renderer.render(window.scene, window.camera);
}

// Check canvas
const canvas = document.getElementById('usicv');
console.log('Canvas:', canvas);
console.log('Canvas size:', canvas.width, canvas.height);
console.log('Canvas visible:', window.getComputedStyle(canvas).display);
```

## Minimal Fix Needed
The gate should render with the current code. If it doesn't, the issue is likely:
1. Camera position/rotation
2. Lighting (all black scene)
3. Ultra expects a specific initialization sequence we're missing

**Recommendation:** Check browser console for the debug commands above to identify which component is misconfigured.
