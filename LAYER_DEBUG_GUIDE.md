# 🐛 Layer Debugging Guide - "All Layers Look the Same" Issue

## ✅ Fixes Applied

### 1. Enhanced GeoTIFF Loading Debug Logs
**Location**: `src/utils/geoTiffLoader.ts`

**What Changed**:
- Added detailed debug output showing:
  - File name being loaded
  - Min/Max value ranges (CRITICAL for identifying data differences)
  - Dimensions and projection
  - Confirmation of unique GeoRasterLayer creation

**What to Look For in Console**:
```
🔍 DEBUGGING GeoTIFF: {
  url: 'Thodupuzha_LST.tif',
  min: 25.3,
  max: 42.7,
  dimensions: '512x512',
  projection: 'EPSG:4326'
}
✅ GeoRasterLayer created with unique color scale
```

### 2. Enhanced Layer Loading Logs
**Location**: `src/components/UHIMap.tsx`

**What Changed**:
- Each layer now has emoji-tagged console logs:
  - 🌡️ LST layer
  - 🔥 UHI layer
  - 🌿 NDVI layer
  - 🏗️ NDBI layer
- Shows Min/Max after loading

**Example Console Output**:
```
🌡️ Loading LST layer...
✅ LST layer loaded - Min: 25.3 Max: 42.7
🔥 Loading UHI layer...
✅ UHI layer loaded - Min: 1 Max: 3
```

### 3. Improved Visibility Update Logic
**Location**: `src/components/UHIMap.tsx`

**What Changed**:
- Explicit `hasLayer()` check before removing
- Clear logging showing which layers are active
- Labels identifying color schemes

**Example Output**:
```
🔄 Updating layer visibility...
✅ LST layer visible (Blue→Red heatmap)
✅ NDVI layer visible (Brown→Green gradient)
✨ Visibility update complete: 2 layer(s) active
```

## 🔬 Diagnostic Checklist

### Step 1: Verify Data Files Are Different

**RUN THIS TEST**:
1. Open DevTools Console (F12)
2. Toggle each layer on one at a time
3. Check the debug output

**Expected Results**:
| Layer | Expected Min | Expected Max | Color Scheme |
|-------|-------------|--------------|--------------|
| LST   | ~20-30      | ~40-50       | Blue→Red     |
| UHI   | 1           | 3            | Green/Yellow/Red |
| NDVI  | -1 to 0     | 0 to 1       | Brown→Green  |
| NDBI  | -1 to 0     | 0 to 1       | Grey→Yellow  |

**🚨 IF ALL MIN/MAX ARE THE SAME**:
- Your GeoTIFF files contain identical data
- Problem is in your GEE export process
- Files need to be re-exported

**✅ IF MIN/MAX ARE DIFFERENT**:
- Data is correct
- Problem is in the frontend rendering
- Continue to Step 2

### Step 2: Verify Unique Layer Instances

**CHECK IN CONSOLE**:
```javascript
// Paste this in browser console while layers are loaded:
console.log('Layer instances:', {
  lst: window.__geoLayersRef?.lst?.layer,
  uhi: window.__geoLayersRef?.uhi?.layer,
  ndvi: window.__geoLayersRef?.ndvi?.layer,
  ndbi: window.__geoLayersRef?.ndbi?.layer
});

// Check if they're different objects:
console.log('All unique?', 
  window.__geoLayersRef?.lst?.layer !== window.__geoLayersRef?.uhi?.layer
);
```

