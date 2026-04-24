import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function ManufacturerDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/batches/lab-verified`);
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

  const toggleSelection = (id) => {
    if (selectedBatchIds.includes(id)) {
      setSelectedBatchIds(selectedBatchIds.filter(bId => bId !== id));
    } else {
      setSelectedBatchIds([...selectedBatchIds, id]);
    }
  };

  const selectedBatches = batches.filter(b => selectedBatchIds.includes(b.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Factory className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Manufacturer Dashboard</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          disabled={selectedBatchIds.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Product ({selectedBatchIds.length})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Herb Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : batches.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No lab verified batches</td></tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleSelection(batch.id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedBatchIds.includes(batch.id)}
                        onChange={() => {}} // handled by row click
                        className="h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{batch.herb_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batch.lab_report?.weight_verified_kg} kg
                      {!batch.lab_report?.weight_match && (
                        <AlertTriangle className="inline h-4 w-4 text-yellow-500 ml-2" title="Weight mismatch with collector claim" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.lab_report?.purity_percentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.lab_report?.ph_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreateProductModal 
            selectedBatches={selectedBatches} 
            onClose={() => setShowModal(false)} 
            onSuccess={() => {
              setShowModal(false);
              setSelectedBatchIds([]);
              fetchBatches();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateProductModal({ selectedBatches, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    product_name: '',
    output_units: 500,
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const totalInputWeight = selectedBatches.reduce((sum, b) => sum + (b.lab_report?.weight_verified_kg || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/create-product`, {
        ...formData,
        batch_ids: selectedBatches.map(b => b.id),
        expiry_date: new Date(formData.expiry_date).toISOString()
      });
      if (res.data.success) {
        setSuccessData(res.data.data);
      } else {
        alert("Error: " + res.data.error);
        setSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Submission failed");
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
        >
          <div className="text-green-500 mb-4 flex justify-center">
             <AlertTriangle className="h-16 w-16" /> {/* Replace with CheckCircle later if needed */}
          </div>
          <h2 className="text-2xl font-bold mb-2">Product Created!</h2>
          <p className="text-gray-600 mb-4">Trust Score: <span className="font-bold text-green-600">{successData.trust_score}/100</span></p>
          <img src={`data:image/png;base64,${successData.qr_code}`} alt="QR Code" className="mx-auto w-48 h-48 mb-6 border p-2 rounded" />
          <button onClick={onSuccess} className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700">
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">Create Product</h2>
        <div className="bg-purple-50 p-3 rounded-lg mb-6 text-sm text-purple-900">
          <p><strong>Selected Batches:</strong> {selectedBatches.length}</p>
          <p><strong>Total Input Weight:</strong> {totalInputWeight.toFixed(2)} kg</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input 
              type="text" required placeholder="e.g. AyurCalm Tablets"
              value={formData.product_name}
              onChange={e => setFormData({...formData, product_name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Output Units</label>
              <input 
                type="number" required
                value={formData.output_units}
                onChange={e => setFormData({...formData, output_units: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input 
                type="date" required
                value={formData.expiry_date}
                onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex justify-center items-center">
              {submitting ? 'Creating...' : 'Create & Generate QR'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
