import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, X, AlertTriangle, CheckCircle, Scale, MapPin } from 'lucide-react';
import { useMockData } from '../context/MockDataContext';

// ── Toggle Switch Component ──────────────────────────────
function ToggleSwitch({ checked, onChange, labelPass = 'Pass', labelFail = 'Fail' }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`font-body text-sm font-medium transition-colors ${!checked ? 'text-red-500' : 'text-gray-300'}`}>
        {labelFail}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="toggle-switch"
        data-checked={String(checked)}
        aria-label={checked ? labelPass : labelFail}
      >
        <span className="toggle-knob" />
      </button>
      <span className={`font-body text-sm font-medium transition-colors ${checked ? 'text-botanical-600' : 'text-gray-300'}`}>
        {labelPass}
      </span>
    </div>
  );
}

export default function LabPortal() {
  const { pendingBatches, submitLabReport } = useMockData();
  const [selectedBatch, setSelectedBatch] = useState(null);

  return (
    <div>
      {/* ── Header ────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-botanical-100 flex items-center justify-center">
            <FlaskConical className="h-6 w-6 text-botanical-700" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Lab Portal</h1>
            <p className="font-body text-sm text-gray-400">Verify incoming herbal batches</p>
          </div>
        </div>
        <div className="badge-pending text-sm">
          {pendingBatches.length} pending
        </div>
      </div>

      {/* ── Incoming Batches Table ─────────────── */}
      <div className="botanical-card overflow-hidden">
        <div className="px-6 py-4 border-b border-botanical-50">
          <h2 className="font-display text-xl font-bold text-gray-800">Incoming Batch Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="botanical-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Herb</th>
                <th>Collector</th>
                <th>Weight</th>
                <th>Score</th>
                <th>Location</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingBatches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 font-body">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-lg font-medium text-gray-300">All caught up!</p>
                    <p className="text-sm">No pending batches to test</p>
                  </td>
                </tr>
              ) : (
                pendingBatches.map((batch, idx) => {
                  const alertColors = {
                    GREEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    YELLOW: 'bg-amber-50 text-amber-700 border-amber-200',
                    RED: 'bg-red-50 text-red-700 border-red-200',
                  };
                  const alertDot = {
                    GREEN: 'bg-emerald-500',
                    YELLOW: 'bg-amber-500',
                    RED: 'bg-red-500',
                  };
                  const fraudTagColors = {
                    weight: 'bg-orange-100 text-orange-700',
                    score: 'bg-purple-100 text-purple-700',
                    location: 'bg-blue-100 text-blue-700',
                    
                  };
                  const fraudAlerts = batch.fraud_alerts || [];
                  const level = batch.alert_level || 'GREEN';

                  return (
                    <motion.tr
                      key={batch.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={level === 'RED' ? 'bg-red-50/40' : ''}
                    >
                      <td className="font-semibold text-gray-900 font-body">#{batch.id}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${alertDot[level]}`} />
                          <span className="font-medium text-gray-800">{batch.herb_name}</span>
                        </span>
                      </td>
                      <td className="text-gray-600">{batch.collector_name}</td>
                      <td className="text-gray-800 font-medium">{batch.weight_kg} kg</td>
                      <td>
                        <span className={`font-bold text-sm ${
                          batch.trust_score >= 80 ? 'text-emerald-600'
                          : batch.trust_score >= 60 ? 'text-amber-600'
                          : 'text-red-600'
                        }`}>
                          {batch.trust_score}%
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <MapPin className="h-3 w-3" />
                          {batch.gps_place_name}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1.5">
                          {/* Alert level badge */}
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${alertColors[level]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${alertDot[level]}`} />
                            {level}
                          </span>
                          {/* Fraud reason tags */}
                          {fraudAlerts.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {fraudAlerts.map((alert, i) => (
                                <span
                                  key={i}
                                  title={alert.reason}
                                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full cursor-default ${fraudTagColors[alert.type] || 'bg-gray-100 text-gray-600'}`}
                                >
                                  {alert.type === 'weight' && '⚖️ Weight'}
                                  {alert.type === 'score' && '📉 Score'}
                                  {alert.type === 'location' && '📍 Location'}
                                  
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedBatch(batch)}
                          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                        >
                          <FlaskConical className="h-3.5 w-3.5" />
                          Test
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

      {/* ── Lab Report Modal ──────────────────── */}
      <AnimatePresence>
        {selectedBatch && (
          <LabReportModal
            batch={selectedBatch}
            onClose={() => setSelectedBatch(null)}
            onSubmit={submitLabReport}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Lab Report Modal Component ───────────────────────────
function LabReportModal({ batch, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    ph_level: parseFloat((6.5 + Math.random() * 1.5).toFixed(1)),
    purity_percentage: parseFloat((90 + Math.random() * 8).toFixed(1)),
    heavy_metals_pass: true,
    contamination_pass: true,
    weight_verified_kg: batch.weight_kg,
    overall_status: 'pass',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const weightDiff = Math.abs(batch.weight_kg - formData.weight_verified_kg);
  // Backend considers > 0.5kg as a mismatch
  const hasWeightMismatch = weightDiff > 0.5;

  // Auto-fail the batch if weight is mismatched, tests fail, or it came with a RED alert
  useEffect(() => {
    const shouldFail = 
      hasWeightMismatch || 
      !formData.heavy_metals_pass || 
      !formData.contamination_pass || 
      batch.alert_level === 'RED';
      
    setFormData(prev => ({
      ...prev,
      overall_status: shouldFail ? 'fail' : 'pass'
    }));
  }, [hasWeightMismatch, formData.heavy_metals_pass, formData.contamination_pass, batch.alert_level]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await onSubmit(batch.id, formData);
    setResult(res);
    setSubmitting(false);
  };

  // Success view
  if (result) {
    const statusColor = result.overall_status === 'pass' || formData.overall_status === 'pass'
      ? 'text-botanical-600 bg-botanical-50'
      : 'text-red-600 bg-red-50';
    const overallLabel = (result.overall_status || formData.overall_status) === 'pass' ? '✅ Pass' : '❌ Fail';

    return (
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card p-8 w-full max-w-md"
        >
          {/* Icon + Title */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="h-14 w-14 text-botanical-500 mx-auto mb-3" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Report Submitted!</h2>
            <p className="font-body text-sm text-gray-400 mt-1">
              Batch #{batch.id} — {batch.herb_name}
            </p>
          </div>

          {/* Result Summary Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Overall Status */}
            <div className={`rounded-xl p-3 text-center font-body text-sm font-semibold col-span-2 ${statusColor}`}>
              Overall Status: {overallLabel}
            </div>

            {/* Score */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-0.5">Trust Score</span>
              <span className="font-bold text-gray-800">{result.trust_score ?? batch.trust_score ?? '—'}%</span>
            </div>

            {/* Purity */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-0.5">Purity</span>
              <span className="font-bold text-gray-800">{result.purity_percentage ?? formData.purity_percentage}%</span>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-0.5">Location</span>
              <span className="font-semibold text-gray-800 text-xs">{result.gps_place_name ?? batch.gps_place_name ?? '—'}</span>
            </div>

            
          </div>

          {/* Weight mismatch alert (snake_case from API/fallback) */}
          {!result.weight_match && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl text-sm font-body font-medium mb-4">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              Weight mismatch — difference of {result.weight_difference ?? '?'} kg
            </div>
          )}

          <button onClick={onClose} className="btn-secondary w-full text-sm">
            Close
          </button>
        </motion.div>
      </div>
    );
  }

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
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Batch #{batch.id} — {batch.herb_name}
            </h2>
            <p className="font-body text-sm text-gray-400 mt-0.5">Submit lab test results</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Batch Info */}
        <div className="bg-botanical-50 rounded-xl p-4 mb-6 border border-botanical-100">
          <div className="grid grid-cols-2 gap-3 font-body text-sm">
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wider">Collector</span>
              <p className="font-semibold text-gray-800">{batch.collector_name}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wider">Claimed Weight</span>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-botanical-500" />
                {batch.weight_kg} kg
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wider">AI Confidence</span>
              <p className="font-semibold text-botanical-600">{batch.ai_confidence}%</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wider">Location</span>
              <p className="font-semibold text-gray-800 text-xs">{batch.gps_place_name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Weight Verified */}
          <div>
            <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
              Weight Verified (kg)
              <span className="text-xs text-gray-400 ml-2">← lab reweighs the herbs</span>
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.weight_verified_kg}
              onChange={(e) =>
                setFormData({ ...formData, weight_verified_kg: parseFloat(e.target.value) })
              }
              className="input-botanical"
            />
            {hasWeightMismatch && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs font-body font-medium"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Weight differs by {weightDiff.toFixed(1)} kg from collector's claim
              </motion.div>
            )}
          </div>

          {/* pH + Purity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                pH Level
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.ph_level}
                onChange={(e) =>
                  setFormData({ ...formData, ph_level: parseFloat(e.target.value) })
                }
                className="input-botanical"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Purity (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.purity_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, purity_percentage: parseFloat(e.target.value) })
                }
                className="input-botanical"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-body text-sm font-medium text-gray-700">Heavy Metals</span>
              <ToggleSwitch
                checked={formData.heavy_metals_pass}
                onChange={(val) => setFormData({ ...formData, heavy_metals_pass: val })}
              />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-body text-sm font-medium text-gray-700">Contamination</span>
              <ToggleSwitch
                checked={formData.contamination_pass}
                onChange={(val) => setFormData({ ...formData, contamination_pass: val })}
              />
            </div>
          </div>

          {/* Overall Status */}
          <div>
            <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
              Overall Status
            </label>
            <select
              value={formData.overall_status}
              onChange={(e) => setFormData({ ...formData, overall_status: e.target.value })}
              className="input-botanical"
            >
              <option value="pass">✅ Pass</option>
              <option value="fail">❌ Fail</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Lab Report
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
