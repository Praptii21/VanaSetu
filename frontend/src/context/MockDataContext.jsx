import { createContext, useContext, useState, useCallback } from 'react';

const MockDataContext = createContext(null);

// ── Seed Data ─────────────────────────────────────────────
const SEED_PENDING = [
  {
    id: '001',
    herb_name: 'Tulsi',
    collector_name: 'Ravi Kumar',
    weight_kg: 12.5,
    gps_lat: 12.2958,
    gps_lng: 76.6394,
    gps_place_name: 'Mysuru, Karnataka',
    ai_confidence: 94,
    time_of_collection: '2026-04-24T09:15:00',
    status: 'pending',
    tx_hash: '0xa7f3c9d2e1b4f8a6c3d5e7f9b2a4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7',
  },
  {
    id: '002',
    herb_name: 'Ashwagandha',
    collector_name: 'Priya Sharma',
    weight_kg: 8.0,
    gps_lat: 12.4244,
    gps_lng: 75.7382,
    gps_place_name: 'Coorg, Karnataka',
    ai_confidence: 89,
    time_of_collection: '2026-04-24T10:30:00',
    status: 'pending',
    tx_hash: '0xb8e4d0c3f2a5b7d9e1c3f5a7b9d1e3f5a7c9d1e3f5b7a9c1d3e5f7a9b1c3d5',
  },
  {
    id: '003',
    herb_name: 'Brahmi',
    collector_name: 'Suresh Patil',
    weight_kg: 8.5,
    gps_lat: 13.0068,
    gps_lng: 76.1004,
    gps_place_name: 'Hassan, Karnataka',
    ai_confidence: 91,
    time_of_collection: '2026-04-24T08:45:00',
    status: 'pending',
    tx_hash: '0xc9f5e1d3a7b9c1e3f5d7a9b1c3e5f7a9d1b3c5e7f9a1b3d5c7e9f1a3b5d7c9',
  },
  {
    id: '006',
    herb_name: 'Neem',
    collector_name: 'Kavitha Devi',
    weight_kg: 15.0,
    gps_lat: 12.9716,
    gps_lng: 77.5946,
    gps_place_name: 'Bengaluru, Karnataka',
    ai_confidence: 97,
    time_of_collection: '2026-04-24T07:30:00',
    status: 'pending',
    tx_hash: '0xd0a6b2c8e4f0a6b2d8e4c0f6a2b8d4e0c6f2a8b4d0e6c2f8a4b0d6e2c8f4a0',
  },
];

const SEED_VERIFIED = [
  {
    id: '004',
    herb_name: 'Tulsi',
    collector_name: 'Ravi Kumar',
    weight_kg: 12.5,
    gps_lat: 12.2958,
    gps_lng: 76.6394,
    gps_place_name: 'Mysuru, Karnataka',
    ai_confidence: 94,
    time_of_collection: '2026-04-24T09:15:00',
    status: 'lab_verified',
    tx_hash: '0xe1b7c3d9f5a1b7d3c9e5f1a7b3d9c5e1f7a3b9d5c1e7f3a9b5d1c7e3f9a5b1',
    lab_report: {
      ph_level: 6.8,
      purity_percentage: 96,
      heavy_metals_pass: true,
      contamination_pass: true,
      weight_verified_kg: 12.3,
      weight_match: false,
      overall_status: 'pass',
      report_hash: '0xf2c8d4e0a6b2f8c4d0e6a2b8d4f0c6e2a8b4d0f6c2e8a4b0d6f2c8e4a0b6d2',
      time_tested: '2026-04-24T11:00:00',
    },
  },
  {
    id: '005',
    herb_name: 'Brahmi',
    collector_name: 'Suresh Patil',
    weight_kg: 8.5,
    gps_lat: 13.0068,
    gps_lng: 76.1004,
    gps_place_name: 'Hassan, Karnataka',
    ai_confidence: 91,
    time_of_collection: '2026-04-24T08:45:00',
    status: 'lab_verified',
    tx_hash: '0xa3d9e5f1b7c3a9d5e1f7b3c9a5d1e7f3b9c5a1d7e3f9b5c1a7d3e9f5b1c7a3',
    lab_report: {
      ph_level: 7.1,
      purity_percentage: 91,
      heavy_metals_pass: true,
      contamination_pass: true,
      weight_verified_kg: 8.1,
      weight_match: false,
      overall_status: 'pass',
      report_hash: '0xb4e0f6c2a8d4b0e6f2c8a4d0b6e2f8c4a0d6b2e8f4c0a6d2b8e4f0c6a2d8b4',
      time_tested: '2026-04-24T10:30:00',
    },
  },
];

