// GeoTIFF File Diagnostic Tool
// Run this in browser console to check your GeoTIFF files

async function diagnoseGeoTiff(filename) {
  try {
    console.log(`\n=== Diagnosing ${filename} ===`);
    
    const url = `/data/${filename}`;
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`❌ File not found or not accessible`);
      return;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log(`✓ File size: ${arrayBuffer.byteLength} bytes`);
    
    // Check byte order
    const view = new DataView(arrayBuffer);
    const byte1 = view.getUint8(0);
    const byte2 = view.getUint8(1);
    
    console.log(`First two bytes: 0x${byte1.toString(16).padStart(2, '0')} 0x${byte2.toString(16).padStart(2, '0')}`);
    
    if (byte1 === 0x49 && byte2 === 0x49) {
      console.log(`✓ Byte order: Little-endian (II)`);
    } else if (byte1 === 0x4D && byte2 === 0x4D) {
      console.log(`✓ Byte order: Big-endian (MM)`);
    } else {
      console.error(`❌ Invalid TIFF file: Missing byte order marker`);
      console.error(`Expected: 0x49 0x49 (II) or 0x4D 0x4D (MM)`);
      console.error(`Got: 0x${byte1.toString(16)} 0x${byte2.toString(16)}`);
      return;
    }
    
    // Check TIFF version
    const version = byte1 === 0x49 
      ? view.getUint16(2, true)  // little-endian
      : view.getUint16(2, false); // big-endian
    
    console.log(`TIFF version: ${version}`);
    
    if (version === 42) {
      console.log(`✓ Standard TIFF`);
    } else if (version === 43) {
      console.log(`✓ BigTIFF format`);
    } else {
      console.warn(`⚠ Unusual TIFF version: ${version}`);
    }
    
    console.log(`\n✅ ${filename} appears to be a valid TIFF file`);
    
  } catch (error) {
    console.error(`❌ Error diagnosing ${filename}:`, error);
  }
}

// Run diagnostics on all files
async function diagnoseAll() {
  const files = [
    'Thodupuzha_LST.tif',
    'Thodupuzha_UHI_Map.tif',
    'Thodupuzha_NDVI.tif',
    'Thodupuzha_NDBI.tif'
  ];
  
  console.log('🔍 Starting GeoTIFF diagnostics...\n');
  
  for (const file of files) {
    await diagnoseGeoTiff(file);
  }
  
  console.log('\n✅ Diagnostics complete');
}

// Auto-run on load
diagnoseAll();

// Export for manual use
window.diagnoseGeoTiff = diagnoseGeoTiff;
window.diagnoseAll = diagnoseAll;

console.log('\n📋 Manual commands available:');
console.log('  diagnoseGeoTiff("filename.tif") - Check a specific file');
console.log('  diagnoseAll() - Check all files');
