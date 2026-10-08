import { RoadmapNode } from '../types/framework';

export const ROADMAP_NODES: RoadmapNode[] = [
  // 1. Fundamentals
  {
    id: 'html-semantic',
    title: 'Semantic HTML5 & Accessibility (a11y)',
    category: 'fundamentals',
    categoryLabel: 'Phase 1: Web Fundamentals',
    frameworkApplicability: 'all',
    importance: 'Essential',
    estimatedHours: '15-20 hrs',
    description: 'Foundational markup, aria roles, screen reader compatibility, and SEO structure before choosing any framework.',
    keyConcepts: ['Semantic elements (<main>, <article>, <nav>)', 'ARIA roles & tabindex', 'Forms & input types', 'OpenGraph & metadata standards'],
    resourceLink: 'https://roadmap.sh/frontend'
  },
  {
    id: 'css-modern',
    title: 'Modern CSS, Flexbox & Grid',
    category: 'fundamentals',
    categoryLabel: 'Phase 1: Web Fundamentals',
    frameworkApplicability: 'all',
    importance: 'Essential',
    estimatedHours: '25-30 hrs',
    description: 'Responsive design, CSS custom properties, container queries, modern Tailwind utility architecture, and subgrid.',
    keyConcepts: ['Flexbox & 2D CSS Grid', 'Custom properties (CSS variables)', 'Container queries', 'Tailwind CSS utility-first workflow'],
    resourceLink: 'https://roadmap.sh/css'
  },
  {
    id: 'javascript-esnext',
    title: 'Modern JavaScript (ES6+) & Async JS',
    category: 'fundamentals',
    categoryLabel: 'Phase 1: Web Fundamentals',
    frameworkApplicability: 'all',
    importance: 'Essential',
    estimatedHours: '40-50 hrs',
    description: 'Closures, Event Loop, Promises, Async/Await, Array methods, Destructuring, and DOM manipulation basics.',
    keyConcepts: ['Event Loop & microtask queue', 'Promises & Async/Await', 'Immutability & spread syntax', 'ES Modules (import/export)'],
    resourceLink: 'https://roadmap.sh/javascript'
  },
  {
    id: 'typescript-core',
    title: 'TypeScript for Component Architecture',
    category: 'fundamentals',
    categoryLabel: 'Phase 1: Web Fundamentals',
    frameworkApplicability: 'all',
    importance: 'Essential',
    estimatedHours: '30-40 hrs',
    description: 'Strict static typing for props, state, generic components, Discriminated Unions, and API contract interfaces.',
    keyConcepts: ['Interfaces & Type Aliases', 'Generics in components', 'Discriminated Unions', 'Strict null checks'],
    resourceLink: 'https://roadmap.sh/typescript'
  },

  // 2. Framework Core
  {
    id: 'react-core',
    title: 'React Core & Fiber Reconciliation',
    category: 'framework-core',
    categoryLabel: 'Phase 2: Framework Core',
    frameworkApplicability: ['react'],
    importance: 'Essential',
    estimatedHours: '40 hrs',
    description: 'JSX, component tree lifecycle, Virtual DOM diffing, Fiber scheduling, and rules of Hooks.',
    keyConcepts: ['useState & useEffect rules', 'useMemo & useCallback optimization', 'Custom hooks composition', 'Controlled vs Uncontrolled inputs'],
    frameworkSpecifics: {
      react: 'React 19 Actions, useActionState, useOptimistic, and Server Components paradigm.'
    },
    resourceLink: 'https://react.dev'
  },
  {
    id: 'angular-core',
    title: 'Angular Signals & Modern Standalone Components',
    category: 'framework-core',
    categoryLabel: 'Phase 2: Framework Core',
    frameworkApplicability: ['angular'],
    importance: 'Essential',
    estimatedHours: '45 hrs',
    description: 'Standalone components, Signal primitives (signal, computed, effect), Control flow syntax (@if, @for), and Dependency Injection.',
    keyConcepts: ['Angular Signals reactivity', 'Standalone Components & Directives', 'New Control Flow (@if, @for, @switch)', 'Dependency Injection (inject())'],
    frameworkSpecifics: {
      angular: 'Angular v17-19 zoneless architecture, defer blocks (@defer), and modern input/output signal APIs.'
    },
    resourceLink: 'https://angular.dev'
  },
  {
    id: 'vue-core',
    title: 'Vue 3 Composition API & Single-File Components',
    category: 'framework-core',
    categoryLabel: 'Phase 2: Framework Core',
    frameworkApplicability: ['vue'],
    importance: 'Essential',
    estimatedHours: '30 hrs',
    description: 'Single-File Components (.vue), script setup syntax, ref() & reactive(), computed(), and template directives (v-for, v-if, v-model).',
    keyConcepts: ['ref() vs reactive() mental model', 'script setup syntax', 'Template directives & slots', 'Custom composables (useFeature)'],
    frameworkSpecifics: {
      vue: 'Proxy-based fine-grained dependency tracking and compiler-informed block tree Virtual DOM.'
    },
    resourceLink: 'https://vuejs.org'
  },
  {
    id: 'svelte-core',
    title: 'Svelte 5 Runes & Zero-Virtual-DOM Paradigm',
    category: 'framework-core',
    categoryLabel: 'Phase 2: Framework Core',
    frameworkApplicability: ['svelte'],
    importance: 'Essential',
    estimatedHours: '20 hrs',
    description: 'Svelte 5 Runes ($state, $derived, $effect, $props), compile-time reactivity, direct surgical DOM mutations, and scoped styles.',
    keyConcepts: ['$state & $derived Runes', 'Svelte template blocks ({#if}, {#each}, {#await})', 'bind: directive & event handlers', 'Scoped CSS & built-in transitions'],
    frameworkSpecifics: {
      svelte: 'Compiler transforms markup into tiny JS instructions without maintaining any in-memory Virtual DOM tree.'
    },
    resourceLink: 'https://svelte.dev'
  },

  // 3. State Management
  {
    id: 'state-management',
    title: 'Global State Management & Cache Architecture',
    category: 'state',
    categoryLabel: 'Phase 3: State & Data Flow',
    frameworkApplicability: 'all',
    importance: 'Essential',
    estimatedHours: '25-35 hrs',
    description: 'Architecting UI state vs server cache. Choosing between centralized immutable stores and fine-grained reactive signals.',
    keyConcepts: ['Server cache vs Client state', 'Selective re-rendering & subscriptions', 'Optimistic UI updates', 'State persistence & hydration'],
    frameworkSpecifics: {
      react: 'Zustand (minimalist store), Redux Toolkit (enterprise predictable flow), TanStack Query (server state).',
      angular: 'Angular Signals, RxJS Store (NgRx), or lightweight SignalStore.',
      vue: 'Pinia (official modular store) with setup store syntax and devtools integration.',
      svelte: 'Svelte 5 universal Runes in .svelte.js files and legacy Svelte Stores (writable, readable).'
    },
    resourceLink: 'https://roadmap.sh/frontend'
  },

  // 4. Routing & SSR
  {
    id: 'meta-frameworks-ssr',
    title: 'Server-Side Rendering (SSR) & Meta-Frameworks',
    category: 'routing-ssr',
    categoryLabel: 'Phase 4: Routing & Meta-Frameworks',
    frameworkApplicability: 'all',
    importance: 'Recommended',
    estimatedHours: '35 hrs',
    description: 'Fullstack JavaScript frameworks, file-system routing, server components, streaming hydration, and edge rendering.',
    keyConcepts: ['SSR vs SSG vs ISR vs Islands', 'Server actions & API handlers', 'Hydration mismatches & progressive hydration', 'Edge deployment (Cloudflare, Vercel, Node)'],
    frameworkSpecifics: {
      react: 'Next.js 15 (App Router, React Server Components) or Remix (web standards, nested routes).',
      angular: 'Angular SSR with hydration, event replay, and Analog.js for Vite.',
      vue: 'Nuxt 3 with Nitro engine, auto-imports, and server engine presets.',
      svelte: 'SvelteKit with universal load functions, form actions, and adapters.'
    },
    resourceLink: 'https://nextjs.org'
  },

  // 5. Testing & Quality
  {
    id: 'testing-quality',
    title: 'Testing Suite: Unit, Component & E2E',
    category: 'testing',
    categoryLabel: 'Phase 5: Testing & QA',
    frameworkApplicability: 'all',
    importance: 'Essential',
    estimatedHours: '25 hrs',
    description: 'Writing resilient automated tests that test user behavior rather than implementation details.',
    keyConcepts: ['Unit testing with Vitest / Jest', 'Testing Library component DOM queries', 'Mocking HTTP requests (MSW)', 'End-to-End testing with Playwright'],
    resourceLink: 'https://playwright.dev'
  },

  // 6. Performance & Build
  {
    id: 'performance-build',
    title: 'Performance Optimization & Modern Build Tooling',
    category: 'advanced',
    categoryLabel: 'Phase 6: Performance & Tooling',
    frameworkApplicability: 'all',
    importance: 'Recommended',
    estimatedHours: '20 hrs',
    description: 'Vite, esbuild, code splitting, dynamic imports, Core Web Vitals (LCP, INP, CLS), and bundle analysis.',
    keyConcepts: ['Vite rollup chunks & tree shaking', 'Dynamic imports & route lazy loading', 'Core Web Vitals (INP, LCP, CLS)', 'Memory leaks & DOM node counts'],
    resourceLink: 'https://web.dev/vitals/'
  }
];