// ── Trust Score Calculation ───────────────────────────────
export function calculateTrustScore(batches) {
  if (batches.length === 0) return 0;
  let totalScore = 0;
  batches.forEach((batch) => {
    const lab = batch.lab_report;
    const aiScore = (batch.ai_confidence / 100) * 20;
    const purityScore = (lab.purity_percentage / 100) * 30;
    const weightScore = lab.weight_match ? 20 : 0;
    const heavyMetalsScore = lab.heavy_metals_pass ? 15 : 0;
    const contaminationScore = lab.contamination_pass ? 15 : 0;
    totalScore += aiScore + purityScore + weightScore + heavyMetalsScore + contaminationScore;
  });
  return Math.round(totalScore / batches.length);
}

// ── SHA256 Hash (real, using Web Crypto API) ──────────────
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── Provider ──────────────────────────────────────────────
export function MockDataProvider({ children }) {
  const [auth, setAuth] = useState({ isLoggedIn: false, role: null, username: '' });
  const [pendingBatches, setPendingBatches] = useState(SEED_PENDING);
  const [verifiedBatches, setVerifiedBatches] = useState(SEED_VERIFIED);
  const [products, setProducts] = useState([]);

  const login = useCallback((role, username) => {
    setAuth({ isLoggedIn: true, role, username });
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, username: '' });
  }, []);

  const submitLabReport = useCallback(async (batchId, reportData) => {
    const batch = pendingBatches.find((b) => b.id === batchId);
    if (!batch) return null;

    const weightMatch = Math.abs(batch.weight_kg - reportData.weight_verified_kg) < 0.01;
    const reportHash = await sha256(`report-${batchId}-${Date.now()}`);

    const verifiedBatch = {
      ...batch,
      status: 'lab_verified',
      lab_report: {
        ...reportData,
        weight_match: weightMatch,
        report_hash: reportHash,
        time_tested: new Date().toISOString(),
      },
    };

    setPendingBatches((prev) => prev.filter((b) => b.id !== batchId));
    setVerifiedBatches((prev) => [...prev, verifiedBatch]);

    return { reportHash, weightMatch };
  }, [pendingBatches]);

  const createProduct = useCallback(async (productData, selectedBatchIds) => {
    const selectedBatches = verifiedBatches.filter((b) => selectedBatchIds.includes(b.id));
    const trustScore = calculateTrustScore(selectedBatches);
    const totalInputWeight = selectedBatches.reduce(
      (sum, b) => sum + (b.lab_report?.weight_verified_kg || b.weight_kg),
      0
    );
    const productHash = await sha256(`product-${productData.product_name}-${Date.now()}`);

    const newProduct = {
      id: String(products.length + 1).padStart(3, '0'),
      product_name: productData.product_name,
      batch_ids: selectedBatchIds,
      ingredients: selectedBatches,
      total_input_weight: parseFloat(totalInputWeight.toFixed(1)),
      output_units: productData.output_units,
      manufacturing_date: new Date().toISOString(),
      expiry_date: productData.expiry_date,
      product_hash: productHash,
      trust_score: trustScore,
    };

    setProducts((prev) => [...prev, newProduct]);
    setVerifiedBatches((prev) => prev.filter((b) => !selectedBatchIds.includes(b.id)));

    return newProduct;
  }, [verifiedBatches, products]);

  const getProduct = useCallback(
    (productId) => products.find((p) => p.id === productId) || null,
    [products]
  );

  return (
    <MockDataContext.Provider
      value={{
        auth,
        login,
        logout,
        pendingBatches,
        verifiedBatches,
        products,
        submitLabReport,
        createProduct,
        getProduct,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) throw new Error('useMockData must be used within MockDataProvider');
  return context;
}
