# Missing Pixel Handling Guide

## Overview
This document describes how the application handles locations where UHI raster data is not available (missing pixels, outside coverage area).

## Response Structure

### HTTP 200 with `data_status="outside_coverage"`

When a user clicks a location that is outside the UHI raster coverage area, the backend returns HTTP 200 (success) with a special status indicating the issue:

```json
{
  "lat": 9.6915,
  "lon": 76.7337,
  "data_status": "outside_coverage",
  "message": "Location outside UHI raster coverage",
  "lst": null,
  "ndvi": null,
  "ndbi": null,
  "uhi_class": null,
  "uhi_label": "Unknown",
  "uhi_description": "Outside coverage area",
  "recommendations": []
}
```

### Key Fields

- **`data_status`**: Set to `"outside_coverage"` when UHI pixel is missing
- **`message`**: Human-readable explanation
- **`uhi_class`**: `null` when outside coverage
- **`uhi_label`**: Set to `"Unknown"`
- **`recommendations`**: Empty array (no recommendations for uncovered areas)
- **`lst`, `ndvi`, `ndbi`**: May be `null` or contain values if those rasters have coverage

## Error Status Hierarchy

### 1. `data_status="ok"`
- **Meaning**: All required data available
- **HTTP Status**: 200
- **Condition**: UHI_CLASS raster returned valid pixel value (0, 1, or 2)
- **Action**: Display analysis results and recommendations

### 2. `data_status="outside_coverage"`
- **Meaning**: Location is outside UHI raster extent
- **HTTP Status**: 200
- **Condition**: UHI_CLASS raster returned null/NaN/empty
- **Action**: Show friendly message asking user to click within coverage area

### 3. `data_status="nodata"` (Legacy)
- **Meaning**: Generic data unavailability (kept for backward compatibility)
- **HTTP Status**: 200
- **Condition**: Fallback for other data issues
- **Action**: Show generic "no data" message

### 4. HTTP 400 Error
- **Meaning**: Location is outside AOI polygon boundary
- **Condition**: WFS INTERSECTS check failed
- **Action**: Show error message in popup

### 5. HTTP 503 Error
- **Meaning**: Cannot connect to GeoServer
- **Condition**: Network error, GeoServer down
- **Action**: Show connection error to user

### 6. HTTP 500 Error
- **Meaning**: Unexpected server error
- **Condition**: Uncaught exception in backend
- **Action**: Show generic error message

## Backend Implementation

### WCS Pixel Fetching (`fetch_pixel_value_from_wcs`)

```python
def fetch_pixel_value_from_wcs(...) -> Optional[float]:
    """
    Returns:
        - float: Valid pixel value
        - None: Missing pixel OR connection error OR processing error
    """
    # Network errors → return None
    # NoData pixels → return None
    # GeoServer errors → return None
    # Never raises exceptions
```

### Endpoint Logic (`get_location_analysis`)

```python
# Fetch UHI_CLASS (REQUIRED)
uhi_class = fetch_pixel_value_from_wcs(...)

# Check if pixel is missing
if uhi_class is None:
    return {
        "data_status": "outside_coverage",
        "message": "Location outside UHI raster coverage",
        ...
    }

# Continue with analysis if pixel exists
```

## Frontend Handling

### Map Popup (UHIMapReactLeaflet.tsx)

```tsx
if (data.data_status === 'outside_coverage') {
  // Show orange badge with "Outside UHI Coverage" message
  loadingPopup.setContent(`
    <div>📍 Outside UHI Coverage</div>
    <div>${data.message}</div>
  `);
  return;
}
```

### Analysis Panel (LocationAnalysisPanel.tsx)

```tsx
if (data.data_status === 'outside_coverage') {
  return (
    <div>
      <span className="badge-orange">Outside Coverage</span>
      <p>{data.message}</p>
    </div>
  );
}
```

## Spatial Window Sampling

To reduce NoData occurrences, the backend samples a **5x5 pixel window** around the clicked coordinate:

```python
window_size = 5  # Sample 5x5 pixels (25 total)
buffer = (window_size * 0.00009)  # ~10 meters per pixel

# Compute mean of valid pixels (ignore NoData/NaN)
valid_pixels = band_data[valid_mask]
mean_value = float(np.mean(valid_pixels))
```

This approach:
- Reduces edge effects at raster boundaries
- Averages out spatial noise
- Provides more robust measurements
- Still returns `None` if **all** pixels in window are NoData

## Testing Scenarios

### Scenario 1: Click Inside Coverage
```
Input:   (9.6915, 76.7337) - within UHI raster
Result:  HTTP 200, data_status="ok", uhi_class=2, uhi_label="High"
Display: Full analysis with recommendations
```

### Scenario 2: Click Outside Coverage
```
Input:   (9.9999, 76.9999) - outside UHI raster
Result:  HTTP 200, data_status="outside_coverage", uhi_class=null
Display: Orange badge "Outside UHI Coverage"
```

### Scenario 3: Click Outside AOI Polygon
```
Input:   (9.5000, 76.5000) - outside AOI boundary
Result:  HTTP 400, error message
Display: Red error popup "Outside AOI"
```

### Scenario 4: GeoServer Down
```
Input:   Any coordinate
Result:  HTTP 503, connection error
Display: Error alert "Cannot connect to GeoServer"
```

## Key Design Decisions

### ✅ HTTP 200 for Missing Pixels
**Rationale**: Missing pixels are not server errors - they're valid responses indicating the location is outside coverage. Users should not see error messages for this expected behavior.

### ✅ `data_status` Field Instead of HTTP Status
**Rationale**: HTTP status codes are for transport-level errors. Application-level status (data availability) belongs in the response body.

### ✅ No 500 Errors for Missing Pixels
**Rationale**: Reserve 500 errors for actual bugs/exceptions. Missing pixels are expected and handled gracefully.

### ✅ Descriptive Status Values
**Rationale**: `"outside_coverage"` is more specific than `"nodata"` - it tells users exactly what the issue is.

## Logging

Backend logs clearly distinguish between different failure modes:

```
✓ Valid data: Sampled 25/25 pixels for thodupuzha__UHI, mean=2.000
⚠️ NoData: All pixels in 5x5 window are NoData/NaN for thodupuzha__UHI
❌ GeoServer ERROR: 500 for thodupuzha__UHI
❌ Network error for thodupuzha__LST: Connection refused
```

## Best Practices

1. **Always check `data_status`** before displaying analysis results
2. **Use specific status messages** instead of generic "error occurred"
3. **Provide actionable guidance** ("click within coverage area")
4. **Log warnings, not errors** for expected missing pixels
5. **Reserve 500 errors** for actual bugs requiring investigation

## Related Files

- `backend/main.py` - Backend endpoint and WCS fetching logic
- `src/components/UHIMapReactLeaflet.tsx` - Map click handling and popup display
- `src/components/LocationAnalysisPanel.tsx` - Analysis panel with status badges
