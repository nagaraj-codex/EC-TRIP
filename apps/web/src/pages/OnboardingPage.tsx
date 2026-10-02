import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../store/slices/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Find the right day.",
    description: "Discover when a park visit fits your plans.",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Spend less time waiting.",
    description: "Plan around park conditions before you arrive.",
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Make every visit count.",
    description: "Bring your park information, timing and plans together.",
    image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setOnboardingSeen } = useUIStore();
  const [current, setCurrent] = useState(0);

  const isLast = current === slides.length - 1;

  const handleComplete = () => {
    setOnboardingSeen();
    navigate("/login", { replace: true });
  };

  const handleNext = () => {
    if (isLast) handleComplete();
    else setCurrent((p) => p + 1);
  };

  const slide = slides[current];

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-white">
      {/* ── Desktop: side-by-side ── */}
      <div className="hidden md:flex w-full h-full">
        {/* Left: Image panel */}
        <div className="relative w-[58%] h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={slide.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            />
          </AnimatePresence>
          {/* Bottom gradient for visual polish */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
        </div>

        {/* Right: Content panel */}
        <div className="w-[42%] flex flex-col justify-between p-16 bg-white">
          {/* Top: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-qc-blue-500 to-qc-blue-700 flex items-center justify-center">
              <span className="text-white text-sm font-bold">Q</span>
            </div>
            <span className="font-display font-bold text-lg text-slate-900">
              Queue<span className="text-qc-blue-600">Cut</span>
            </span>
          </div>

          {/* Middle: Slide content */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="text-5xl font-bold text-slate-900 leading-tight max-w-md">
                  {slide.title}
                </h1>
                <p className="text-lg text-slate-500 mt-4 max-w-sm leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom: Progress + Buttons */}
          <div className="space-y-6">
            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === current
                      ? "w-6 h-1.5 bg-qc-blue-600"
                      : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleComplete}
                className="text-slate-500 text-sm hover:text-slate-700 transition-colors px-2 py-1"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="btn-blue-primary flex items-center gap-2"
              >
                {isLast ? "Get Started" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: vertical stack ── */}
      <div className="flex md:hidden flex-col w-full h-full">
        {/* Top: Image */}
        <div className="relative h-[48vh] overflow-hidden shrink-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={slide.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            />
          </AnimatePresence>
        </div>

        {/* Bottom: Content */}
        <div className="flex-1 flex flex-col justify-between px-6 py-6 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                {slide.title}
              </h1>
              <p className="text-base text-slate-500 mt-3 leading-relaxed">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${
                    idx === current ? "w-6 h-1.5 bg-qc-blue-600" : "w-1.5 h-1.5 bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Full-width button */}
            <button
              onClick={handleNext}
              className="btn-blue-primary w-full justify-center"
            >
              {isLast ? "Get Started" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Skip */}
            <button
              onClick={handleComplete}
              className="w-full text-center text-slate-500 text-sm hover:text-slate-700 transition-colors py-1"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
