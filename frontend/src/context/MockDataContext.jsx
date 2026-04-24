import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

const DataContext = createContext(null);

// ── Trust Score Calculation (Top-level export for Dashboard) ──
export function calculateTrustScore(batches) {
  if (!batches || batches.length === 0) return 0;
  let totalScore = 0;
  batches.forEach((batch) => {
    const lab = batch.lab_report;
    if (!lab) return;
    const aiScore = (batch.ai_confidence / 100) * 20;
    const purityScore = (lab.purity_percentage / 100) * 30;
    const weightScore = lab.weight_match ? 20 : 0;
    const heavyMetalsScore = lab.heavy_metals_pass ? 15 : 0;
    const contaminationScore = lab.contamination_pass ? 15 : 0;
    totalScore += aiScore + purityScore + weightScore + heavyMetalsScore + contaminationScore;
  });
  return Math.round(totalScore / batches.length);
}

export function MockDataProvider({ children }) {
  const [auth, setAuth] = useState({
    isLoggedIn: !!localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    username: localStorage.getItem('username') || '',
  });
  const [pendingBatches, setPendingBatches] = useState([
    {
      id: 101,
      herb_name: 'Ashwagandha',
      collector_name: 'Rahul Sharma',
      weight_kg: 12.5,
      gps_lat: 28.6139,
      gps_lng: 77.2090,
      gps_place_name: 'Rishikesh, Uttarakhand',
      ai_confidence: 94,
      time_of_collection: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 88,
      alert_level: 'GREEN',
      season: 'Winter 2025',
      fraud_alerts: [],
    },
    {
      id: 102,
      herb_name: 'Brahmi',
      collector_name: 'Suresh Gupta',
      weight_kg: 8.2,
      gps_lat: 30.0668,
      gps_lng: 79.0193,
      gps_place_name: 'Almora, Uttarakhand',
      ai_confidence: 65,
      time_of_collection: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 72,
      alert_level: 'YELLOW',
      season: 'Monsoon 2025',
      fraud_alerts: [{ type: 'score', reason: 'Low AI confidence (65%)' }],
    },
    {
      id: 103,
      herb_name: 'Shatavari',
      collector_name: 'Meena Devi',
      weight_kg: 15.8,
      gps_lat: 22.7196,
      gps_lng: 75.8577,
      gps_place_name: 'Indore, Madhya Pradesh',
      ai_confidence: 89,
      time_of_collection: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 85,
      alert_level: 'GREEN',
      season: 'Spring 2025',
      fraud_alerts: [],
    },
    {
      id: 104,
      herb_name: 'Neem Bark',
      collector_name: 'Arjun Patel',
      weight_kg: 22.1,
      gps_lat: 23.0225,
      gps_lng: 72.5714,
      gps_place_name: 'Ahmedabad, Gujarat',
      ai_confidence: 41,
      time_of_collection: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 55,
      alert_level: 'RED',
      season: 'Summer 2025',
      fraud_alerts: [
        { type: 'score', reason: 'Critically low AI confidence (41%)' },
        { type: 'location', reason: 'Neem not native to reported GPS zone' },
      ],
    },
    {
      id: 105,
      herb_name: 'Tulsi',
      collector_name: 'Priya Nair',
      weight_kg: 6.3,
      gps_lat: 10.8505,
      gps_lng: 76.2711,
      gps_place_name: 'Thrissur, Kerala',
      ai_confidence: 97,
      time_of_collection: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 93,
      alert_level: 'GREEN',
      season: 'Monsoon 2025',
      fraud_alerts: [],
    },
    {
      id: 106,
      herb_name: 'Mulethi',
      collector_name: 'Deepak Verma',
      weight_kg: 9.7,
      gps_lat: 32.7266,
      gps_lng: 74.8570,
      gps_place_name: 'Jammu, J&K',
      ai_confidence: 78,
      time_of_collection: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 79,
      alert_level: 'YELLOW',
      season: 'Winter 2025',
      fraud_alerts: [{ type: 'seasonal', reason: 'Mulethi unusual for this season' }],
    },
    // ─── FRAUD-FLAGGED BATCHES ──────────────────────────────
    {
      id: 107,
      herb_name: 'Guduchi',
      collector_name: 'Vikram Yadav',
      weight_kg: 35.0,
      gps_lat: 26.9124,
      gps_lng: 75.7873,
      gps_place_name: 'Jaipur, Rajasthan',
      ai_confidence: 32,
      time_of_collection: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 28,
      alert_level: 'RED',
      season: 'Summer 2025',
      fraud_alerts: [
        { type: 'weight', reason: 'Unusually heavy batch (35 kg) — exceeds typical range' },
        { type: 'score', reason: 'Critically low AI confidence (32%)' },
        { type: 'location', reason: 'Guduchi rare in arid Rajasthan zone' },
      ],
    },
    {
      id: 108,
      herb_name: 'Sarpagandha',
      collector_name: 'Kiran Das',
      weight_kg: 4.1,
      gps_lat: 22.5726,
      gps_lng: 88.3639,
      gps_place_name: 'Kolkata, West Bengal',
      ai_confidence: 58,
      time_of_collection: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 45,
      alert_level: 'RED',
      season: 'Spring 2025',
      fraud_alerts: [
        { type: 'seasonal', reason: 'Sarpagandha harvested outside monsoon — quality suspect' },
        { type: 'score', reason: 'Low AI confidence (58%) — possible misidentification' },
      ],
    },
    {
      id: 109,
      herb_name: 'Haritaki',
      collector_name: 'Renu Singh',
      weight_kg: 18.5,
      gps_lat: 25.4358,
      gps_lng: 81.8463,
      gps_place_name: 'Prayagraj, UP',
      ai_confidence: 73,
      time_of_collection: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      trust_score: 62,
      alert_level: 'YELLOW',
      season: 'Winter 2025',
      fraud_alerts: [
        { type: 'weight', reason: 'Weight higher than reported average for region' },
      ],
    },
  ]);
  const [verifiedBatches, setVerifiedBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/batches/pending');
      if (res.data.success) {
        // Merge hardcoded with backend data if any
        setPendingBatches(prev => {
          const backendIds = res.data.data.map(b => b.id);
          const filteredPrev = prev.filter(b => !backendIds.includes(b.id));
          return [...filteredPrev, ...res.data.data];
        });
      }
    } catch (err) {
      console.error('Failed to fetch pending batches', err);
    }
  }, []);

  const fetchVerified = useCallback(async () => {
    try {
      const res = await api.get('/batches/lab-verified');
      if (res.data.success) setVerifiedBatches(res.data.data);
    } catch (err) {
      console.error('Failed to fetch verified batches', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/manufacturer/products');
      if (res.data.success) setProducts(res.data.data);
    } catch (err) {
      // Fail silently
    }
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn && auth.role) {
      // Fetch only role-relevant data to avoid 403 errors
      if (auth.role === 'lab') {
        fetchPending();
        fetchVerified();
      } else if (auth.role === 'manufacturer') {
        fetchVerified();
        fetchProducts();
      }
    }
  }, [auth.isLoggedIn, auth.role, fetchPending, fetchVerified, fetchProducts]);

  // ── Actions ────────────────────────────────────────────────
  const signup = useCallback(async (signupData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', signupData);
      const data = res.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.name);
      
      setAuth({ isLoggedIn: true, role: data.role, username: data.name });
      return { success: true, role: data.role };
    } catch (err) {
      console.error('Signup failed', err);
      let message = 'Signup failed';
      if (err.response?.data?.detail) {
        message = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      }
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (selectedRole, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      
      // Use the portal role the user selected (if provided), otherwise
      // fall back to the role stored in the database.  This lets the same
      // account access both the Lab and Manufacturer portals.
      const effectiveRole = selectedRole || data.role;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', effectiveRole);
      localStorage.setItem('username', data.name);
      
      setAuth({ isLoggedIn: true, role: effectiveRole, username: data.name });
      return { success: true, role: effectiveRole };
    } catch (err) {
      console.error('Login failed — falling back to demo mode', err);
      
      // ── Demo/local fallback: use the role the user selected ──
      const demoRole = selectedRole || 'lab';
      const demoName = email ? email.split('@')[0] : 'Demo User';
      
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('role', demoRole);
      localStorage.setItem('username', demoName);
      
      setAuth({ isLoggedIn: true, role: demoRole, username: demoName });
      return { success: true, role: demoRole };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setAuth({ isLoggedIn: false, role: null, username: '' });
  }, []);

  const submitLabReport = useCallback(async (batchId, reportData) => {
    try {
      const res = await api.post(`/submit-lab-report/${batchId}`, {
        ...reportData,
        tested_by: auth.username || 'Lab Tech'
      });
      if (res.data.success) {
        fetchPending();
        fetchVerified();
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to submit lab report', err);
      
      // Local fallback for ALL hardcoded batches (any ID in the mock list)
      const batch = pendingBatches.find(b => b.id === batchId);
      if (batch) {
        const weightMatch = Math.abs(batch.weight_kg - reportData.weight_verified_kg) <= 0.5;
        const labReport = {
          ...reportData,
          time_tested: new Date().toISOString(),
          tested_by: auth.username || 'Lab Tech',
          weight_match: weightMatch,
        };
        const verifiedBatch = {
          ...batch,
          status: 'lab_verified',
          tx_hash: batch.tx_hash || ('0x' + Math.random().toString(16).slice(2, 18)),
          lab_report: labReport,
        };
        setPendingBatches(prev => prev.filter(b => b.id !== batchId));
        setVerifiedBatches(prev => [verifiedBatch, ...prev]);
        // Return shape matching the backend response
        return {
          weight_match: weightMatch,
          weight_difference: Math.abs(batch.weight_kg - reportData.weight_verified_kg).toFixed(3),
          report_hash: 'local-' + batchId,
          // extra fields for success modal display
          herb_name: batch.herb_name,
          gps_place_name: batch.gps_place_name,
          trust_score: batch.trust_score,
          season: batch.season || 'Spring 2025',
          purity_percentage: reportData.purity_percentage,
          overall_status: reportData.overall_status,
        };
      }
      return null;
    }
  }, [auth.username, fetchPending, fetchVerified, pendingBatches]);

  const createProduct = useCallback(async (productData, selectedBatchIds) => {
    try {
      const res = await api.post('/create-product', {
        ...productData,
        batch_ids: selectedBatchIds,
        expiry_date: new Date(productData.expiry_date).toISOString()
      });
      if (res.data.success) {
        fetchVerified();
        fetchProducts();
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to create product', err);
      
      // Local fallback — works for any batch currently in verifiedBatches state
      const ingredients = verifiedBatches.filter(b => selectedBatchIds.includes(b.id));
      if (ingredients.length > 0) {
        const trustScore = calculateTrustScore(ingredients);
        const newProduct = {
          id: Math.floor(Math.random() * 1000) + 1000,
          product_name: productData.product_name,
          product_hash: '0x' + Math.random().toString(16).slice(2, 18),
          trust_score: trustScore,
          manufacturing_date: new Date().toISOString(),
          expiry_date: productData.expiry_date,
          total_input_weight: ingredients.reduce((sum, b) => sum + (b.lab_report?.weight_verified_kg || b.weight_kg), 0),
          output_units: productData.output_units,
          ingredients: ingredients
        };
        setProducts(prev => [newProduct, ...prev]);
        setVerifiedBatches(prev => prev.filter(b => !selectedBatchIds.includes(b.id)));
        return newProduct;
      }
      return null;
    }
  }, [fetchVerified, fetchProducts, verifiedBatches]);

  const getProduct = useCallback(async (productId) => {
    try {
      const res = await api.get(`/product/${productId}`);
      return res.data.success ? res.data.data : null;
    } catch (err) {
      return null;
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        auth,
        signup,
        login,
        logout,
        pendingBatches,
        verifiedBatches,
        products,
        submitLabReport,
        createProduct,
        getProduct,
        calculateTrustScore,
        loading
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useMockData must be used within DataProvider');
  return context;
}
