# Deployment, Usage, and Limitations

## System Requirements
- Windows OS (tested on Windows 10/11)
- Python 3.9+ (for FastAPI backend)
- Node.js 16+ (for React frontend)
- GeoServer 2.20+ (standalone or web archive)
- Modern web browser (Chrome, Edge, Firefox)
- Minimum 8 GB RAM recommended

## Folder Structure Overview
- `backend/` — FastAPI backend (API, analysis, GeoServer integration)
- `src/` — React frontend source code
- `public/` — Static assets for frontend
- `docs/` — Technical documentation
- `index.html` — Frontend entry point
- `package.json` — Frontend dependencies and scripts
- `GEOSERVER_MIGRATION.md` — GeoServer setup guide

## How to Run the Backend
1. Ensure Python 3.9+ is installed.
2. Install required Python packages (see requirements.txt or README).
3. Start the FastAPI server:
   - Run the main backend script (e.g., `main.py`).
   - The API will be available at `http://localhost:8000` by default.
4. Confirm backend can connect to GeoServer (see logs for errors).

## How to Run GeoServer
1. Download and extract GeoServer (version 2.20+ recommended).
2. Start GeoServer using the provided startup script or executable.
3. Access the GeoServer web admin at `http://localhost:8080/geoserver`.
4. Ensure the data directory is writable and accessible by the backend.
5. Configure workspaces, stores, and SLD styles as needed.

## How to Use the Dashboard
1. Start the React frontend (see package.json for scripts).
2. Open the dashboard in a web browser (default: `http://localhost:5173`).
3. Use the map interface to:
   - Select a point for UHI value analysis.
   - Upload a shapefile (AOI) for zonal UHI analysis.
   - View results and map layers published via GeoServer.

## Supported Analysis Types
- **Point-based Raster Analysis:**
  - User clicks a map location.
  - Backend queries UHI raster for the selected point.
  - Returns UHI value and statistics for that location.
- **AOI-based Shapefile Upload Analysis:**
  - User uploads a zipped shapefile (polygon AOI).
  - Backend processes AOI, computes zonal UHI statistics.
  - AOI is published as a WMS layer for visualization.

## Known Limitations
- **Rendering:**
  - Only WMS layers published by GeoServer are supported for AOI visualization.
  - No support for direct GeoTIFF rendering in the frontend.
- **Backend Dependency:**
  - Backend requires GeoServer to be running and accessible for all AOI-based workflows.
  - If GeoServer is unavailable, AOI upload and rendering will fail.
- **Shapefile Requirements:**
  - AOI upload requires a valid zipped shapefile with all mandatory components (.shp, .shx, .dbf, .prj).
- **Analysis Scope:**
  - Only UHI (Urban Heat Island) analysis is currently implemented.
  - No support for time-series or multi-band analysis.
- **Performance:**
  - Large AOIs or high-resolution rasters may impact performance on limited hardware.

## Future Enhancements
- Support for additional analysis types (e.g., NDVI, time-series).
- Direct GeoTIFF rendering in the frontend (bypassing WMS).
- Automated GeoServer setup and configuration scripts.
- Enhanced error handling and user feedback.
- Multi-user authentication and session management.
- Integration with cloud-based data sources and scalable deployments.

---
This documentation is intended to guide developers, evaluators, and future maintainers in deploying, using, and extending the UHI dashboard system. Limitations reflect current engineering constraints and are subject to improvement in future releases.