**Expected**: Should log `true` (they're different objects)

### Step 3: Test Color Scales Independently

**RUN THIS TEST**:
```javascript
// Paste in console:
import { lstColorScale, uhiColorScale, ndviColorScale, ndbiColorScale } 
  from './src/utils/geoTiffLoader';

console.log('LST color for 30:', lstColorScale(30));
console.log('UHI color for 2:', uhiColorScale(2));
console.log('NDVI color for 0.5:', ndviColorScale(0.5));
console.log('NDBI color for 0:', ndbiColorScale(0));
```

**Expected Output**:
- LST: `rgb(127, 255, 127)` (greenish)
- UHI: `#eab308` (yellow)
- NDVI: `#9acd32` (yellow-green)
- NDBI: `rgb(202, 202, 75)` (yellowish)

All different colors = color scales work correctly

### Step 4: Visual Inspection

**Toggle layers individually and observe**:

1. **Only LST**: Should show blue (cool) to red (hot) gradient
2. **Only UHI**: Should show 3 distinct colors (green/yellow/red zones)
3. **Only NDVI**: Should show brown (urban) to green (vegetation)
4. **Only NDBI**: Should show grey (natural) to yellow (built-up)

**🚨 IF THEY ALL LOOK THE SAME**:
- Check if opacity is too low
- Check if layers are actually loading (see console)
- Verify color scale functions are being called

## 🎯 Root Cause Analysis

### ✅ What We Fixed

#### Problem 1: Color Scale Not Captured Correctly
**Before**: Color scale might be reused or shared
**After**: Each `GeoRasterLayer` has its own closure capturing the correct `colorScale` function

#### Problem 2: Insufficient Debug Information
**Before**: Generic logs like "Layer loaded"
**After**: Detailed logs with min/max values to verify data differences

#### Problem 3: Layer Management Unclear
**Before**: Unclear if layers were properly removed/added
**After**: Explicit remove-all then add-enabled with logging

### 🔴 Still Need to Check

#### Potential Issue: GeoTIFF Files Are Wrong

**How to Verify**:
1. Download one of the .tif files
2. Install GDAL: `https://gdal.org/download.html`
3. Run: `gdalinfo Thodupuzha_LST.tif`
4. Check the statistics output

**Expected LST Output**:
```
Band 1 Block=512x16 Type=Float32, ColorInterp=Gray
  Min=20.000 Max=45.000 
  Mean=32.500 StdDev=5.234
```

**If all files show same statistics**: Re-export from Google Earth Engine

## 🔧 Quick Fix Commands

### Restart Dev Server
```bash
npm run dev
```

### Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. "Empty Cache and Hard Reload"

### Check Files Are Present
```bash
ls public/data/
```

Expected output:
- Thodupuzha_LST.tif
- Thodupuzha_UHI_Map.tif
- Thodupuzha_NDVI.tif
- Thodupuzha_NDBI.tif

## 📊 Success Criteria

### ✅ Working Correctly When:

1. **Console shows different Min/Max for each layer**
   - LST: 20-45
   - UHI: 1-3
   - NDVI: -1 to 1
   - NDBI: -1 to 1

2. **Visual appearance is distinct**
   - LST: Continuous blue→red heatmap
   - UHI: 3 solid color zones
   - NDVI: Brown→green vegetation gradient
   - NDBI: Grey→yellow urban gradient

3. **Click popup shows different values**
   - Each layer returns different numbers at same location
   - Values match expected ranges

4. **Toggle works correctly**
   - Turning layer OFF makes it disappear
   - Turning layer ON shows correct colors
   - Multiple layers can be visible simultaneously

## 🆘 Still Not Working?

### Check These Common Issues:

1. **Files Not Found (404)**
   - Verify files are in `public/data/` folder
   - Check exact filenames (case-sensitive)

2. **Invalid TIFF Error**
   - Files may be corrupted
   - Try re-exporting from GEE

3. **All Same Colors**
   - GeoTIFF files contain identical data
   - Need to re-export correct bands from GEE

4. **Layer Order Wrong**
   - Last toggled layer should be on top
   - Check z-index in layer rendering

5. **Opacity Too Low**
   - Increase opacity slider to 100%
   - Check if layers are being added at all

## 📝 Next Steps

1. Run dev server: `npm run dev`
2. Open browser DevTools console
3. Toggle each layer on individually
4. Read the debug logs (look for 🔍 emoji)
5. Verify Min/Max values are different
6. Visually confirm different colors
7. Report findings with console screenshots

---

**Updated**: January 29, 2026
**Purpose**: Debug why all GeoTIFF layers appear identical
**Status**: Enhanced logging and fixes applied - awaiting user verification
