import React, { useState } from 'react';
import { DECISION_QUESTIONS, FRAMEWORKS_DATA } from '../data/frameworksData';
import { FrameworkId } from '../types/framework';
import { 
  Compass, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  Building2 
} from 'lucide-react';

interface DecisionWizardProps {
  onNavigateToFramework: (fw: FrameworkId) => void;
}

export const DecisionWizard: React.FC<DecisionWizardProps> = ({ onNavigateToFramework }) => {
  // Store selected option index for each question
  const [answers, setAnswers] = useState<Record<string, number>>({
    scale: 1, // Complex Single-Page App
    team_background: 1, // Modern JS/TS
    batteries: 1, // Maximum Freedom
    mobile_crossplatform: 0, // React Native
  });

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // Preset scenarios
  const applyPreset = (presetName: 'startup' | 'enterprise' | 'lightweight' | 'mobile') => {
    if (presetName === 'startup') {
      setAnswers({
        scale: 2, // Startup SaaS
        team_background: 1, // Modern JS/TS
        batteries: 1, // Freedom
        mobile_crossplatform: 2, // Web only
      });
    } else if (presetName === 'enterprise') {
      setAnswers({
        scale: 0, // Enterprise
        team_background: 0, // OOP / C# / Java
        batteries: 0, // Batteries included
        mobile_crossplatform: 1, // PWA
      });
    } else if (presetName === 'lightweight') {
      setAnswers({
        scale: 3, // Ultra-Performance
        team_background: 3, // Minimalist
        batteries: 3, // Compiler Simplicity
        mobile_crossplatform: 2, // Web only
      });
    } else if (presetName === 'mobile') {
      setAnswers({
        scale: 1, // Complex SPA
        team_background: 1, // Modern JS
        batteries: 1, // Freedom
        mobile_crossplatform: 0, // React Native
      });
    }
  };

  // Compute total scores
  const scores: Record<FrameworkId, number> = {
    react: 0,
    angular: 0,
    vue: 0,
    svelte: 0,
  };

  DECISION_QUESTIONS.forEach((q) => {
    const selectedIdx = answers[q.id] ?? 0;
    const selectedOpt = q.options[selectedIdx];
    if (selectedOpt) {
      scores.react += selectedOpt.points.react;
      scores.angular += selectedOpt.points.angular;
      scores.vue += selectedOpt.points.vue;
      scores.svelte += selectedOpt.points.svelte;
    }
  });

  // Calculate percentages based on max possible score (~40)
  const maxPossible = 40;
  const percentages: Record<FrameworkId, number> = {
    react: Math.min(100, Math.round((scores.react / maxPossible) * 100)),
    angular: Math.min(100, Math.round((scores.angular / maxPossible) * 100)),
    vue: Math.min(100, Math.round((scores.vue / maxPossible) * 100)),
    svelte: Math.min(100, Math.round((scores.svelte / maxPossible) * 100)),
  };

  // Determine top framework
  const sortedFrameworks = (['react', 'angular', 'vue', 'svelte'] as FrameworkId[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  const winnerId = sortedFrameworks[0];
  const winner = FRAMEWORKS_DATA[winnerId];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative rounded-2xl border border-slate-800 bg-linear-to-r from-slate-900 via-indigo-950/20 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Kellton & Pennine Architectural Advisory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Enterprise Framework Matchmaker
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Answer 4 strategic business & engineering questions to calculate algorithmic compatibility scores based on team taxonomy, scalability targets, and ecosystem longevity.
          </p>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-semibold mr-1">Load Architecture Archetype:</span>
            <button
              onClick={() => applyPreset('startup')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              🚀 Fast-Paced SaaS Startup
            </button>
            <button
              onClick={() => applyPreset('enterprise')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              🏛️ Global Enterprise & Banking
            </button>
            <button
              onClick={() => applyPreset('mobile')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              📱 Mobile-First Native Sharing
            </button>
            <button
              onClick={() => applyPreset('lightweight')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              ⚡ Micro-Bundle & Low Bandwidth
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Questionnaire */}
        <div className="lg:col-span-2 space-y-6">
          {DECISION_QUESTIONS.map((q, qIndex) => {
            const currentSelected = answers[q.id] ?? 0;

            return (
              <div
                key={q.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xs shadow-lg space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-1">
                    <span>Criterion #{qIndex + 1}</span>
                    <span>•</span>
                    <span className="text-slate-400 font-normal">{q.subtitle}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{q.question}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = currentSelected === optIndex;
                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, optIndex)}
                        className={`p-3.5 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className={`font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                              {opt.label}
                            </span>
                            <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                              isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Real-time Recommendation & Fit Score */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-6 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Recommendation</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Best Architecture Match</h3>
            </div>

            {/* Top Winner Card */}
            <div className={`p-5 rounded-xl border bg-slate-950/80 relative overflow-hidden shadow-lg ${winner.accentBorder}`}>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl p-2 bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <img src={winner.logo} alt={winner.name} className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white">{winner.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 ${winner.textColor}`}>
                      {percentages[winnerId]}% Match
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{winner.badge}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic mb-4 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                "{winner.highlightQuote}"
              </p>

              <button
                onClick={() => onNavigateToFramework(winnerId)}
                className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 transition-all"
              >
                <span>View {winner.name} Technical Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Score Distribution Breakdown */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block">
                Algorithmic Compatibility Breakdown:
              </span>

              {sortedFrameworks.map((fwId) => {
                const fw = FRAMEWORKS_DATA[fwId];
                const pct = percentages[fwId];
                return (
                  <div key={fwId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <img src={fw.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>{fw.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-400">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Consulting Advisory Summary */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Enterprise Consulting Takeaway</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                As documented in Pennine & Kellton tech advisory whitepapers, choosing React guarantees unparalleled market talent liquidity and flexible composition; Angular delivers strict structural compliance for 50+ dev enterprises; Vue provides rapid developer onboarding; and Svelte offers maximum raw device speed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
