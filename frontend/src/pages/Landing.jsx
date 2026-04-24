import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, Factory, ArrowRight, Leaf, ShieldCheck, Truck, QrCode } from 'lucide-react';

// ── Decorative Leaf SVG ──────────────────────────────────
function LeafSVG({ className }) {
  return (
    <svg viewBox="0 0 80 120" fill="currentColor" className={className}>
      <path d="M40 0 C50 20 72 35 78 55 C80 62 76 72 68 80 C58 90 48 95 40 120 C32 95 22 90 12 80 C4 72 0 62 2 55 C8 35 30 20 40 0Z" />
      <path d="M40 20 L40 110" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M40 40 L28 32" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M40 55 L55 45" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M40 70 L25 62" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M40 85 L53 77" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2" />
    </svg>
  );
}

// ── Step Card ────────────────────────────────────────────
function StepCard({ icon: Icon, title, description, step, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center group"
    >
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-botanical-100 flex items-center justify-center group-hover:bg-botanical-200 transition-colors duration-300">
          <Icon className="h-7 w-7 text-botanical-700" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-botanical-700 text-white text-xs font-bold font-body flex items-center justify-center shadow-md">
          {step}
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="font-body text-sm text-gray-500 leading-relaxed max-w-[200px]">{description}</p>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ── Floating Leaf Decorations ────────────── */}
      <LeafSVG className="absolute top-20 left-[8%] w-12 h-18 text-botanical-300/20 animate-float-slow pointer-events-none" />
      <LeafSVG className="absolute top-40 right-[10%] w-16 h-24 text-botanical-400/15 animate-float-medium pointer-events-none rotate-[25deg]" />
      <LeafSVG className="absolute bottom-32 left-[15%] w-10 h-15 text-botanical-300/15 animate-float-fast pointer-events-none rotate-[-15deg]" />
      <LeafSVG className="absolute bottom-20 right-[20%] w-14 h-21 text-botanical-200/20 animate-float-slow pointer-events-none rotate-[40deg]" />
      <LeafSVG className="absolute top-[60%] left-[5%] w-8 h-12 text-botanical-300/10 animate-float-medium pointer-events-none rotate-[-30deg]" />

      {/* ── Top Bar ─────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="bg-botanical-700 p-2 rounded-xl">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-botanical-800">VanaSetu</span>
        </div>
      </div>

      {/* ── Hero Section ────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Decorative leaf icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-botanical-100 mb-8"
          >
            <Leaf className="h-10 w-10 text-botanical-600 animate-pulse-soft" />
          </motion.div>

          <h1 className="font-display text-6xl sm:text-7xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.1]">
            Vana<span className="text-botanical-700">Setu</span>
          </h1>

          <p className="font-display text-xl sm:text-2xl text-gray-500 italic mb-3">
            वनसेतु — The Bridge from Forest to Wellness
          </p>

          <p className="font-body text-base text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Blockchain-powered traceability for India's Ayurvedic supply chain.
            Every herb tracked, tested, and verified — from wild collector to your medicine cabinet.
          </p>
        </motion.div>

        {/* ── How It Works ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl mx-auto mb-16"
        >
          <div className="leaf-divider">
            <span className="font-body text-xs font-semibold text-botanical-400 uppercase tracking-[0.15em]">
              🌿 How It Works
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <StepCard
              icon={Leaf}
              title="Collect"
              description="Wild collectors photograph & weigh herbs using the mobile app"
              step={1}
              delay={0.5}
            />
            <StepCard
              icon={FlaskConical}
              title="Lab Test"
              description="pH, purity, heavy metals, contamination tested & weight re-verified"
              step={2}
              delay={0.6}
            />
            <StepCard
              icon={Factory}
              title="Manufacture"
              description="Verified batches combined into products with trust scores"
              step={3}
              delay={0.7}
            />
            <StepCard
              icon={QrCode}
              title="Trace"
              description="Consumers scan QR to see the complete journey of every herb"
              step={4}
              delay={0.8}
            />
          </div>
        </motion.div>

        {/* ── Role Selection Cards ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="w-full max-w-3xl mx-auto"
        >
          <div className="leaf-divider">
            <span className="font-body text-xs font-semibold text-botanical-400 uppercase tracking-[0.15em]">
              Select Your Role
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Lab Researcher Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login/lab')}
              className="botanical-card group relative p-8 text-left overflow-hidden"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-botanical-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-botanical-100 transition-colors duration-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-botanical-100 flex items-center justify-center mb-5 group-hover:bg-botanical-200 transition-colors duration-300">
                  <FlaskConical className="h-7 w-7 text-botanical-700" />
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  Lab Researcher
                </h2>
                <p className="font-body text-sm text-gray-500 mb-6 leading-relaxed">
                  Verify incoming herbal batches. Test pH, purity, heavy metals, and contamination levels. Re-weigh for fraud detection.
                </p>
                <div className="flex items-center font-body text-sm font-semibold text-botanical-600 group-hover:text-botanical-700">
                  Access Lab Portal
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </motion.button>

            {/* Manufacturer Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login/manufacturer')}
              className="botanical-card group relative p-8 text-left overflow-hidden"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sage-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-sage-100 transition-colors duration-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center mb-5 group-hover:bg-sage-200 transition-colors duration-300">
                  <Factory className="h-7 w-7 text-botanical-700" />
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  Manufacturer
                </h2>
                <p className="font-body text-sm text-gray-500 mb-6 leading-relaxed">
                  Combine verified batches into products. Generate trust scores and QR codes for complete supply chain transparency.
                </p>
                <div className="flex items-center font-body text-sm font-semibold text-botanical-600 group-hover:text-botanical-700">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Footer ────────────────────────────── */}
        <div className="mt-16 mb-8 text-center">
          <p className="font-body text-xs text-gray-400">
            Built with 🌿 for transparent Ayurvedic supply chains
          </p>
          <p className="font-body text-xs text-gray-300 mt-1">
            SHA-256 hashing · AI herb classification · GPS tracking · QR provenance
          </p>
        </div>
      </div>
    </div>
  );
}
