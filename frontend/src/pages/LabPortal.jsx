import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function LabPortal() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/batches/pending`);
      if (res.data.success) {
        setBatches(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div>
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Beaker className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Lab Tech Portal</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Herb Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claimed Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : batches.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No pending batches</td></tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.herb_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.collector_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.weight_kg} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(batch.time_of_collection).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedBatch(batch)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md transition-colors"
                      >
                        Test This
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedBatch && (
          <LabModal 
            batch={selectedBatch} 
            onClose={() => setSelectedBatch(null)} 
            onSuccess={() => {
              setSelectedBatch(null);
              fetchBatches();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LabModal({ batch, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ph_level: 7.0,
    purity_percentage: 95.0,
    heavy_metals_pass: true,
    contamination_pass: true,
    weight_verified_kg: batch.weight_kg,
    overall_status: 'pass'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/submit-lab-report/${batch.id}`, formData);
      if (res.data.success) {
        onSuccess();
      } else {
        alert("Error: " + res.data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">Test Batch #{batch.id} - {batch.herb_name}</h2>
        <div className="bg-gray-50 p-3 rounded-lg mb-6 text-sm text-gray-600">
          <p><strong>Claimed Weight:</strong> {batch.weight_kg} kg</p>
          <p><strong>Collector:</strong> {batch.collector_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Verified Weight (kg)</label>
            <input 
              type="number" step="0.1" required
              value={formData.weight_verified_kg}
              onChange={e => setFormData({...formData, weight_verified_kg: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">pH Level</label>
              <input 
                type="number" step="0.1" required
                value={formData.ph_level}
                onChange={e => setFormData({...formData, ph_level: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purity (%)</label>
              <input 
                type="number" step="0.1" required
                value={formData.purity_percentage}
                onChange={e => setFormData({...formData, purity_percentage: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Heavy Metals Pass</span>
            <input 
              type="checkbox" 
              checked={formData.heavy_metals_pass}
              onChange={e => setFormData({...formData, heavy_metals_pass: e.target.checked})}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Contamination Pass</span>
            <input 
              type="checkbox" 
              checked={formData.contamination_pass}
              onChange={e => setFormData({...formData, contamination_pass: e.target.checked})}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Overall Status</label>
            <select 
              value={formData.overall_status}
              onChange={e => setFormData({...formData, overall_status: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>

          <div className="flex space-x-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex justify-center items-center">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
