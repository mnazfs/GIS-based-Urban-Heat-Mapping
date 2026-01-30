# GIS Dashboard - Implementation Guide

## ✅ Features Implemented

### 1. **LST GeoTIFF Loading & Visualization**
- ✅ Loads `Thodupuzha_LST.tif` from `/public/data/` folder
- ✅ Applies continuous blue-to-red heatmap (20°C = blue, 45°C = red)
- ✅ Layer toggle checkbox in "Layers" tab
- ✅ Opacity slider (10-100%) controls transparency
- ✅ Fallback to mock polygon data if file not found

### 2. **UHI Map Layer**
- ✅ Loads `Thodupuzha_UHI_Map.tif` or uses polygon data
- ✅ Classifies pixels into Low/Moderate/High zones
- ✅ Color coding: Green (Low) / Yellow (Moderate) / Red (High)
- ✅ Toggle checkbox for UHI layer
- ✅ Default layer enabled on startup

### 3. **NDVI Layer**
- ✅ Loads `Thodupuzha_NDVI.tif`
- ✅ Green-to-brown gradient visualization
- ✅ Brown (bare soil) → Gold → Yellow-green → Dark green (dense vegetation)
- ✅ Toggle checkbox for NDVI layer
- ✅ Range: -1 to 1

### 4. **NDBI Layer**
- ✅ Loads `Thodupuzha_NDBI.tif`
- ✅ Grey-to-yellow gradient showing built-up areas
- ✅ Toggle checkbox for NDBI layer
- ✅ Range: -1 to 1

### 5. **Interactive Pixel Popups**
- ✅ Click anywhere on map to see pixel values
- ✅ Displays LST (°C), UHI class, NDVI, and NDBI values
- ✅ Professional formatting with headings and labels
- ✅ Shows latitude/longitude coordinates
- ✅ Handles missing data gracefully

### 6. **Dashboard Stats Panel**
- ✅ Left sidebar "Statistics" tab
- ✅ Shows mean LST with min/max range
- ✅ Mean NDVI with progress bar
- ✅ Mean NDBI with progress bar
- ✅ Total high-UHI zones count
- ✅ Dynamic updating based on loaded layers
- ✅ Real-time statistics from GeoTIFF data

### 7. **Export/Download Functionality**
- ✅ Export LST data as CSV or download GeoTIFF
- ✅ Export UHI zones as GeoJSON
- ✅ Export NDVI data as CSV or GeoTIFF
- ✅ Export NDBI data as CSV or GeoTIFF
- ✅ Full report export as Excel/CSV
- ✅ CRS matches map projection
- ✅ Professional toast notifications

## 📦 Dependencies Installed

```json
{
  "georaster": "^1.6.0",
  "georaster-layer-for-leaflet": "^3.10.0",
  "geotiff": "^2.1.3",
  "papaparse": "^5.4.1"
}
```

## 🗂️ File Structure

```
src/
├── components/
│   ├── UHIMap.tsx           # Enhanced with GeoTIFF support
│   ├── ExportPanel.tsx      # Updated with real export functions
│   ├── LayerControls.tsx    # Toggle checkboxes & opacity slider
│   └── StatsPanel.tsx       # Dynamic statistics display
├── utils/
│   └── geoTiffLoader.ts     # GeoTIFF loading utilities
├── pages/
│   └── Index.tsx            # Main dashboard with state management
└── data/
    └── uhiData.ts           # Mock data for fallback

public/
└── data/
    ├── README.md            # Instructions for GeoTIFF files
    ├── Thodupuzha_LST.tif   # Place your LST file here
    ├── Thodupuzha_UHI_Map.tif
    ├── Thodupuzha_NDVI.tif
    └── Thodupuzha_NDBI.tif
```

## 🚀 How to Use

### 1. Add Your GeoTIFF Files
Place your GeoTIFF files in `public/data/` folder:
- `Thodupuzha_LST.tif` - Land Surface Temperature
- `Thodupuzha_UHI_Map.tif` - Urban Heat Island classification
- `Thodupuzha_NDVI.tif` - Vegetation index
- `Thodupuzha_NDBI.tif` - Built-up index

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Use the Dashboard

**Layer Controls (Left Sidebar → Layers Tab):**
- Toggle any layer on/off using the eye icon buttons
- Adjust opacity using the slider (10-100%)
- Multiple layers can be active simultaneously

**Interactive Map:**
- Click anywhere to see pixel values
- Zoom and pan to explore different areas
- Layers overlay on dark map background

**Statistics (Left Sidebar → Statistics Tab):**
- View real-time statistics
- Mean LST with temperature range
- Mean NDVI and NDBI with visual indicators
- Count of high heat zones

**Export Data (Left Sidebar → Export Tab):**
- Click format buttons to download data
- CSV exports contain tabular data
- GeoJSON exports preserve spatial information
- Full report includes all metrics

## 🎨 Color Schemes

**LST Heatmap:**
- Blue (20°C) → Cyan → Green → Yellow → Orange → Red (45°C)

**UHI Classification:**
- 🟢 Green: Low heat (LST < 28°C)
- 🟡 Yellow: Moderate heat (28-35°C)
- 🔴 Red: High heat (LST > 35°C)

**NDVI Gradient:**
- 🟤 Brown: Bare soil/Urban (< 0.2)
- 🟡 Gold: Sparse vegetation (0.2-0.4)
- 🟢 Yellow-green: Moderate vegetation (0.4-0.6)
- 🌲 Dark green: Dense vegetation (> 0.6)

**NDBI Gradient:**
- ⚪ Light grey: Low built-up (< 0.2)
- 🟡 Yellow: High built-up (> 0.6)

## 🔧 Technical Details

### GeoTIFF Loading
- Uses `georaster` library to parse GeoTIFF files
- Uses `georaster-layer-for-leaflet` for Leaflet integration
- Automatic color scaling based on pixel values
- No-data values are rendered transparent

### Pixel Value Extraction
- Click events query georaster for pixel values
- Bilinear interpolation for accurate location
- Handles coordinate transformations automatically

### Export Functionality
- CSV exports use PapaParse library
- GeoJSON follows RFC 7946 specification
- Downloads preserve original CRS information
- Toast notifications provide user feedback

## 🐛 Troubleshooting

**GeoTIFF not loading:**
- Check file is in `public/data/` folder
- Verify file name matches exactly (case-sensitive)
- Check browser console for error messages
- Dashboard falls back to mock data automatically

**No pixel data on click:**
- Ensure at least one layer is toggled on
- Click within the GeoTIFF bounds
- Check that GeoTIFF loaded successfully

**Export not working:**
- Check browser allows downloads
- Verify data is loaded (toggle layers on)
- Check browser console for errors

## 📝 Notes

- GeoTIFF files should be in WGS84 (EPSG:4326) projection
- Large GeoTIFF files may take time to load
- Multiple layers can be active simultaneously
- Opacity affects all active layers uniformly
- Mock data provides 12 pre-defined zones for demonstration

## 🎯 Next Steps (Optional Enhancements)

1. Add layer-specific opacity controls
2. Implement statistical analysis tools
3. Add temporal comparison (multi-date analysis)
4. Add drawing tools for custom zones
5. Implement PDF report generation
6. Add 3D visualization mode
7. Integration with real-time sensors
8. Machine learning predictions
