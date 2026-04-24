import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Factory,
  X,
  AlertTriangle,
  CheckCircle,
  Package,
  Download,
  ExternalLink,
  QrCode,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useMockData, calculateTrustScore } from '../context/MockDataContext';
import { generatePDF } from '../utils/pdfGenerator';

export default function ManufacturerDashboard() {
  const { verifiedBatches, createProduct } = useMockData();
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const toggleSelection = (id) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const selectedBatches = verifiedBatches.filter((b) => selectedBatchIds.includes(b.id));

  return (
    <div>
      {/* ── Header ────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-botanical-100 flex items-center justify-center">
            <Factory className="h-6 w-6 text-botanical-700" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Manufacturer Dashboard</h1>
            <p className="font-body text-sm text-gray-400">Select verified batches to create products</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={selectedBatchIds.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <Package className="h-4 w-4" />
          Create Product ({selectedBatchIds.length})
        </button>
      </div>

      {/* ── Verified Batches Table ─────────────── */}
      <div className="botanical-card overflow-hidden">
        <div className="px-6 py-4 border-b border-botanical-50">
          <h2 className="font-display text-xl font-bold text-gray-800">Lab Verified Batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="botanical-table">
            <thead>
              <tr>
                <th className="w-12"></th>
                <th>Batch</th>
                <th>Herb</th>
                <th>Collector</th>
                <th>Weight</th>
                <th>Purity</th>
                <th>pH</th>
                <th>Trust</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {verifiedBatches.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-400 font-body">
                    <Factory className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-lg font-medium text-gray-300">No verified batches</p>
                    <p className="text-sm">Batches will appear here after lab verification</p>
                  </td>
                </tr>
              ) : (
                verifiedBatches.map((batch, idx) => {
                  const isSelected = selectedBatchIds.includes(batch.id);
                  const batchTrust = calculateTrustScore([batch]);

                  return (
                    <motion.tr
                      key={batch.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => toggleSelection(batch.id)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected ? 'bg-botanical-50/80 ring-1 ring-inset ring-botanical-200' : ''
                      }`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4.5 w-4.5 text-botanical-600 rounded-md border-gray-300 focus:ring-botanical-500 cursor-pointer accent-botanical-600"
                        />
                      </td>
                      <td className="font-semibold text-gray-900 font-body">#{batch.id}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-botanical-400" />
                          <span className="font-medium text-gray-800">{batch.herb_name}</span>
                        </span>
                      </td>
                      <td className="text-gray-600">{batch.collector_name}</td>
                      <td>
                        <div className="font-medium text-gray-800">
                          {batch.lab_report?.weight_verified_kg} kg
                        </div>
                        {!batch.lab_report?.weight_match && (
                          <span className="text-xs text-amber-500 flex items-center gap-0.5">
                            <AlertTriangle className="h-3 w-3" />
                            was {batch.weight_kg} kg
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-semibold text-botanical-600">
                          {batch.lab_report?.purity_percentage}%
                        </span>
                      </td>
                      <td className="text-gray-600">{batch.lab_report?.ph_level}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-botanical-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-botanical-700 font-body">
                              {batchTrust}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(batch.id);
                          }}
                          className={`text-xs font-body font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                            isSelected
                              ? 'bg-botanical-600 text-white'
                              : 'bg-botanical-50 text-botanical-600 hover:bg-botanical-100'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Use'}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Product Modal ──────────────── */}
      <AnimatePresence>
        {showModal && (
          <CreateProductModal
            selectedBatches={selectedBatches}
            onClose={() => setShowModal(false)}
            onCreate={createProduct}
            onSuccess={() => {
              setShowModal(false);
              setSelectedBatchIds([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Create Product Modal ─────────────────────────────────
function CreateProductModal({ selectedBatches, onClose, onCreate, onSuccess }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split('T')[0];

  const [formData, setFormData] = useState({
    product_name: '',
    output_units: 500,
    expiry_date: oneYearLater,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const totalInputWeight = selectedBatches.reduce(
    (sum, b) => sum + (b.lab_report?.weight_verified_kg || b.weight_kg),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const product = await onCreate(formData, selectedBatches.map((b) => b.id));

    if (!product) {
      alert('Failed to create product. Please try again.');
      setSubmitting(false);
      return;
    }

    // QR encodes the consumer page URL — scanning opens the traceability view
    const consumerUrl = window.location.origin + '/product/' + product.id;

    const qrUrl = await QRCode.toDataURL(consumerUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1B5E20', light: '#FFFFFF' },
    });

    setQrDataUrl(qrUrl);
    setSuccessData(product);
    setSubmitting(false);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `VanaSetu-QR-${successData.product_name.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const downloadPDF = () => {
    if (!successData) return;
    const doc = generatePDF(successData, qrDataUrl);
    doc.save(`VanaSetu-Report-${successData.product_name.replace(/\s+/g, '-')}.pdf`);
  };

  // ── Success View ──
  if (successData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card p-8 w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          >
            <CheckCircle className="h-16 w-16 text-botanical-500 mx-auto mb-4" />
          </motion.div>

          <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Product Created!</h2>

          {/* Trust Score */}
          <div className="inline-flex items-center gap-2 bg-botanical-50 px-5 py-2.5 rounded-full mb-6 border border-botanical-100">
            <span className="font-body text-sm text-gray-500">Trust Score:</span>
            <span className="font-display text-2xl font-bold text-botanical-700">
              {successData.trust_score}
            </span>
            <span className="font-body text-sm text-gray-400">/100</span>
            {successData.trust_score >= 80 && (
              <span className="text-botanical-500 text-sm">🟢</span>
            )}
          </div>

          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="bg-white p-4 rounded-2xl shadow-botanical inline-block border border-botanical-50">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Product QR Code"
                  className="w-48 h-48 mx-auto"
                />
              )}
            </div>
            <p className="font-body text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <QrCode className="h-3 w-3" />
              Scan to see full traceability report
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={downloadQR} className="btn-primary flex flex-col items-center justify-center gap-1.5 py-3">
              <Download className="h-4 w-4" />
              <span className="text-xs">QR Code</span>
            </button>
            <button onClick={downloadPDF} className="btn-primary flex flex-col items-center justify-center gap-1.5 py-3 !bg-bark-700 hover:!bg-bark-800">
              <FileText className="h-4 w-4" />
              <span className="text-xs">PDF Report</span>
            </button>
            <button
              onClick={() => navigate(`/product/${successData.id}`)}
              className="btn-secondary flex flex-col items-center justify-center gap-1.5 py-3"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-xs">Consumer Page</span>
            </button>
          </div>

          <button
            onClick={onSuccess}
            className="mt-4 font-body text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Form View ──
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Create New Product</h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">Combine batches into a product</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AyurCalm Tablets"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="input-botanical"
              autoFocus
            />
          </div>

          {/* Selected Batches */}
          <div>
            <label className="block font-body text-sm font-medium text-gray-700 mb-2">
              Selected Batches
            </label>
            <div className="space-y-2">
              {selectedBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center gap-3 bg-botanical-50 rounded-xl px-4 py-3 border border-botanical-100"
                >
                  <CheckCircle className="h-4 w-4 text-botanical-500 shrink-0" />
                  <span className="font-body text-sm font-semibold text-gray-800">
                    #{batch.id} {batch.herb_name}
                  </span>
                  <span className="font-body text-xs text-gray-400">—</span>
                  <span className="font-body text-sm text-gray-600">
                    {batch.lab_report?.weight_verified_kg} kg
                  </span>
                  <span className="font-body text-xs text-gray-400">—</span>
                  <span className="font-body text-sm text-botanical-600 font-medium">
                    Purity {batch.lab_report?.purity_percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Weight (auto) */}
          <div className="bg-sage-50 rounded-xl p-4 border border-sage-100">
            <div className="flex items-center justify-between font-body text-sm">
              <span className="text-gray-500 font-medium">Total Input Weight</span>
              <span className="text-lg font-bold text-gray-900">
                {totalInputWeight.toFixed(1)} kg
              </span>
            </div>
            <p className="font-body text-xs text-gray-400 mt-0.5">Auto-calculated from selected batches</p>
          </div>

          {/* Output Units + Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Output Units
              </label>
              <input
                type="number"
                required
                value={formData.output_units}
                onChange={(e) =>
                  setFormData({ ...formData, output_units: parseInt(e.target.value) || 0 })
                }
                className="input-botanical"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Mfg. Date
              </label>
              <input
                type="date"
                value={today}
                readOnly
                className="input-botanical bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
              Expiry Date
            </label>
            <input
              type="date"
              required
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="input-botanical"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.product_name}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Create Product + Generate QR
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
