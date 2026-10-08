/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { FrameworkShowcase } from './components/FrameworkShowcase';
import { RosettaStone } from './components/RosettaStone';
import { RoadmapView } from './components/RoadmapView';
import { DecisionWizard } from './components/DecisionWizard';
import { BenchmarkRadar } from './components/BenchmarkRadar';
import { FrameworkId } from './types/framework';
import { 
  Layers, 
  Code2, 
  GitBranch, 
  Compass, 
  BarChart3, 
  Sparkles, 
  Github, 
  Heart, 
  ExternalLink 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [rosettaInitialFw, setRosettaInitialFw] = useState<FrameworkId | null>(null);

  const handleOpenCodeComparison = (fwId: FrameworkId) => {
    setRosettaInitialFw(fwId);
    setActiveTab('rosetta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateFromWizard = (fwId: FrameworkId) => {
    setSelectedFramework(fwId);
    setActiveTab('matrix');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedFramework={selectedFramework}
        setSelectedFramework={setSelectedFramework}
      />

      {/* Main Content Area */}
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'matrix' && (
          <FrameworkShowcase
            selectedFramework={selectedFramework}
            onSelectFramework={setSelectedFramework}
            onOpenCodeComparison={handleOpenCodeComparison}
          />
        )}

        {activeTab === 'rosetta' && (
          <RosettaStone initialFramework={rosettaInitialFw} />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView initialTrack={selectedFramework ? (selectedFramework as FrameworkId) : 'all'} />
        )}

        {activeTab === 'decision' && (
          <DecisionWizard onNavigateToFramework={handleNavigateFromWizard} />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarkRadar />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/90 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-md flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>
                <span className="font-bold text-base bg-linear-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                  Frontend Matrix: React • Angular • Vue • Svelte
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                An authoritative interactive guide, Rosetta Stone syntax comparison, Roadmap.sh developer path, and Kellton & Pennine enterprise decision architecture.
              </p>
              <div className="text-[11px] text-slate-500 italic">
                "React: Best for flexibility and large ecosystems, making it the top choice for complex single-page apps and job market demand."
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Architectural Sources
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a
                    href="https://roadmap.sh/frontend"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Roadmap.sh Frontend Path</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/krausest/js-framework-benchmark"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Krausest JS Benchmark</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <span className="text-slate-400">Kellton Tech Enterprise Advisory</span>
                </li>
                <li>
                  <span className="text-slate-400">Pennine Architecture Guidelines</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Official Framework Portals
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a href="https://react.dev" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
                    React (react.dev)
                  </a>
                </li>
                <li>
                  <a href="https://angular.dev" target="_blank" rel="noreferrer" className="hover:text-rose-400 transition-colors">
                    Angular (angular.dev)
                  </a>
                </li>
                <li>
                  <a href="https://vuejs.org" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                    Vue.js (vuejs.org)
                  </a>
                </li>
                <li>
                  <a href="https://svelte.dev" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition-colors">
                    Svelte (svelte.dev)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <span>© 2026 Frontend Matrix Guide. Open standard community resource.</span>
            <div className="flex items-center gap-4">
              <span>TypeScript + React 19</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>Roadmap.sh & Kellton Inspired</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
