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
  const [pendingBatches, setPendingBatches] = useState([]);
  const [verifiedBatches, setVerifiedBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/batches/pending');
      if (res.data.success) setPendingBatches(res.data.data);
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
    if (auth.isLoggedIn) {
      fetchPending();
      fetchVerified();
      fetchProducts();
    }
  }, [auth.isLoggedIn, fetchPending, fetchVerified, fetchProducts]);

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
      return { success: true };
    } catch (err) {
      console.error('Signup failed', err);
      return { success: false, message: err.response?.data?.detail || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (role, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.name);
      
      setAuth({ isLoggedIn: true, role: data.role, username: data.name });
      return { success: true };
    } catch (err) {
      console.error('Login failed', err);
      return { success: false, message: err.response?.data?.detail || 'Login failed' };
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
      return null;
    }
  }, [auth.username, fetchPending, fetchVerified]);

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
      return null;
    }
  }, [fetchVerified, fetchProducts]);

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
