import React from 'react';
import { Layers, GitBranch, Code2, Compass, BarChart3, Sparkles } from 'lucide-react';

export type ActiveTab = 'matrix' | 'roadmap' | 'rosetta' | 'decision' | 'benchmarks';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedFramework: string | null;
  setSelectedFramework: (fw: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedFramework,
  setSelectedFramework
}) => {
  const tabs = [
    { id: 'matrix' as ActiveTab, label: 'Framework Matrix', icon: Layers, badge: 'React • Angular • Vue • Svelte' },
    { id: 'rosetta' as ActiveTab, label: 'Rosetta Stone', icon: Code2, badge: 'Side-by-Side Code' },
    { id: 'roadmap' as ActiveTab, label: 'Roadmap.sh Path', icon: GitBranch, badge: 'Developer Track' },
    { id: 'decision' as ActiveTab, label: 'Decision Engine', icon: Compass, badge: 'Kellton & Pennine' },
    { id: 'benchmarks' as ActiveTab, label: 'Benchmarks & Stats', icon: BarChart3, badge: 'Performance' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('matrix')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-0.5 shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-linear-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  Frontend Matrix
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border border-cyan-500/30">
                  2026 Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                React • Angular • Vue.js • Svelte
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/70">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Framework Quick Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 hidden xl:inline">Filter:</span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setSelectedFramework(null)}
                className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                  selectedFramework === null
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All 4
              </button>
              {(['react', 'angular', 'vue', 'svelte'] as const).map((fw) => {
                const isSelected = selectedFramework === fw;
                const colors: Record<string, string> = {
                  react: isSelected ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'text-slate-400',
                  angular: isSelected ? 'bg-rose-950 text-rose-300 border-rose-500/40' : 'text-slate-400',
                  vue: isSelected ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'text-slate-400',
                  svelte: isSelected ? 'bg-orange-950 text-orange-300 border-orange-500/40' : 'text-slate-400',
                };
                return (
                  <button
                    key={fw}
                    onClick={() => setSelectedFramework(isSelected ? null : fw)}
                    className={`px-2 py-1 text-xs capitalize font-medium rounded border border-transparent transition-all ${colors[fw]} hover:text-white`}
                  >
                    {fw}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
