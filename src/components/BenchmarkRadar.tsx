import React, { useState } from 'react';
import { BENCHMARK_METRICS, FRAMEWORKS_DATA } from '../data/frameworksData';
import { FrameworkId } from '../types/framework';
import { 
  BarChart3, 
  Zap, 
  Download, 
  Star, 
  Briefcase, 
  Cpu, 
  HelpCircle, 
  ArrowUpRight 
} from 'lucide-react';

export const BenchmarkRadar: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'performance' | 'ecosystem' | 'jobs'>('all');

  const frameworks: FrameworkId[] = ['react', 'angular', 'vue', 'svelte'];

  // Bundle sizes normalized for visual bar chart
  const bundleSizes = [
    { id: 'svelte' as FrameworkId, size: 2.1, display: '2.1 KB', desc: 'Compiler shim with zero VDOM overhead' },
    { id: 'vue' as FrameworkId, size: 33.8, display: '33.8 KB', desc: 'Runtime reactivity & block tree compiler' },
    { id: 'react' as FrameworkId, size: 42.6, display: '42.6 KB', desc: 'React 19 + ReactDOM reconciler' },
    { id: 'angular' as FrameworkId, size: 62.4, display: '62.4 KB', desc: 'Core platform + zoneless runtime' },
  ];

  const maxBundle = 70;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Empirical Benchmarks & Market Analytics</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Performance, Bundle Footprint & Ecosystem Analytics
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Empirical measurements derived from official Krausest JS Web Framework Benchmarks, NPM registry statistics, and tech market compensation reports.
        </p>
      </div>

      {/* Visual Bundle Size Comparison Bar Chart */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Production Baseline Bundle Footprint (Gzipped)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Minified + Gzipped payload shipped to the browser on initial load (Lower is better).
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 self-start sm:self-auto">
            Svelte is 20x lighter than React baseline
          </span>
        </div>

        <div className="space-y-4">
          {bundleSizes.map((item) => {
            const fw = FRAMEWORKS_DATA[item.id];
            const widthPct = Math.max(5, (item.size / maxBundle) * 100);

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <img src={fw.logo} alt="" className="w-4 h-4 object-contain" />
                    <span>{fw.name}</span>
                    <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                      — {item.desc}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${fw.textColor}`}>{item.display}</span>
                </div>

                <div className="w-full h-4 bg-slate-950 rounded-lg overflow-hidden p-0.5 border border-slate-800 flex items-center">
                  <div
                    className="h-full rounded-md transition-all duration-700 bg-linear-to-r"
                    style={{
                      width: `${widthPct}%`,
                      backgroundImage: `linear-gradient(to right, ${fw.brandColor}88, ${fw.brandColor})`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grid of Key Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BENCHMARK_METRICS.map((metric, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-white">{metric.metric}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {metric.higherIsBetter ? 'Higher is better' : 'Lower is better'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {metric.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
              {frameworks.map((fwId) => {
                const fw = FRAMEWORKS_DATA[fwId];
                const formattedVal = metric.formatted[fwId];
                return (
                  <div key={fwId} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                      <img src={fw.logo} alt="" className="w-3 h-3 object-contain" />
                      <span className="font-semibold text-slate-300">{fw.name}</span>
                    </div>
                    <span className={`font-mono font-bold block ${fw.textColor}`}>{formattedVal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Enterprise Market Summary Callout */}
      <section className="rounded-2xl border border-slate-800 bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950/40 p-6 sm:p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Job Market Liquidity & Hiring Dynamics (2026)</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
              According to current tech recruiter indexes, <strong>React</strong> maintains unmatched dominance in sheer number of open positions across startups and big tech, guaranteeing the widest developer talent pool. <strong>Angular</strong> continues to anchor mission-critical government, defense, and multinational banking portals. <strong>Vue.js</strong> commands the fastest onboarding times for mixed frontend/backend engineering teams. <strong>Svelte</strong> leads in developer satisfaction and is rapidly adopted for high-performance dashboards and interactive consumer web apps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
