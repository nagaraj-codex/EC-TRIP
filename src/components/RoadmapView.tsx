import React, { useState } from 'react';
import { ROADMAP_NODES } from '../data/roadmapData';
import { FRAMEWORKS_DATA } from '../data/frameworksData';
import { FrameworkId, RoadmapNode } from '../types/framework';
import { 
  GitBranch, 
  CheckCircle, 
  Clock, 
  Bookmark, 
  Search, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  BookOpen, 
  Check, 
  Filter 
} from 'lucide-react';

interface RoadmapViewProps {
  initialTrack?: FrameworkId | 'all';
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ initialTrack = 'all' }) => {
  const [selectedTrack, setSelectedTrack] = useState<FrameworkId | 'all'>(initialTrack);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNode, setActiveNode] = useState<RoadmapNode | null>(null);
  
  // Track node learning statuses: 'todo' | 'doing' | 'done'
  const [nodeStatus, setNodeStatus] = useState<Record<string, 'todo' | 'doing' | 'done'>>({
    'html-semantic': 'done',
    'css-modern': 'done',
    'javascript-esnext': 'done',
    'typescript-core': 'done',
    'react-core': 'doing',
  });

  const handleStatusChange = (nodeId: string, status: 'todo' | 'doing' | 'done') => {
    setNodeStatus((prev) => ({ ...prev, [nodeId]: status }));
  };

  const filteredNodes = ROADMAP_NODES.filter((node) => {
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.keyConcepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrack = selectedTrack === 'all' 
      ? true 
      : node.frameworkApplicability === 'all' || (Array.isArray(node.frameworkApplicability) && node.frameworkApplicability.includes(selectedTrack));

    return matchesSearch && matchesTrack;
  });

  // Calculate Progress
  const totalCount = ROADMAP_NODES.length;
  const completedCount = Object.values(nodeStatus).filter((s) => s === 'done').length;
  const inProgressCount = Object.values(nodeStatus).filter((s) => s === 'doing').length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Group by category
  const categories = [
    { key: 'fundamentals', label: 'Phase 1: Web Fundamentals & TypeScript' },
    { key: 'framework-core', label: 'Phase 2: Modern Framework Core' },
    { key: 'state', label: 'Phase 3: State Management & Caching' },
    { key: 'routing-ssr', label: 'Phase 4: Routing & Fullstack SSR' },
    { key: 'testing', label: 'Phase 5: Automated Testing & QA' },
    { key: 'advanced', label: 'Phase 6: Build Tooling & Performance' },
  ];

  return (
    <div className="space-y-8">
      {/* Roadmap Header */}
      <div className="relative rounded-2xl border border-slate-800 bg-linear-to-r from-slate-900 via-slate-900/80 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Roadmap.sh Frontend Track</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Interactive Frontend Developer Path
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Step-by-step career path from core HTML/CSS/JS fundamentals to mastery in React, Angular, Vue, and Svelte ecosystems. Click any milestone to view learning notes.
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="shrink-0 bg-slate-950/80 border border-slate-800 p-4 rounded-xl min-w-60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Your Track Progress</span>
              <span className="font-bold text-cyan-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-linear-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="w-3 h-3" /> {completedCount} Done
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3 h-3" /> {inProgressCount} In Progress
              </span>
              <span className="text-slate-500">
                {totalCount - completedCount - inProgressCount} To Go
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {/* Framework Track Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Track:</span>
            </span>
            <button
              onClick={() => setSelectedTrack('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedTrack === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Frontend
            </button>
            {(['react', 'angular', 'vue', 'svelte'] as const).map((fw) => {
              const isActive = selectedTrack === fw;
              const fwData = FRAMEWORKS_DATA[fw];
              return (
                <button
                  key={fw}
                  onClick={() => setSelectedTrack(fw)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                    isActive
                      ? `${fwData.textColor} bg-slate-900 border-current shadow-xs`
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <img src={fwData.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>{fwData.name} Track</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search concepts, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Roadmap Tree Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visual Roadmap Tree Nodes */}
        <div className="lg:col-span-2 space-y-8">
          {categories.map((cat) => {
            const nodesInCat = filteredNodes.filter((n) => n.category === cat.key);
            if (nodesInCat.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-cyan-500/20" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    {cat.label}
                  </h3>
                </div>

                {/* Node Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-2 border-slate-800/80">
                  {nodesInCat.map((node) => {
                    const status = nodeStatus[node.id] || 'todo';
                    const isSelected = activeNode?.id === node.id;

                    const statusBadge = {
                      done: { bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300', icon: CheckCircle, label: 'Completed' },
                      doing: { bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300', icon: Clock, label: 'In Progress' },
                      todo: { bg: 'bg-slate-900 border-slate-800 text-slate-400', icon: Bookmark, label: 'To Learn' }
                    }[status];

                    const StatusIcon = statusBadge.icon;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setActiveNode(node)}
                        className={`group cursor-pointer p-4 rounded-xl border bg-slate-900/60 backdrop-blur-xs transition-all relative ${
                          isSelected
                            ? 'border-cyan-400 bg-slate-850 shadow-md shadow-cyan-500/10'
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                            {node.title}
                          </h4>
                          <span className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {node.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                          <span>{node.estimatedHours}</span>
                          <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform font-medium">
                            <span>Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Node Details Inspector */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 shadow-xl">
            {activeNode ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-semibold text-cyan-400 tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                      {activeNode.categoryLabel}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ⏱ {activeNode.estimatedHours}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{activeNode.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{activeNode.description}</p>
                </div>

                {/* Progress Status Buttons */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Update Your Learning Status:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: 'todo' as const, label: 'To Learn', color: 'hover:bg-slate-800' },
                      { status: 'doing' as const, label: 'In Progress', color: 'hover:bg-amber-950/50' },
                      { status: 'done' as const, label: 'Completed', color: 'hover:bg-emerald-950/50' },
                    ].map((item) => {
                      const isCurrent = (nodeStatus[activeNode.id] || 'todo') === item.status;
                      return (
                        <button
                          key={item.status}
                          onClick={() => handleStatusChange(activeNode.id, item.status)}
                          className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                            isCurrent
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                              : `bg-slate-950/60 text-slate-400 border-slate-800 ${item.color}`
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Key Concepts */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Key Topics & Competencies:
                  </span>
                  <div className="space-y-1.5">
                    {activeNode.keyConcepts.map((concept, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Framework Specific Nuances */}
                {activeNode.frameworkSpecifics && (
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Framework Ecosystem Nuance:
                    </span>
                    <div className="space-y-2">
                      {Object.entries(activeNode.frameworkSpecifics).map(([fw, note]) => {
                        const fwData = FRAMEWORKS_DATA[fw as FrameworkId];
                        return (
                          <div key={fw} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                            <span className={`font-bold block mb-1 ${fwData.textColor}`}>
                              {fwData.name}:
                            </span>
                            <span className="text-slate-300 leading-snug">{note}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Resource Link */}
                {activeNode.resourceLink && (
                  <div className="pt-2 border-t border-slate-800">
                    <a
                      href={activeNode.resourceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                    >
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Open Official Documentation</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <BookOpen className="w-10 h-10 mx-auto opacity-40 text-cyan-400" />
                <h4 className="text-sm font-semibold text-slate-400">No Milestone Selected</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click on any roadmap card on the left to inspect its curriculum, learning prerequisites, and framework-specific nuances.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
