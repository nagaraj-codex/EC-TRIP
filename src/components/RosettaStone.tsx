import React, { useState } from 'react';
import { CODE_TASKS, FRAMEWORKS_DATA } from '../data/frameworksData';
import { CodeSnippetTask, FrameworkId } from '../types/framework';
import { 
  Code2, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  Terminal, 
  Sliders 
} from 'lucide-react';

interface RosettaStoneProps {
  initialFramework?: FrameworkId | null;
}

export const RosettaStone: React.FC<RosettaStoneProps> = ({ initialFramework }) => {
  const [selectedTask, setSelectedTask] = useState<CodeSnippetTask>('counter');
  const [primaryFw, setPrimaryFw] = useState<FrameworkId>(initialFramework || 'react');
  const [secondaryFw, setSecondaryFw] = useState<FrameworkId>('svelte');
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Interactive State Simulations
  // Task 1: Counter
  const [liveCount, setLiveCount] = useState<number>(0);

  // Task 2: Form Binding
  const [liveEmail, setLiveEmail] = useState<string>('alex@enterprise.dev');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const isLiveEmailValid = liveEmail.includes('@') && liveEmail.includes('.');

  // Task 3: API Fetching
  const [liveLoading, setLiveLoading] = useState<boolean>(false);
  const [liveUsers, setLiveUsers] = useState<Array<{ id: number; name: string; role: string }>>([
    { id: 1, name: 'Jordan Walke', role: 'React Core Originator' },
    { id: 2, name: 'Evan You', role: 'Vue.js Author & Vite Creator' },
    { id: 3, name: 'Rich Harris', role: 'Svelte Inventor' }
  ]);

  const handleSimulateFetch = () => {
    setLiveLoading(true);
    setTimeout(() => {
      setLiveUsers([
        { id: 1, name: 'Sarah Drasner', role: 'Engineering Director' },
        { id: 2, name: 'Dan Abramov', role: 'Redux / React Core' },
        { id: 3, name: 'Misko Hevery', role: 'Angular Originator / Qwik' }
      ]);
      setLiveLoading(false);
    }, 800);
  };

  // Task 4: Derived State
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({ 1: 1, 2: 2 });
  const cartItems = [
    { id: 1, name: 'Enterprise Cloud License', price: 99 },
    { id: 2, name: 'Architecture Audit Pack', price: 49 }
  ];
  const derivedSubtotal = cartItems.reduce((acc, item) => acc + item.price * (cartQuantities[item.id] || 0), 0);
  const derivedTax = derivedSubtotal * 0.1;
  const derivedTotal = derivedSubtotal + derivedTax;

  const currentTaskData = CODE_TASKS.find((t) => t.id === selectedTask) || CODE_TASKS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFrameworkCodeBox = (fwId: FrameworkId) => {
    const fw = FRAMEWORKS_DATA[fwId];
    const snippet = currentTaskData.snippets[fwId];
    const copyKey = `${fwId}-${selectedTask}`;
    const isCopied = copiedId === copyKey;

    return (
      <div className={`rounded-xl border bg-slate-950/80 flex flex-col h-full shadow-lg ${fw.accentBorder}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <img src={fw.logo} alt={fw.name} className="w-5 h-5 object-contain" />
            <span className="font-bold text-sm text-white">{fw.name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {snippet.linesOfCode} lines
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(snippet.code, copyKey)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-xs overflow-x-auto text-slate-200 leading-relaxed grow bg-slate-950/90 selection:bg-cyan-500/20">
          <pre className="text-slate-200">
            <code>{snippet.code}</code>
          </pre>
        </div>

        {/* Explanation Footer */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-800/80 rounded-b-xl text-xs text-slate-400">
          <span className="font-semibold text-slate-300 block mb-0.5">Architecture Note:</span>
          <span>{snippet.explanation}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Code2 className="w-3.5 h-3.5" />
          <span>Interactive Syntax Rosetta Stone</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Side-by-Side Framework Code Comparison</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Observe how React, Angular, Vue, and Svelte solve identical reactive engineering patterns with varying levels of boilerplate, reactivity models, and template semantics.
        </p>
      </div>

      {/* Task Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CODE_TASKS.map((task) => {
          const isActive = selectedTask === task.id;
          return (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{task.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                task.difficulty === 'Beginner' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
              }`}>
                {task.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Interactive Simulation Widget Sandbox */}
      <section className="rounded-2xl border border-cyan-500/30 bg-linear-to-r from-slate-950 via-slate-900/90 to-slate-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Live Interactive Sandbox: {currentTaskData.title}</span>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Interactive
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Experience the live behavior of the code running in real-time.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
            Target Behavior: Shared Across All 4 Frameworks
          </div>
        </div>

        {/* Live Widget Switcher */}
        <div className="bg-slate-950/90 p-5 rounded-xl border border-slate-800/80">
          {selectedTask === 'counter' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-xl mx-auto py-2">
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Reactive State Count</span>
                <div className="text-4xl font-extrabold text-cyan-400 font-mono mt-1">{liveCount}</div>
                <span className="text-[11px] text-slate-500">Updates dynamically via reactive binding</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiveCount((c) => c - 1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all active:scale-95"
                >
                  - Decrement
                </button>
                <button
                  onClick={() => setLiveCount(0)}
                  className="px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setLiveCount((c) => c + 1)}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md shadow-cyan-600/20 transition-all active:scale-95"
                >
                  + Increment
                </button>
              </div>
            </div>
          )}

          {selectedTask === 'form-binding' && (
            <div className="max-w-md mx-auto space-y-3 py-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address (Two-Way Synced)
                </label>
                <input
                  type="email"
                  value={liveEmail}
                  onChange={(e) => {
                    setLiveEmail(e.target.value);
                    setFormSubmitted(false);
                  }}
                  className={`w-full px-3.5 py-2 rounded-lg bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-hidden transition-all ${
                    isLiveEmailValid ? 'border-emerald-500/50 focus:border-emerald-400' : 'border-rose-500/50 focus:border-rose-400'
                  }`}
                  placeholder="type your email..."
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                {!isLiveEmailValid ? (
                  <span className="text-rose-400 font-medium">Please enter a valid email format</span>
                ) : (
                  <span className="text-emerald-400 font-medium">✓ Valid email format detected</span>
                )}
                <span className="text-slate-500 font-mono text-[11px]">{liveEmail.length} chars</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  disabled={!isLiveEmailValid}
                  onClick={() => setFormSubmitted(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
                >
                  Submit Form
                </button>
                {formSubmitted && (
                  <span className="text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Submitted: {liveEmail}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedTask === 'fetch-data' && (
            <div className="max-w-lg mx-auto space-y-3 py-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Simulated Asynchronous REST Payload:</span>
                <button
                  onClick={handleSimulateFetch}
                  disabled={liveLoading}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${liveLoading ? 'animate-spin' : ''}`} />
                  <span>{liveLoading ? 'Fetching...' : 'Re-fetch API'}</span>
                </button>
              </div>

              {liveLoading ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Simulating async network roundtrip...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {liveUsers.map((user) => (
                    <div key={user.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{user.name}</span>
                        <span className="text-slate-400 block text-[11px]">{user.role}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        ID: {user.id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTask === 'derived-state' && (
            <div className="max-w-xl mx-auto space-y-4 py-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-slate-400">${item.price} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCartQuantities((prev) => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) }))}
                        className="w-6 h-6 rounded bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-cyan-300 w-4 text-center">
                        {cartQuantities[item.id] || 0}
                      </span>
                      <button
                        onClick={() => setCartQuantities((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}
                        className="w-6 h-6 rounded bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Subtotal: ${derivedSubtotal.toFixed(2)} + Tax (10%): ${derivedTax.toFixed(2)}</span>
                <span className="font-bold text-emerald-400 text-sm">Total: ${derivedTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Code Comparison Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">Compare Frameworks:</span>
          <div className="flex items-center gap-2">
            <select
              value={primaryFw}
              onChange={(e) => setPrimaryFw(e.target.value as FrameworkId)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white capitalize focus:outline-hidden"
            >
              {(['react', 'angular', 'vue', 'svelte'] as const).map((fw) => (
                <option key={fw} value={fw}>{FRAMEWORKS_DATA[fw].name}</option>
              ))}
            </select>

            <span className="text-xs text-slate-500 font-bold">vs</span>

            <select
              value={secondaryFw}
              onChange={(e) => setSecondaryFw(e.target.value as FrameworkId)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white capitalize focus:outline-hidden"
            >
              {(['react', 'angular', 'vue', 'svelte'] as const).map((fw) => (
                <option key={fw} value={fw}>{FRAMEWORKS_DATA[fw].name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'split' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            2-Way Split View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            All 4 Frameworks Grid
          </button>
        </div>
      </div>

      {/* Code Snippets Display */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderFrameworkCodeBox(primaryFw)}
          {renderFrameworkCodeBox(secondaryFw)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['react', 'angular', 'vue', 'svelte'] as const).map((fwId) => (
            <div key={fwId}>
              {renderFrameworkCodeBox(fwId)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
