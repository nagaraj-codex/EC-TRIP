export type FrameworkId = 'react' | 'angular' | 'vue' | 'svelte';

export interface FrameworkData {
  id: FrameworkId;
  name: string;
  tagline: string;
  badge: string;
  highlightQuote: string;
  logo: string;
  brandColor: string;
  gradient: string;
  accentBorder: string;
  bgGlow: string;
  textColor: string;
  releaseYear: number;
  creator: string;
  maintainer: string;
  license: string;
  reactivityModel: string;
  renderingStrategy: string;
  bundleSizeMinGzip: string;
  bundleSizeBytes: number;
  githubStars: string;
  starsCount: number;
  weeklyDownloads: string;
  downloadsCount: number;
  learningCurve: 'Moderate' | 'Steep' | 'Gentle' | 'Very Gentle';
  jobDemand: 'Very High (Dominant)' | 'High (Enterprise)' | 'High (Versatile)' | 'Growing Rapidly';
  avgSalaryUS: string;
  metaFrameworks: { name: string; desc: string; url: string }[];
  keyStrengths: string[];
  tradeoffs: string[];
  enterpriseAdoption: { company: string; logo: string; useCase: string }[];
  architectureSummary: string;
  ecosystemHighlights: { category: string; tool: string }[];
}

export type CodeSnippetTask = 
  | 'counter' 
  | 'form-binding' 
  | 'fetch-data' 
  | 'props-events' 
  | 'derived-state';

export interface CodeComparisonItem {
  frameworkId: FrameworkId;
  language: string;
  code: string;
  explanation: string;
  linesOfCode: number;
}

export interface CodeComparisonTask {
  id: CodeSnippetTask;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  snippets: Record<FrameworkId, CodeComparisonItem>;
}

export interface RoadmapNode {
  id: string;
  title: string;
  category: 'fundamentals' | 'framework-core' | 'state' | 'routing-ssr' | 'testing' | 'advanced';
  categoryLabel: string;
  frameworkApplicability: FrameworkId[] | 'all';
  importance: 'Essential' | 'Recommended' | 'Optional';
  estimatedHours: string;
  description: string;
  keyConcepts: string[];
  frameworkSpecifics?: Partial<Record<FrameworkId, string>>;
  resourceLink?: string;
}

export interface DecisionQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    points: Record<FrameworkId, number>;
  }[];
}

export interface BenchmarkMetric {
  metric: string;
  unit: string;
  higherIsBetter: boolean;
  description: string;
  values: Record<FrameworkId, number>;
  formatted: Record<FrameworkId, string>;
}
