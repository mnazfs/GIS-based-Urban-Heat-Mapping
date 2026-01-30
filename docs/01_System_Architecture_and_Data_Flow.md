# System Architecture and Data Flow

## Project Overview
- This project delivers a GIS-based Urban Heat Island (UHI) analysis platform.
- Integrates satellite data, geospatial processing, and interactive visualization.
- Supports both point-based and Area of Interest (AOI)-based UHI analysis for urban planning and research.

## High-Level System Architecture
- **Frontend:** React dashboard for user interaction and visualization.
- **Backend:** FastAPI server for API orchestration, data processing, and analysis logic.
- **GeoServer:** Publishes geospatial layers (WMS/WCS) for map rendering and data access.
- **Google Earth Engine (GEE):** Cloud-based geospatial computation and Landsat 8 data processing.
- **Data Storage:** GeoTIFF files for raster data exchange between GEE, backend, and GeoServer.

## Component-wise Responsibilities
- **React Frontend:**
  - User authentication, AOI/point selection, and results visualization.
  - Requests analysis, displays WMS layers, and manages map UI.
- **FastAPI Backend:**
  - Handles API requests, manages AOI/point analysis workflows.
  - Communicates with GEE, processes GeoTIFFs, and interacts with GeoServer.
- **GeoServer:**
  - Publishes raster/vector layers as WMS/WCS for frontend consumption.
  - Manages spatial data catalog and SLD-based styling.
- **Google Earth Engine:**
  - Processes Landsat 8 Collection 2 Level 2 data for UHI metrics.
  - Exports processed rasters as GeoTIFFs.
- **Landsat 8 Data:**
  - Provides multi-spectral satellite imagery for UHI computation.

## Data Flow (Step-by-step)
### 1. Landsat → GEE
- Landsat 8 imagery is accessed and pre-processed in GEE.
- GEE computes UHI metrics (e.g., Land Surface Temperature) for the target area.

### 2. GEE → GeoTIFF
- GEE exports the processed UHI raster as a GeoTIFF file.
- The GeoTIFF is downloaded by the backend for further use.

### 3. GeoTIFF → GeoServer
- Backend uploads the GeoTIFF to GeoServer's data directory.
- GeoServer publishes the raster as a WMS/WCS layer, making it accessible for visualization.

### 4. GeoServer → Backend
- Backend queries GeoServer for metadata, layer status, and WMS URLs.
- Backend prepares analysis results and map layer info for the frontend.

### 5. Backend → Frontend
- Frontend requests analysis (point or AOI) via API.
- Backend returns UHI statistics, WMS layer URLs, and metadata.
- Frontend displays results and renders WMS layers on the map.

## Point-based Analysis
- User selects a point on the map.
- Frontend sends coordinates to backend.
- Backend queries UHI raster (via GeoTIFF or GeoServer WCS) for the selected point.
- UHI value and statistics are returned and visualized.

## AOI-based Analysis
- User uploads or draws an AOI polygon.
- Frontend sends AOI geometry to backend.
- Backend clips UHI raster to AOI, computes zonal statistics (mean, distribution, etc.).
- AOI is published as a WMS layer for visualization.
- Results and AOI WMS URL are returned to frontend for display.

## Why These Technologies Were Chosen
- **React:** Modern, component-based UI for interactive geospatial dashboards.
- **FastAPI:** High-performance Python API framework, ideal for geospatial data processing.
- **GeoServer:** Open-source, standards-compliant server for publishing spatial data (WMS/WCS).
- **Google Earth Engine:** Scalable, cloud-based geospatial computation and access to satellite archives.
- **Landsat 8:** Reliable, open-access satellite data with suitable spectral bands for UHI analysis.
- **GeoTIFF:** Widely supported raster format for interoperability between GEE, backend, and GeoServer.
