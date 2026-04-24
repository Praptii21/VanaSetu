import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, AlertTriangle, MapPin, Clock, Scale, TestTube2, Hash } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function ConsumerScan() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/product/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      } else {
        setError(res.data.error || 'Product not found');
      }
    } catch (err) {
      setError('Failed to fetch product data. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCode) {
      navigate(`/product/${inputCode}`);
    }
  };

  if (!productId && !product && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full">
          <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verify Your Product</h2>
          <p className="text-gray-500 mb-6">Enter the product batch ID to see its complete journey from forest to shelf.</p>
          <form onSubmit={handleSearch} className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. 1" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-xl font-medium"
            />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors">
              Trace Product
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20 text-lg font-medium text-gray-500">Retrieving Blockchain Records...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-md mb-8 border border-green-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield className="h-32 w-32 text-green-600" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">🌿 {product.product_name}</h1>
            <div className="text-sm text-gray-500 space-y-1 mt-2">
              <p>Manufactured: {new Date(product.manufacturing_date).toLocaleDateString()}</p>
              <p>Expiry: {new Date(product.expiry_date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-center bg-green-50 p-4 rounded-xl border border-green-200">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Trust Score</span>
            <div className="flex items-center">
              <span className="text-4xl font-black text-green-600">{product.trust_score}</span>
              <span className="text-xl text-green-500">/100</span>
            </div>
            {product.trust_score > 80 && <span className="mt-1 flex items-center text-xs text-green-600 font-medium"><CheckCircle className="h-3 w-3 mr-1" /> Verified Premium</span>}
          </div>
        </div>
      </motion.div>

      <h3 className="text-xl font-bold text-gray-800 mb-4 pl-2 border-l-4 border-green-500">Ingredients Journey</h3>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
        {product.ingredients.map((ingredient, idx) => (
          <motion.div 
            key={ingredient.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {idx + 1}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-bold text-gray-900">{ingredient.herb_name}</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono" title="Batch Hash">
                  {ingredient.tx_hash.substring(0,8)}...
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{ingredient.gps_place_name || `${ingredient.gps_lat.toFixed(4)}, ${ingredient.gps_lng.toFixed(4)}`}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-orange-500" />
                  <span>{new Date(ingredient.time_of_collection).toLocaleString()}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center text-gray-700 font-medium">
                      <Scale className="h-4 w-4 mr-2 text-purple-500" /> Weight
                    </div>
                    <div className="text-xs">
                      Claimed: {ingredient.weight_kg}kg <ArrowRight className="inline h-3 w-3 mx-1 text-gray-400" /> 
                      <span className={ingredient.lab_report?.weight_match ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        Lab: {ingredient.lab_report?.weight_verified_kg}kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">Lab Purity</span>
                    <span className="font-bold text-gray-900">{ingredient.lab_report?.purity_percentage}% (pH: {ingredient.lab_report?.ph_level})</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">Safety Tests</span>
                    <span className="font-bold text-green-600 flex items-center">
                      HM: Pass <CheckCircle className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="mt-12 bg-gray-900 text-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Factory className="mr-2" /> Manufacturing Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Total Input</p>
            <p className="font-bold text-lg">{product.total_input_weight} kg</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Output</p>
            <p className="font-bold text-lg">{product.output_units} units</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 mb-1">Product Hash</p>
            <p className="font-mono text-green-400 bg-gray-800 p-2 rounded truncate text-xs">
              {product.product_hash}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
)
