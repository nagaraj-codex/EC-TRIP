import React, { useState } from 'react';
import { FRAMEWORKS_DATA } from '../data/frameworksData';
import { FrameworkId } from '../types/framework';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Cpu, 
  Building2, 
  Package, 
  Sparkles, 
  Zap, 
  Layers, 
  Globe2, 
  Quote, 
  Scale, 
  Code
} from 'lucide-react';

interface FrameworkShowcaseProps {
  selectedFramework: string | null;
  onSelectFramework: (fw: string | null) => void;
  onOpenCodeComparison: (fw: FrameworkId) => void;
}

export const FrameworkShowcase: React.FC<FrameworkShowcaseProps> = ({
  selectedFramework,
  onSelectFramework,
  onOpenCodeComparison
}) => {
  const [activeCardTab, setActiveCardTab] = useState<Record<FrameworkId, 'overview' | 'pros' | 'enterprise' | 'ecosystem'>>({
    react: 'overview',
    angular: 'overview',
    vue: 'overview',
    svelte: 'overview'
  });

  const [tableFilter, setTableFilter] = useState<'all' | 'technical' | 'market'>('all');

  const frameworkList: FrameworkId[] = selectedFramework 
    ? [selectedFramework as FrameworkId] 
    : ['react', 'angular', 'vue', 'svelte'];

  return (
    <div className="space-y-12">
      {/* Top Hero Banner with Prominent User Quote */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frontend Architecture Landscape</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            The Big Four: <span className="bg-linear-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">React, Angular, Vue & Svelte</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
            In-depth architectural comparison, official roadmap trajectories, and empirical benchmarks inspired by Roadmap.sh, Kellton Tech, and Pennine enterprise consulting frameworks.
          </p>

          {/* Highlighted Quote Callout */}
          <div className="relative p-5 rounded-xl bg-linear-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/60 border border-cyan-500/40 shadow-inner mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                <Quote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-medium text-cyan-100 italic leading-snug">
                  "React: Best for flexibility and large ecosystems, making it the top choice for complex single-page apps and job market demand."
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="font-semibold text-cyan-300">Industry Consensus</span>
                  <span>•</span>
                  <span>Enterprise Market Verdict</span>
                  <span>•</span>
                  <span>Vast Component & Talent Pool</span>
                </div>
              </div>
            </div>
          </div>

          {/* Framework Quick Glance Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { id: 'react', name: 'React', tagline: 'Unmatched Ecosystem & Market', color: 'border-cyan-500/30 text-cyan-400' },
              { id: 'angular', name: 'Angular', tagline: 'Enterprise Batteries-Included', color: 'border-rose-500/30 text-rose-400' },
              { id: 'vue', name: 'Vue.js', tagline: 'Progressive & Approachable', color: 'border-emerald-500/30 text-emerald-400' },
              { id: 'svelte', name: 'Svelte', tagline: 'Zero Virtual DOM & Speed', color: 'border-orange-500/30 text-orange-400' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectFramework(selectedFramework === item.id ? null : item.id)}
                className={`p-3 rounded-xl text-left bg-slate-900/70 border transition-all ${
                  selectedFramework === item.id 
                    ? 'ring-2 ring-cyan-400 border-transparent bg-slate-800' 
                    : `${item.color} hover:bg-slate-850 hover:border-slate-700`
                }`}
              >
                <div className="font-bold text-sm text-white flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    2026
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{item.tagline}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Framework Cards */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-cyan-400" />
              <span>Deep-Dive Framework Profiles</span>
            </h2>
            <p className="text-sm text-slate-400">
              Explore reactivity engines, enterprise adoption, pros/cons, and meta-frameworks.
            </p>
          </div>

          {selectedFramework && (
            <button
              onClick={() => onSelectFramework(null)}
              className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
            >
              Show All 4 Frameworks
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {frameworkList.map((fwId) => {
            const data = FRAMEWORKS_DATA[fwId];
            const currentTab = activeCardTab[fwId];

            return (
              <div
                key={fwId}
                className={`relative rounded-2xl border bg-slate-900/60 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-xl ${data.accentBorder}`}
              >
                {/* Header with Framework Logo & Identity */}
                <div className="p-6 border-b border-slate-800/80 bg-linear-to-r from-slate-900/90 to-slate-950/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl p-2.5 bg-slate-950/90 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                        <img
                          src={data.logo}
                          alt={`${data.name} logo`}
                          className="w-10 h-10 object-contain"
                          loading="lazy"
                          onError={(e) => {
                            // SVG fallback if image fails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white tracking-tight">{data.name}</h3>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border ${data.textColor}`}>
                            {data.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{data.tagline}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCodeComparison(fwId)}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all"
                      title={`View ${data.name} code snippets`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </button>
                  </div>

                  {/* Highlight Quote */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed italic flex items-center gap-2">
                    <Quote className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{data.highlightQuote}</span>
                  </div>

                  {/* Key Stats Ribbon */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-center">
                    <div className="bg-slate-950/40 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-400 font-medium">Bundle Size</span>
                      <span className="font-bold text-xs text-white">{data.bundleSizeMinGzip.split(' ')[0]} KB</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-400 font-medium">GitHub Stars</span>
                      <span className="font-bold text-xs text-white">{data.githubStars}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-400 font-medium">Weekly DLs</span>
                      <span className="font-bold text-xs text-white">{data.weeklyDownloads}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-400 font-medium">US Avg Salary</span>
                      <span className="font-bold text-xs text-emerald-400">{data.avgSalaryUS.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Subtabs Navigation */}
                <div className="flex border-b border-slate-800/80 bg-slate-950/30 px-4 pt-2 gap-1 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'overview', label: 'Architecture', icon: Cpu },
                    { id: 'pros', label: 'Strengths & Trade-offs', icon: Scale },
                    { id: 'enterprise', label: 'Enterprise Users', icon: Building2 },
                    { id: 'ecosystem', label: 'Ecosystem & SSR', icon: Package }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCardTab((prev) => ({ ...prev, [fwId]: tab.id as any }))}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                          isActive
                            ? 'text-cyan-300 border-cyan-400 bg-slate-800/50'
                            : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850/50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Body */}
                <div className="p-6 min-h-65">
                  {currentTab === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Reactivity Model
                        </span>
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-200">
                          {data.reactivityModel}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Rendering Strategy
                        </span>
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-200">
                          {data.renderingStrategy}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">Originated By</span>
                          <span className="font-medium text-slate-200">{data.creator}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px]">Maintainer</span>
                          <span className="font-medium text-slate-200">{data.maintainer}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTab === 'pros' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Key Advantages</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {data.keyStrengths.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60">
                        <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Trade-offs & Considerations</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {data.tradeoffs.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {currentTab === 'enterprise' && (
                    <div className="space-y-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Verified Production Deployments
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {data.enterpriseAdoption.map((corp, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                            <img
                              src={corp.logo}
                              alt={corp.company}
                              className="w-5 h-5 rounded mt-0.5 shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{corp.company}</div>
                              <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{corp.useCase}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTab === 'ecosystem' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                          Fullstack Meta-Frameworks
                        </span>
                        <div className="space-y-2">
                          {data.metaFrameworks.map((meta, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-xs text-cyan-300">{meta.name}</span>
                                <span className="text-[11px] text-slate-400 block">{meta.desc}</span>
                              </div>
                              <a
                                href={meta.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-cyan-300 p-1 rounded"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                          Standard Ecosystem Tooling
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {data.ecosystemHighlights.map((eco, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-950/40 border border-slate-800/80 text-[11px]">
                              <span className="text-slate-400 block text-[10px]">{eco.category}</span>
                              <span className="font-medium text-slate-200">{eco.tool}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comprehensive Architectural Matrix Table (Kellton & Pennine benchmark layout) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Enterprise Evaluation Matrix</span>
            </div>
            <h3 className="text-xl font-bold text-white">Full Architectural Feature Comparison</h3>
            <p className="text-xs text-slate-400">
              Comparative analysis based on Kellton enterprise reports and Roadmap.sh recommendations.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setTableFilter('all')}
              className={`px-3 py-1 rounded transition-all ${
                tableFilter === 'all' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Dimensions
            </button>
            <button
              onClick={() => setTableFilter('technical')}
              className={`px-3 py-1 rounded transition-all ${
                tableFilter === 'technical' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Technical / Core
            </button>
            <button
              onClick={() => setTableFilter('market')}
              className={`px-3 py-1 rounded transition-all ${
                tableFilter === 'market' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Market / Team
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4 w-1/5 min-w-45">Architectural Dimension</th>
                <th className="p-4 w-1/5 min-w-50 text-cyan-400">React</th>
                <th className="p-4 w-1/5 min-w-50 text-rose-400">Angular</th>
                <th className="p-4 w-1/5 min-w-50 text-emerald-400">Vue.js</th>
                <th className="p-4 w-1/5 min-w-50 text-orange-400">Svelte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(tableFilter === 'all' || tableFilter === 'technical') && (
                <>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">Reactivity Paradigm</td>
                    <td className="p-4">Explicit State Hook (`useState`) + Fiber Re-render</td>
                    <td className="p-4">Angular Signals (`signal()`, `computed()`) + Zoneless</td>
                    <td className="p-4">Proxy-based reactive getters/setters (`ref()`, `reactive()`)</td>
                    <td className="p-4">Compile-time Runes (`$state()`, `$derived()`)</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">DOM Diffing & Updates</td>
                    <td className="p-4">In-memory Virtual DOM tree diffing via Fiber lanes</td>
                    <td className="p-4">Incremental DOM compiler output targeting specific nodes</td>
                    <td className="p-4">Compiler-informed Virtual DOM (Dynamic Block Tree)</td>
                    <td className="p-4 font-semibold text-orange-300">Zero Virtual DOM (Direct surgical DOM node writes)</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">Template / Syntax</td>
                    <td className="p-4">{'JSX / TSX (JavaScript XML expressions)'}</td>
                    <td className="p-4">{'HTML with Angular control flow (@if, @for, {{}})'}</td>
                    <td className="p-4">{'Single File Component (<template>, <script setup>)'}</td>
                    <td className="p-4">{'HTML with Runes ({#if}, {#each}, bind:)'}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">Baseline Bundle Size (Gzip)</td>
                    <td className="p-4">42.6 KB (React + ReactDOM)</td>
                    <td className="p-4">62.4 KB (Core + Compiler)</td>
                    <td className="p-4">33.8 KB (Runtime)</td>
                    <td className="p-4 font-bold text-emerald-400">2.1 KB (Minimal runtime shim)</td>
                  </tr>
                </>
              )}

              {(tableFilter === 'all' || tableFilter === 'market') && (
                <>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">Job Market Demand (US)</td>
                    <td className="p-4 font-bold text-cyan-300">58% of all frontend postings (Market Leader)</td>
                    <td className="p-4 text-rose-300">24% (Dominates Enterprise & Finance)</td>
                    <td className="p-4">14% (Fastest in Europe & Asia)</td>
                    <td className="p-4">4% (Fastest-growing developer satisfaction)</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">Learning Curve</td>
                    <td className="p-4">Moderate (JSX + Hooks lifecycle)</td>
                    <td className="p-4">Steep (TypeScript + RxJS + DI + Decorators)</td>
                    <td className="p-4 font-semibold text-emerald-400">Gentle (Standard HTML/CSS familiarity)</td>
                    <td className="p-4 font-semibold text-emerald-400">Very Gentle (Pure JavaScript-like syntax)</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">Mobile / Cross-Platform</td>
                    <td className="p-4 font-bold text-cyan-300">React Native (First-class native sharing)</td>
                    <td className="p-4">NativeScript, Ionic / Capacitor</td>
                    <td className="p-4">Capacitor, NativeScript-Vue</td>
                    <td className="p-4">Svelte Native, Capacitor</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="p-4 font-semibold text-white bg-slate-950/30">Primary Flagship Meta-Framework</td>
                    <td className="p-4">Next.js 15 (Server Components & SSR)</td>
                    <td className="p-4">Angular SSR / Analog.js</td>
                    <td className="p-4">Nuxt 3 (Fullstack Nitro Engine)</td>
                    <td className="p-4">SvelteKit (Edge-ready filesystem routing)</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
