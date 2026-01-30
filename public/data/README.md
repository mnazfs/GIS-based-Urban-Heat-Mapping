# GeoTIFF Data Files

**REQUIRED:** Place your GeoTIFF files in this directory for the dashboard to work.

## Required Files:

1. **Thodupuzha_LST.tif** - Land Surface Temperature data (REQUIRED)
   - Expected range: 20-45°C
   - Will be displayed with blue-to-red heatmap

2. **Thodupuzha_UHI_Map.tif** - Urban Heat Island classification (REQUIRED)
   - Expected values: 1=Low, 2=Moderate, 3=High
   - Will be displayed with green/yellow/red colors

3. **Thodupuzha_NDVI.tif** - Normalized Difference Vegetation Index (REQUIRED)
   - Expected range: -1 to 1
   - Will be displayed with brown-to-green gradient

4. **Thodupuzha_NDBI.tif** - Normalized Difference Built-up Index (REQUIRED)
   - Expected range: -1 to 1
   - Will be displayed with grey-to-yellow gradient

## File Format:

- All files MUST be in GeoTIFF format (.tif)
- Coordinate Reference System: WGS84 (EPSG:4326) preferred
- Files should cover the Thodupuzha region (approximately 9.8894°N, 76.7249°E)

## Important Note:

**The dashboard will NOT display mock data.** All four GeoTIFF files must be present for the dashboard to function properly. If any files are missing, the corresponding layer will fail to load.
