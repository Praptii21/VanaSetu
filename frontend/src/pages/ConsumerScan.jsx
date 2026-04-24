import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Scale,
  Leaf,
  Factory,
  ArrowRight,
  Hash,
  AlertTriangle,
  FileText,
  Download,
} from 'lucide-react';
import { useMockData } from '../context/MockDataContext';
import { generatePDF } from '../utils/pdfGenerator';

export default function ConsumerScan() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProduct } = useMockData();
  const [product, setProduct] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        setLoading(true);
        const found = await getProduct(productId);
        if (found) {
          setProduct(found);
          setError('');
        } else {
          setError('Product not found. Please check the ID and try again.');
          setProduct(null);
        }
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, getProduct]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      navigate(`/product/${inputCode.trim()}`);
    }
  };

  // ── Search View ──
  if (!productId && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-botanical-100 flex items-center justify-center mx-auto mb-5">
            <Shield className="h-8 w-8 text-botanical-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Verify Your Product</h2>
          <p className="font-body text-sm text-gray-500 mb-6">
            Enter the product ID to see its complete journey from forest to shelf.
          </p>
          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Product ID (e.g. 001)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="input-botanical text-center text-xl font-body font-medium"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full py-3">
              <div className="flex items-center justify-center gap-2">
                <Leaf className="h-4 w-4" />
                Trace Product
              </div>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Not Found</h2>
          <p className="font-body text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // ── Product View ──
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* ── Product Header ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="botanical-card p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
            <Shield className="h-40 w-40 text-botanical-600" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-gray-900 mb-1">
                🌿 {product.product_name}
              </h1>
              <div className="font-body text-sm text-gray-500 space-y-0.5 mt-2">
                <p>Manufactured: {new Date(product.manufacturing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p>Expiry: {new Date(product.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex flex-col items-center bg-botanical-50 p-5 rounded-2xl border border-botanical-100">
              <span className="font-body text-xs font-bold text-botanical-600 uppercase tracking-widest mb-1">
                Trust Score
              </span>
              <div className="flex items-baseline">
                <span className="font-display text-5xl font-bold text-botanical-700">
                  {product.trust_score}
                </span>
                <span className="font-body text-lg text-botanical-400 ml-1">/100</span>
              </div>
              {product.trust_score >= 80 && (
                <span className="mt-1.5 flex items-center text-xs text-botanical-600 font-body font-medium gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified Premium
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Ingredients Journey ─────────────── */}
        <div className="leaf-divider">
          <span className="font-body text-xs font-semibold text-botanical-400 uppercase tracking-[0.15em]">
            🌿 Ingredients Journey
          </span>
        </div>

        <div className="space-y-6 mt-6">
          {product.ingredients.map((ingredient, idx) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="botanical-card p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-botanical-100 flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-botanical-700">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold text-gray-900">{ingredient.herb_name}</h4>
                    <span className="font-body text-xs text-gray-400">Batch #{ingredient.id}</span>
                  </div>
                </div>
                <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg" title="Batch Hash">
                  {ingredient.tx_hash.substring(0, 10)}...
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-body text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-botanical-400 shrink-0" />
                  <span>{ingredient.gps_place_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-botanical-400 shrink-0" />
                  <span>{new Date(ingredient.time_of_collection).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true,
                  })}</span>
                </div>
              </div>

              {/* Weight Comparison */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <Scale className="h-4 w-4 text-botanical-500" />
                <span className="font-body text-sm text-gray-700">
                  Collected: <span className="font-semibold">{ingredient.weight_kg} kg</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                <span className={`font-body text-sm font-semibold ${
                  ingredient.lab_report?.weight_match ? 'text-botanical-600' : 'text-amber-600'
                }`}>
                  Lab: {ingredient.lab_report?.weight_verified_kg} kg
                </span>
                {!ingredient.lab_report?.weight_match && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>

              {/* Lab Results Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-botanical-50 rounded-lg p-2.5 text-center">
                  <p className="font-body text-xs text-gray-400 mb-0.5">Purity</p>
                  <p className="font-body text-sm font-bold text-botanical-700">{ingredient.lab_report?.purity_percentage}%</p>
                </div>
                <div className="bg-botanical-50 rounded-lg p-2.5 text-center">
                  <p className="font-body text-xs text-gray-400 mb-0.5">pH</p>
                  <p className="font-body text-sm font-bold text-botanical-700">{ingredient.lab_report?.ph_level}</p>
                </div>
                <div className="bg-botanical-50 rounded-lg p-2.5 text-center">
                  <p className="font-body text-xs text-gray-400 mb-0.5">Heavy Metals</p>
                  <p className={`font-body text-sm font-bold ${ingredient.lab_report?.heavy_metals_pass ? 'text-botanical-600' : 'text-red-500'}`}>
                    {ingredient.lab_report?.heavy_metals_pass ? '✅ Pass' : '❌ Fail'}
                  </p>
                </div>
                <div className="bg-botanical-50 rounded-lg p-2.5 text-center">
                  <p className="font-body text-xs text-gray-400 mb-0.5">Contamination</p>
                  <p className={`font-body text-sm font-bold ${ingredient.lab_report?.contamination_pass ? 'text-botanical-600' : 'text-red-500'}`}>
                    {ingredient.lab_report?.contamination_pass ? '✅ Pass' : '❌ Fail'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Manufacturing Summary ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-botanical-800 text-white rounded-2xl p-6 shadow-xl"
        >
          <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Manufacturing Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-body text-sm">
            <div>
              <p className="text-botanical-300 text-xs mb-1">Total Input</p>
              <p className="font-bold text-lg">{product.total_input_weight} kg</p>
            </div>
            <div>
              <p className="text-botanical-300 text-xs mb-1">Output</p>
              <p className="font-bold text-lg">{product.output_units} units</p>
            </div>
            <div className="col-span-2">
              <p className="text-botanical-300 text-xs mb-1">Product Hash</p>
              <p className="font-mono text-botanical-300 bg-botanical-900 p-2 rounded-lg truncate text-xs">
                {product.product_hash}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              const doc = generatePDF(product, product.qr_data);
              doc.save('VanaSetu-Report-' + product.product_name.replace(/\s+/g, '-') + '.pdf');
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Download PDF Report
          </button>
          <button
            onClick={() => navigate('/')}
            className="font-body text-sm text-gray-400 hover:text-botanical-600 transition-colors"
          >
            Back to VanaSetu
          </button>
        </div>
      </div>
    </div>
  );
}
