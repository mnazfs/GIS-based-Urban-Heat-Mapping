# Thodupuzha UHI Dashboard

An interactive web-based Geographic Information System (GIS) dashboard for analyzing Urban Heat Island (UHI) effects in Thodupuzha, Kerala. This application visualizes Land Surface Temperature (LST), vegetation density (NDVI), and built-up area density (NDBI) using GeoTIFF raster data.

![Dashboard Preview](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green)

## 🌟 Features

- **Real-time GeoTIFF Visualization**: Load and render large GeoTIFF files directly in the browser
- **Multiple Layer Support**: Toggle between LST, UHI, NDVI, and NDBI layers
- **Interactive Map**: Click anywhere to see pixel-level data values
- **Dynamic Statistics**: Real-time calculations from raster data
- **Data Export**: Export data as CSV, GeoJSON, or download original GeoTIFF files
- **Responsive Design**: Dark-themed professional UI with TailwindCSS
- **Performance Optimized**: Lazy loading, layer caching, and canvas tiling

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [GeoTIFF Processing](#-geotiff-processing-pipeline)
- [Installation](#-installation)
- [Usage](#-usage)
- [Data Requirements](#-data-requirements)
- [How It Works](#-how-it-works)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🛠️ Tech Stack

### Core Technologies
- **React 18.3** - Frontend framework
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Build tool and dev server
- **Leaflet 1.9** - Interactive mapping library

### GIS Libraries
- **georaster** - Parse GeoTIFF files
- **georaster-layer-for-leaflet** - Render rasters on Leaflet maps
- **geotiff** - TIFF file parsing

### UI Components
- **TailwindCSS 3.4** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Additional Libraries
- **React Router 6** - Client-side routing
- **PapaParse** - CSV parsing and generation
- **React Query** - Data fetching and caching

## 🏗️ Architecture

### Project Structure
```
dashboard-sourcecode/
├── public/
│   └── data/                    # GeoTIFF files location
│       ├── Thodupuzha_LST.tif
│       ├── Thodupuzha_UHI_Map.tif
│       ├── Thodupuzha_NDVI.tif
│       └── Thodupuzha_NDBI.tif
├── src/
│   ├── components/
│   │   ├── UHIMap.tsx          # Main map component
│   │   ├── LayerControls.tsx   # Layer toggle controls
│   │   ├── StatsPanel.tsx      # Statistics display
│   │   ├── ExportPanel.tsx     # Data export functions
│   │   ├── ZonePopup.tsx       # Popup content
│   │   └── ui/                 # Reusable UI components
│   ├── utils/
│   │   └── geoTiffLoader.ts    # GeoTIFF processing utilities
│   ├── data/
│   │   └── uhiData.ts          # Data structures & color scales
│   ├── pages/
│   │   └── Index.tsx           # Main dashboard page
│   └── App.tsx                 # Root component
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🗺️ GeoTIFF Processing Pipeline

### 1. File Loading & Validation

```typescript
// Step 1: Fetch the GeoTIFF file
fetch('/data/Thodupuzha_LST.tif')
  ↓
// Step 2: Convert to ArrayBuffer
response.arrayBuffer()
  ↓
// Step 3: Validate TIFF format
Check byte order markers:
  - 0x49 0x49 = Little-endian (Intel)
  - 0x4D 0x4D = Big-endian (Motorola)
  ↓
// Step 4: Detect file issues
- Check file size (>1KB)
- Detect HTML error pages
- Validate TIFF version (42 or 43)
```

**File Validation Logic** (`geoTiffLoader.ts`):
```typescript
const view = new DataView(arrayBuffer);
const byte1 = view.getUint8(0);
const byte2 = view.getUint8(1);

if (!((byte1 === 0x49 && byte2 === 0x49) || 
      (byte1 === 0x4D && byte2 === 0x4D))) {
  throw new Error('Not a valid TIFF file');
}
```

### 2. Georaster Parsing

```typescript
// Parse the GeoTIFF into a georaster object
const georaster = await parseGeoraster(arrayBuffer);

// Georaster structure:
{
  values: [[...]],          // 2D array of pixel values
  mins: [20],              // Minimum value in raster
  maxs: [45],              // Maximum value in raster
  noDataValue: -9999,      // Value representing no data
  projection: "EPSG:4326", // Coordinate system
  xmin: 76.70,            // Bounding box
  ymin: 9.87,
  xmax: 76.75,
  ymax: 9.92,
  width: 100,             // Raster dimensions
  height: 100
}
```

### 3. Color Mapping

Each layer uses a custom color scale to visualize data:

#### LST (Land Surface Temperature)
```typescript
// Continuous blue-to-red heatmap
lstColorScale(value: number): string {
  const normalized = (value - 20) / (45 - 20); // 20-45°C range
  const r = Math.round(255 * normalized);
  const g = Math.round(255 * (1 - Math.abs(normalized - 0.5) * 2));
  const b = Math.round(255 * (1 - normalized));
  return `rgb(${r}, ${g}, ${b})`;
}
```

- **Blue** (20°C) → Cyan → Green → Yellow → Orange → **Red** (45°C)

#### UHI (Urban Heat Island Classification)
```typescript
// Discrete 3-class system
uhiColorScale(value: number): string {
  if (value <= 1.33) return '#22c55e';  // Green - Low
  if (value <= 2.66) return '#eab308';  // Yellow - Moderate
  return '#ef4444';                      // Red - High
}
```

#### NDVI (Normalized Difference Vegetation Index)
```typescript
// 4-step vegetation gradient
ndviColorScale(value: number): string {
  if (value < 0.2) return '#8b4513';  // Brown - bare soil/urban
  if (value < 0.4) return '#daa520';  // Gold - sparse vegetation
  if (value < 0.6) return '#9acd32';  // Yellow-green - moderate
  return '#228b22';                    // Dark green - dense vegetation
}
```

#### NDBI (Normalized Difference Built-up Index)
```typescript
// Continuous grey-to-yellow gradient
ndbiColorScale(value: number): string {
  const normalized = (value + 1) / 2; // -1 to 1 range
  const r = Math.round(150 + 105 * normalized);
  const g = Math.round(150 + 105 * normalized);
  const b = Math.round(150 * (1 - normalized));
  return `rgb(${r}, ${g}, ${b})`;
}
```

### 4. Layer Rendering

```typescript
// Create Leaflet layer from georaster
const layer = new GeoRasterLayer({
  georaster: georaster,
  opacity: 0.7,
  pixelValuesToColorFn: (pixelValues) => {
    const value = pixelValues[0];
    if (value === georaster.noDataValue || isNaN(value)) {
      return null; // Transparent for no-data pixels
    }
    return colorScale(value); // Apply color mapping
  },
  resolution: 256 // Canvas tile size (256x256 pixels)
});
```

**Rendering Process**:
1. Divide raster into 256x256 pixel tiles
2. For each pixel in a tile:
   - Get raster value at that location
   - Apply color scale function
   - Draw colored pixel on canvas
3. Cache tiles for performance
4. Use Web Workers for parallel processing

### 5. Pixel Value Extraction

```typescript
// Get value at specific coordinates
getPixelValue(georaster, lat, lng) {
  const values = georaster.getValues({
    left: lng,
    right: lng,
    top: lat,
    bottom: lat
  });
  return values[0][0][0]; // Extract single pixel value
}
```

Used for **click-to-query** functionality - displays exact values when user clicks on map.

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd dashboard-sourcecode
```

2. **Install dependencies**
```bash
npm install
```

3. **Add GeoTIFF files**

Place your 4 GeoTIFF files in `public/data/`:
```
public/data/
├── Thodupuzha_LST.tif
├── Thodupuzha_UHI_Map.tif
├── Thodupuzha_NDVI.tif
└── Thodupuzha_NDBI.tif
```

4. **Start development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🎯 Usage

### Dashboard Interface

#### 1. Layer Controls (Left Sidebar → Layers Tab)
- **Toggle Layers**: Click eye icon to show/hide layers
- **Opacity Slider**: Adjust transparency (10-100%)
- **Multiple Layers**: Enable multiple layers simultaneously

#### 2. Interactive Map
- **Zoom**: Scroll or use +/- controls
- **Pan**: Click and drag
- **Click for Data**: Click anywhere to see pixel values in popup
- **Layer Order**: LST → UHI → NDVI → NDBI (bottom to top)

#### 3. Statistics Panel (Left Sidebar → Statistics Tab)
- **Mean LST**: Average temperature with min/max range
- **Mean NDVI**: Average vegetation index
- **Mean NDBI**: Average built-up index
- **High Heat Zones**: Count of pixels with LST > 35°C
- **Total Zones**: Total valid pixels

Statistics update automatically when layers load.

#### 4. Export Panel (Left Sidebar → Export Tab)
- **CSV Export**: Tabular data with lat/lng coordinates
- **GeoJSON Export**: Spatial data with geometry
- **GeoTIFF Download**: Original raster files
- **Full Report**: Combined data in Excel format

### Keyboard Shortcuts
- `Esc` - Close popups
- `+/-` - Zoom in/out
- Click sidebar tabs to switch views

## 📊 Data Requirements

### GeoTIFF Specifications

#### Required Files
| File Name | Layer | Expected Range | Description |
|-----------|-------|----------------|-------------|
| `Thodupuzha_LST.tif` | LST | 20-45°C | Land Surface Temperature |
| `Thodupuzha_UHI_Map.tif` | UHI | 1-3 | Heat island classification |
| `Thodupuzha_NDVI.tif` | NDVI | -1 to 1 | Vegetation density |
| `Thodupuzha_NDBI.tif` | NDBI | -1 to 1 | Built-up area density |

#### Format Requirements
- **File Format**: GeoTIFF (.tif)
- **Byte Order**: Little-endian (II) or Big-endian (MM)
- **Compression**: None, LZW, or Deflate
- **CRS**: Any (WGS84/EPSG:4326 recommended)
- **Coverage**: Must include Thodupuzha region (9.89°N, 76.72°E)
- **Size**: <500MB per file for optimal performance

#### Creating Compatible GeoTIFF Files

Using GDAL to convert/prepare files:
```bash
# Convert to standard GeoTIFF
gdal_translate -of GTiff -co "COMPRESS=LZW" input.tif output.tif

# Reproject to WGS84
gdalwarp -t_srs EPSG:4326 input.tif output.tif

# Resample to smaller size
gdalwarp -tr 0.0001 0.0001 -r bilinear input.tif output.tif

# Create overviews for faster rendering
gdaladdo -r average input.tif 2 4 8 16
```

## ⚙️ How It Works

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Action: Toggle Layer ON                             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. React State Update: layers.lst = true                    │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. useEffect Triggered: [layers.lst]                        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
         ┌─────────────┴─────────────┐
         ↓                           ↓
┌────────────────────┐    ┌──────────────────────┐
│ Layer Already      │    │ Layer Not Loaded     │
│ Loaded? (cached)   │    │                      │
└────────┬───────────┘    └──────────┬───────────┘
         │ YES                       │ NO
         ↓                           ↓
    Skip Loading          ┌──────────────────────┐
         ↓                │ 4. Load GeoTIFF      │
         │                │ - Fetch file         │
         │                │ - Validate TIFF      │
         │                │ - Parse georaster    │
         │                │ - Create layer       │
         │                │ - Cache in ref       │
         │                └──────────┬───────────┘
         └────────────────────┬──────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Visibility Effect: [layers, opacity]                     │
│ - Remove ALL layers from map                                │
│ - Add back only enabled layers (LST, UHI, NDVI, NDBI)      │
│ - Set opacity for each layer                                │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Calculate Statistics from Loaded Layers                  │
│ - Parse pixel values                                        │
│ - Filter no-data values                                     │
│ - Compute mean, min, max                                    │
│ - Count high heat zones                                     │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Update UI                                                │
│ - Display layer on map                                      │
│ - Update statistics panel                                   │
│ - Enable export options                                     │
└─────────────────────────────────────────────────────────────┘
```

### Layer Management System

**State Management** (`UHIMap.tsx`):
```typescript
// Layer references stored in ref (persists across renders)
const geoLayersRef = useRef<{
  lst?: GeoTiffData;
  uhi?: GeoTiffData;
  ndvi?: GeoTiffData;
  ndbi?: GeoTiffData;
}>({});

// Load layers when toggled on
useEffect(() => {
  if (layers.lst && !geoLayersRef.current.lst) {
    // Load LST GeoTIFF
    const lstData = await loadGeoTiff(...);
    geoLayersRef.current.lst = lstData;
  }
  // Same for uhi, ndvi, ndbi
}, [layers.lst, layers.uhi, layers.ndvi, layers.ndbi]);

// Update visibility when layers or opacity changes
useEffect(() => {
  // Remove all layers
  Object.values(geoLayersRef.current).forEach(layer => {
    if (layer?.layer) mapRef.current.removeLayer(layer.layer);
  });
  
  // Add back enabled layers
  if (layers.lst && geoLayersRef.current.lst) {
    geoLayersRef.current.lst.layer.setOpacity(opacity);
    geoLayersRef.current.lst.layer.addTo(mapRef.current);
  }
  // Same for uhi, ndvi, ndbi
}, [layers.lst, layers.uhi, layers.ndvi, layers.ndbi, opacity]);
```

**Key Design Decisions**:
- ✅ Layers load once and stay cached in memory
- ✅ Toggling visibility doesn't reload files
- ✅ All layers removed then re-added to ensure clean slate
- ✅ Opacity changes apply immediately without reload

### Performance Optimizations

1. **Lazy Loading**: GeoTIFF files only load when layer toggled on
2. **Layer Caching**: Once loaded, kept in `geoLayersRef` for instant re-display
3. **Canvas Tiling**: 256x256px tiles instead of rendering entire raster
4. **Web Workers**: `georaster` uses workers for parallel processing
5. **Resolution Control**: `resolution: 256` balances quality vs speed
6. **Viewport Culling**: Only visible tiles are rendered

## 📚 API Reference

### `geoTiffLoader.ts`

#### `loadGeoTiff()`
Loads and parses a GeoTIFF file.

```typescript
async function loadGeoTiff(
  url: string,
  map: LeafletMap,
  colorScale: (value: number) => string,
  opacity: number = 0.7
): Promise<GeoTiffData>
```

**Parameters**:
- `url`: Path to GeoTIFF file (e.g., `/data/Thodupuzha_LST.tif`)
- `map`: Leaflet map instance
- `colorScale`: Function to convert pixel values to colors
- `opacity`: Layer transparency (0-1)

**Returns**: `GeoTiffData` object containing:
- `georaster`: Parsed raster data
- `layer`: Leaflet layer instance
- `min`: Minimum pixel value
- `max`: Maximum pixel value
- `values`: 2D array of pixel values

#### `getPixelValue()`
Extracts value at specific coordinates.

```typescript
function getPixelValue(
  georaster: any,
  lat: number,
  lng: number
): number | null
```

#### `calculateGeoStats()`
Calculates statistics from raster.

```typescript
function calculateGeoStats(georaster: any): {
  min: number;
  max: number;
  mean: number;
  count: number;
}
```

### Color Scale Functions

```typescript
lstColorScale(value: number): string      // Blue to red heatmap
uhiColorScale(value: number): string      // 3-class discrete
ndviColorScale(value: number): string     // Green to brown gradient
ndbiColorScale(value: number): string     // Grey to yellow gradient
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid byte order value" Error

**Cause**: GeoTIFF file is corrupted or in wrong format

**Solution**:
```bash
# Convert to standard GeoTIFF using GDAL
gdal_translate -of GTiff -co "COMPRESS=NONE" input.tif output.tif
```

#### 2. "File not found" / 404 Error

**Cause**: Files not in correct location

**Solution**:
- Verify files are in `public/data/` folder
- Check exact filenames (case-sensitive):
  - `Thodupuzha_LST.tif`
  - `Thodupuzha_UHI_Map.tif`
  - `Thodupuzha_NDVI.tif`
  - `Thodupuzha_NDBI.tif`

#### 3. Loading Hangs Forever

**Cause**: Files are too large or corrupted

**Solution**:
```bash
# Reduce file size
gdalwarp -tr 0.0001 0.0001 -r bilinear input.tif output.tif

# Check file integrity
gdalinfo input.tif
```

#### 4. Map Shows Wrong Location

**Cause**: Incorrect coordinate system

**Solution**:
```bash
# Reproject to WGS84
gdalwarp -t_srs EPSG:4326 input.tif output.tif
```

#### 5. All Layers Look the Same

**Cause**: Layer visibility toggle not working

**Solution**:
- Check browser console for errors
- Clear browser cache and refresh
- Verify files have different data values

#### 6. Layers Don't Toggle Off

**Cause**: Layer removal bug

**Solution**:
- Refresh browser
- Check if latest code version is running
- Look for console errors

### Debug Tools

**Browser Console Diagnostics**:
```javascript
// Check loaded layers
console.log(geoLayersRef.current);

// Test file accessibility
fetch('/data/Thodupuzha_LST.tif').then(r => console.log(r.status));

// Run diagnostic script
const script = document.createElement('script');
script.src = '/diagnose-geotiff.js';
document.head.appendChild(script);
```

**Check File Format**:
```bash
# Install GDAL
# Windows: https://gdal.org/download.html
# Mac: brew install gdal
# Linux: sudo apt-get install gdal-bin

# Inspect GeoTIFF
gdalinfo Thodupuzha_LST.tif

# Validate format
gdalinfo --format GTiff Thodupuzha_LST.tif
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output in `dist/` folder.

### Deploy to Static Hosting

**Vercel**:
```bash
npm install -g vercel
vercel deploy
```

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**GitHub Pages**:
```bash
npm run build
# Copy dist/ to gh-pages branch
```

### Environment Variables
Create `.env` file:
```env
VITE_MAP_CENTER_LAT=9.8894
VITE_MAP_CENTER_LNG=76.7249
VITE_MAP_ZOOM=14
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow existing TypeScript patterns
2. **Components**: Use functional components with hooks
3. **Types**: Add TypeScript types for all functions
4. **Comments**: Document complex logic
5. **Testing**: Test with real GeoTIFF files

### Adding New Layers

1. Add file to `public/data/`
2. Create color scale in `geoTiffLoader.ts`
3. Add to `LayerState` interface
4. Update loading logic in `UHIMap.tsx`
5. Add toggle in `LayerControls.tsx`

## 📄 License

MIT License - feel free to use for research and educational purposes.

## 📞 Support

- **Documentation**: See GEOTIFF_TROUBLESHOOTING.md for detailed troubleshooting
- **Issues**: Check browser console for error messages
- **GeoTIFF Help**: Refer to [GDAL documentation](https://gdal.org/)

## 🙏 Acknowledgments

- **Leaflet** - Interactive mapping
- **georaster** - GeoTIFF parsing
- **Radix UI** - Accessible components
- **TailwindCSS** - Styling framework
- **Thodupuzha** - Study area location

---

**Built with ❤️ for GIS Mapathon - Urban Heat Island Analysis**
