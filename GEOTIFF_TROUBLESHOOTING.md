# GeoTIFF Loading Troubleshooting

## Error: "Invalid byte order value"

This error means the GeoTIFF files are not in the correct format or are corrupted.

### Quick Diagnostics

1. **Open browser console** (F12)
2. **Run the diagnostic tool**:
   ```javascript
   // Load the diagnostic script
   const script = document.createElement('script');
   script.src = '/diagnose-geotiff.js';
   document.head.appendChild(script);
   ```

3. **Check the output** - it will tell you:
   - ✓ If files exist and are accessible
   - ✓ File sizes
   - ✓ Byte order (little-endian II or big-endian MM)
   - ✓ TIFF version
   - ❌ Any format issues

### Common Issues and Solutions

#### Issue 1: Files Not Found
**Symptom:** Console shows 404 errors

**Solution:**
- Verify files are in `public/data/` folder
- Check exact filenames (case-sensitive):
  - `Thodupuzha_LST.tif`
  - `Thodupuzha_UHI_Map.tif`
  - `Thodupuzha_NDVI.tif`
  - `Thodupuzha_NDBI.tif`

#### Issue 2: Invalid TIFF Format
**Symptom:** "Invalid byte order value" error

**Possible Causes:**
1. Files are not actually GeoTIFF format
2. Files are compressed with unsupported compression
3. Files are corrupted

**Solution:**
Convert your files to standard GeoTIFF format using GDAL:

```bash
# Install GDAL first
# Windows: https://gdal.org/download.html
# Mac: brew install gdal
# Linux: sudo apt-get install gdal-bin

# Convert to standard GeoTIFF
gdal_translate -of GTiff -co "COMPRESS=NONE" -co "TILED=NO" input.tif output.tif

# For all your files:
gdal_translate -of GTiff -co "COMPRESS=NONE" input_LST.tif Thodupuzha_LST.tif
gdal_translate -of GTiff -co "COMPRESS=NONE" input_UHI.tif Thodupuzha_UHI_Map.tif
gdal_translate -of GTiff -co "COMPRESS=NONE" input_NDVI.tif Thodupuzha_NDVI.tif
gdal_translate -of GTiff -co "COMPRESS=NONE" input_NDBI.tif Thodupuzha_NDBI.tif
```

#### Issue 3: Large File Size / Slow Loading
**Symptom:** "Loading GeoTIFF layers..." hangs for a long time

**Solution:**
Reduce file size by resampling:

```bash
# Resample to smaller resolution (adjust -tr values as needed)
gdalwarp -tr 0.0001 0.0001 -r bilinear input.tif output.tif

# Or create overviews for faster rendering
gdaladdo -r average input.tif 2 4 8 16
```

#### Issue 4: Wrong Coordinate System
**Symptom:** Map loads but data appears in wrong location

**Solution:**
Reproject to WGS84 (EPSG:4326):

```bash
gdalwarp -t_srs EPSG:4326 input.tif output.tif
```

### Recommended GeoTIFF Settings

Create GeoTIFF files with these settings for best compatibility:

```bash
gdal_translate \\
  -of GTiff \\
  -co "COMPRESS=LZW" \\
  -co "TILED=YES" \\
  -co "BLOCKXSIZE=256" \\
  -co "BLOCKYSIZE=256" \\
  -a_srs EPSG:4326 \\
  input.tif output.tif
```

### File Format Requirements

✅ **Supported:**
- Standard GeoTIFF (.tif, .tiff)
- Little-endian (II) or Big-endian (MM) byte order
- Single or multi-band rasters
- LZW, Deflate, or no compression
- CRS: Any, but WGS84 (EPSG:4326) recommended

❌ **Not Supported:**
- JPEG compression in TIFF
- Extremely large files (>500MB may be slow)
- Multi-page TIFF (only first page used)
- Some exotic TIFF variants

### Validation Checklist

Before placing files in `public/data/`:

- [ ] Files are actual GeoTIFF format (not renamed images)
- [ ] Files open successfully in QGIS or similar GIS software
- [ ] Files are in WGS84 or known CRS
- [ ] Files cover Thodupuzha region (9.8894°N, 76.7249°E)
- [ ] Files have appropriate data ranges:
  - LST: 20-45°C
  - UHI: 1-3 (Low/Moderate/High)
  - NDVI: -1 to 1
  - NDBI: -1 to 1

### Test with Sample Data

If you don't have GeoTIFF files yet, create test files:

```python
# Python script to create test GeoTIFF
import numpy as np
from osgeo import gdal, osr

def create_test_geotiff(filename, width=100, height=100):
    # Create test data
    data = np.random.rand(height, width) * 100
    
    # Set up geotransform (Thodupuzha region)
    lon_min, lat_max = 76.70, 9.91
    pixel_size = 0.001
    geotransform = (lon_min, pixel_size, 0, lat_max, 0, -pixel_size)
    
    # Create file
    driver = gdal.GetDriverByName('GTiff')
    dataset = driver.Create(filename, width, height, 1, gdal.GDT_Float32)
    dataset.SetGeoTransform(geotransform)
    
    # Set projection (WGS84)
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)
    dataset.SetProjection(srs.ExportToWkt())
    
    # Write data
    dataset.GetRasterBand(1).WriteArray(data)
    dataset.FlushCache()
    dataset = None

# Create test files
create_test_geotiff('Thodupuzha_LST.tif')
create_test_geotiff('Thodupuzha_UHI_Map.tif')
create_test_geotiff('Thodupuzha_NDVI.tif')
create_test_geotiff('Thodupuzha_NDBI.tif')
```

### Still Having Issues?

1. **Check Browser Console** - Look for specific error messages
2. **Try a different browser** - Some browsers handle large files better
3. **Check file permissions** - Ensure files are readable
4. **Verify CORS** - If serving from different domain
5. **Test with smaller files** - Create a small test GeoTIFF first

### Getting Help

If you're still stuck, provide these details:
1. Error messages from console
2. Output from diagnose-geotiff.js
3. File sizes and creation method
4. Browser and version
5. Operating system
