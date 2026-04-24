import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, Factory, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-6">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Traceability Platform for India's <span className="text-green-600">Ayurvedic Supply Chain</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Secure, transparent, and blockchain-verified. From the wild collector in the forest to the final product in your hands.
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/lab-portal')}
            className="group relative flex flex-col items-center p-8 bg-white border-2 border-transparent hover:border-green-500 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
              <FlaskConical className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login as Lab Tech</h2>
            <p className="text-gray-500 mb-6">Verify incoming herbal batches, record pH, purity, and safety tests.</p>
            <div className="flex items-center text-blue-600 font-semibold mt-auto">
              Access Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/manufacturer')}
            className="group relative flex flex-col items-center p-8 bg-white border-2 border-transparent hover:border-green-500 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="bg-purple-50 p-4 rounded-full mb-4 group-hover:bg-purple-100 transition-colors">
              <Factory className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login as Manufacturer</h2>
            <p className="text-gray-500 mb-6">Combine verified batches, generate products, and issue QR codes.</p>
            <div className="flex items-center text-purple-600 font-semibold mt-auto">
              Access Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
