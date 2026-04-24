const fs = require('fs');
const path = require('path');

// 1. MockDataContext.jsx
let mockPath = path.join(__dirname, 'frontend/src/context/MockDataContext.jsx');
let mockContent = fs.readFileSync(mockPath, 'utf8');

// Remove season: '...',
mockContent = mockContent.replace(/season:\s*'.*?',\n/g, '');
// Remove { type: 'seasonal', reason: '...' }, from fraud_alerts
mockContent = mockContent.replace(/\{\s*type:\s*'seasonal'.*?\},?/g, '');
// Remove season from submitLabReport fallback
mockContent = mockContent.replace(/season:\s*batch\.season\s*\|\|\s*'Spring 2025',/g, '');

// Update createProduct local fallback with locations
mockContent = mockContent.replace(/ingredients:\s*ingredients\n\s*\};/g, `ingredients: ingredients,
          lab_location: { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
          manufacturer_location: { lat: 13.6288, lng: 79.4192, name: 'Tirupati, Andhra Pradesh' },
          destination_location: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' }
        };`);

// Update getProduct
mockContent = mockContent.replace(
  /if \(res\.data\.success\) return res\.data\.data;/g,
  `if (res.data.success) {
        return {
          ...res.data.data,
          lab_location: res.data.data.lab_location || { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
          manufacturer_location: res.data.data.manufacturer_location || { lat: 13.6288, lng: 79.4192, name: 'Tirupati, Andhra Pradesh' },
          destination_location: res.data.data.destination_location || { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' }
        };
      }`
);

mockContent = mockContent.replace(
  /return products\.find\(\(p\) => String\(p\.id\) === String\(productId\)\) \|\| null;/g,
  `const found = products.find((p) => String(p.id) === String(productId));
    if (found) {
        return {
          ...found,
          lab_location: found.lab_location || { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
          manufacturer_location: found.manufacturer_location || { lat: 13.6288, lng: 79.4192, name: 'Tirupati, Andhra Pradesh' },
          destination_location: found.destination_location || { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' }
        };
    }
    return null;`
);
fs.writeFileSync(mockPath, mockContent);

// 2. LabPortal.jsx
let labPath = path.join(__dirname, 'frontend/src/pages/LabPortal.jsx');
let labContent = fs.readFileSync(labPath, 'utf8');

labContent = labContent.replace(/seasonal:\s*'bg-teal-100 text-teal-700',/g, '');
labContent = labContent.replace(/\{alert\.type === 'seasonal' && '🍂 Season'\}/g, '');

// Remove season from LabReportModal
labContent = labContent.replace(/\{\/\*\s*Season\s*\*\/\}\s*<div.*?Season<\/span>\s*<span.*?<\/span>\s*<\/div>/s, '');

// Fix purity and pH hardcoding
labContent = labContent.replace(/ph_level:\s*7\.0,/g, `ph_level: parseFloat((6.5 + Math.random() * 1.5).toFixed(1)),`);
labContent = labContent.replace(/purity_percentage:\s*95\.0,/g, `purity_percentage: parseFloat((90 + Math.random() * 8).toFixed(1)),`);

fs.writeFileSync(labPath, labContent);

// 3. ManufacturerDashboard.jsx
let mfgPath = path.join(__dirname, 'frontend/src/pages/ManufacturerDashboard.jsx');
if (fs.existsSync(mfgPath)) {
  let mfgContent = fs.readFileSync(mfgPath, 'utf8');
  // totalInputWeight.toFixed(1) -> toFixed(2)
  mfgContent = mfgContent.replace(/totalInputWeight\.toFixed\(1\)/g, 'totalInputWeight.toFixed(2)');
  mfgContent = mfgContent.replace(/\{product\.total_input_weight\} kg/g, '{Number(product.total_input_weight).toFixed(2)} kg');
  fs.writeFileSync(mfgPath, mfgContent);
}

// 4. ConsumerScan.jsx
let consumerPath = path.join(__dirname, 'frontend/src/pages/ConsumerScan.jsx');
if (fs.existsSync(consumerPath)) {
  let consumerContent = fs.readFileSync(consumerPath, 'utf8');
  consumerContent = consumerContent.replace(/\{product\.total_input_weight\} kg/g, '{Number(product.total_input_weight).toFixed(2)} kg');
  fs.writeFileSync(consumerPath, consumerContent);
}

// 5. backend/seed_batches.py
let seedPath = path.join(__dirname, 'backend/seed_batches.py');
if (fs.existsSync(seedPath)) {
  let seedContent = fs.readFileSync(seedPath, 'utf8');
  seedContent = seedContent.replace(/'season':\s*'.*?',\n/g, '');
  seedContent = seedContent.replace(/\{'type':\s*'seasonal'.*?\},?/g, '');
  fs.writeFileSync(seedPath, seedContent);
}

console.log('Done!');
