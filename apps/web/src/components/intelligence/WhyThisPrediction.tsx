import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain } from "lucide-react";

interface WhyThisPredictionProps {
  reasoning: string;
}

export default function WhyThisPrediction({ reasoning }: WhyThisPredictionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="qc-card rounded-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-0 text-left"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-white">Why This Prediction?</span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-xs leading-relaxed mt-3 pt-3 border-t border-white/[0.06]">
              {reasoning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
