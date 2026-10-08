import { FrameworkData, FrameworkId, CodeComparisonTask, BenchmarkMetric } from '../types/framework';

export const FRAMEWORKS_DATA: Record<FrameworkId, FrameworkData> = {
  react: {
    id: 'react',
    name: 'React',
    tagline: 'The library for web and native user interfaces',
    badge: 'Most Popular & Ecosystem Leader',
    highlightQuote: 'Best for flexibility and large ecosystems, making it the top choice for complex single-page apps and job market demand.',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    brandColor: '#61DAFB',
    gradient: 'from-cyan-500/20 via-sky-500/10 to-blue-900/30',
    accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
    bgGlow: 'rgba(97, 218, 251, 0.15)',
    textColor: 'text-cyan-400',
    releaseYear: 2013,
    creator: 'Jordan Walke (Meta / Facebook)',
    maintainer: 'Meta & Open Source Community',
    license: 'MIT',
    reactivityModel: 'Explicit Hook-based Re-renders (useState, useReducer, Fiber Reconciler)',
    renderingStrategy: 'Virtual DOM with incremental Fiber reconciliation, Server Components (RSC)',
    bundleSizeMinGzip: '42.6 KB (React + ReactDOM)',
    bundleSizeBytes: 43620,
    githubStars: '228k+',
    starsCount: 228000,
    weeklyDownloads: '23.4M',
    downloadsCount: 23400000,
    learningCurve: 'Moderate',
    jobDemand: 'Very High (Dominant)',
    avgSalaryUS: '$135,000 / yr',
    metaFrameworks: [
      { name: 'Next.js', desc: 'The leading fullstack React framework with App Router & RSC', url: 'https://nextjs.org' },
      { name: 'Remix', desc: 'Focuses on web standards, nested routing & loaders', url: 'https://remix.run' },
      { name: 'Astro', desc: 'Islands architecture for content-driven web apps', url: 'https://astro.build' }
    ],
    keyStrengths: [
      'Vast, unparalleled ecosystem with thousands of battle-tested packages',
      'High job market liquidity across startups, scale-ups, and FAANG',
      'Unopinionated flexibility: compose architecture to match custom business needs',
      'React Native unlocks shared codebases across iOS, Android, and Web',
      'Strong backward compatibility and massive documentation corpus'
    ],
    tradeoffs: [
      'Requires assembling routing, state, and styling stack manually',
      'Re-rendering gotchas (hooks dependency array, memoization with useMemo/useCallback)',
      'Virtual DOM overhead compared to modern compiled frameworks'
    ],
    enterpriseAdoption: [
      { company: 'Meta / Facebook', logo: 'https://www.google.com/s2/favicons?domain=meta.com&sz=64', useCase: 'Core feed, Messenger, Instagram Web & Ads Manager' },
      { company: 'Netflix', logo: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64', useCase: 'Desktop streaming app & TV interface orchestration' },
      { company: 'Airbnb', logo: 'https://www.google.com/s2/favicons?domain=airbnb.com&sz=64', useCase: 'Search, listing management & design system architecture' },
      { company: 'Uber', logo: 'https://www.google.com/s2/favicons?domain=uber.com&sz=64', useCase: 'Rider web app, freight tracking & Base Web design system' }
    ],
    architectureSummary: 'Component tree evaluated on state changes. JSX produces virtual DOM nodes; Fiber scheduler diffs mutations in background lanes and commits atomic DOM updates.',
    ecosystemHighlights: [
      { category: 'State Management', tool: 'Zustand, Redux Toolkit, TanStack Query, Jotai' },
      { category: 'Routing', tool: 'React Router v7, TanStack Router' },
      { category: 'UI Components', tool: 'Tailwind CSS, Radix UI, shadcn/ui, MUI' },
      { category: 'Data Fetching', tool: 'TanStack Query (React Query), SWR, RTK Query' }
    ]
  },
  angular: {
    id: 'angular',
    name: 'Angular',
    tagline: 'The modern web developer’s platform for enterprise applications',
    badge: 'Enterprise Architecture & Batteries Included',
    highlightQuote: 'Opinionated enterprise-grade TypeScript powerhouse with built-in routing, HTTP client, signals reactivity, and dependency injection.',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
    brandColor: '#DD0031',
    gradient: 'from-rose-500/20 via-red-500/10 to-amber-900/30',
    accentBorder: 'border-rose-500/40 hover:border-rose-400',
    bgGlow: 'rgba(221, 0, 49, 0.15)',
    textColor: 'text-rose-400',
    releaseYear: 2016,
    creator: 'Google Engineering Team',
    maintainer: 'Google & Angular Core Team',
    license: 'MIT',
    reactivityModel: 'Signals & RxJS Observables (Fine-grained reactive primitives + Zoneless)',
    renderingStrategy: 'Ahead-of-Time (AOT) Compiled templates with Incremental DOM',
    bundleSizeMinGzip: '62.4 KB (Core + Common + Compiler runtime)',
    bundleSizeBytes: 63890,
    githubStars: '96k+',
    starsCount: 96000,
    weeklyDownloads: '3.6M',
    downloadsCount: 3600000,
    learningCurve: 'Steep',
    jobDemand: 'High (Enterprise)',
    avgSalaryUS: '$130,000 / yr',
    metaFrameworks: [
      { name: 'Angular SSR / Universal', desc: 'Built-in server-side rendering and hydration', url: 'https://angular.dev' },
      { name: 'Analog.js', desc: 'Fullstack meta-framework for Angular powered by Vite', url: 'https://analogjs.org' }
    ],
    keyStrengths: [
      'Complete end-to-end framework: DI, Routing, HTTP, Forms, Testing bundled together',
      'Consistent architectural patterns across large engineering departments',
      'First-class TypeScript integration with strong static type guarantees',
      'High-performance Angular Signals eliminating Zone.js runtime overhead',
      'Enterprise stability backed by Google with rigorous LTS release cycles'
    ],
    tradeoffs: [
      'Steeper initial learning curve (RxJS streams, Dependency Injection, Decorators)',
      'Higher baseline bundle size compared to micro-libraries',
      'Less flexibility to swap out core foundational architectural primitives'
    ],
    enterpriseAdoption: [
      { company: 'Google', logo: 'https://www.google.com/s2/favicons?domain=google.com&sz=64', useCase: 'Google Cloud Console, Google Ads, Firebase Console' },
      { company: 'Microsoft', logo: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=64', useCase: 'Xbox support portal, Office 365 enterprise management' },
      { company: 'Deutsche Bank', logo: 'https://www.google.com/s2/favicons?domain=db.com&sz=64', useCase: 'Trading terminals, wealth portal & regulatory compliance' },
      { company: 'Samsung', logo: 'https://www.google.com/s2/favicons?domain=samsung.com&sz=64', useCase: 'IoT SmartThings cloud portal and partner dashboards' }
    ],
    architectureSummary: 'Modular architecture with Dependency Injection hierarchy. Templates compile to optimized imperative instructions with fine-grained Signal graph updates.',
    ecosystemHighlights: [
      { category: 'State Management', tool: 'Angular Signals, NgRx Store, Akita' },
      { category: 'Routing', tool: '@angular/router (Built-in guards, resolvers, lazy loading)' },
      { category: 'UI Components', tool: 'Angular Material, PrimeNG, Taiga UI' },
      { category: 'Forms & Validation', tool: 'ReactiveForms, FormBuilder, Signals Forms' }
    ]
  },
  vue: {
    id: 'vue',
    name: 'Vue.js',
    tagline: 'The Progressive JavaScript Framework',
    badge: 'Gentle Curve & Exceptional Developer Experience',
    highlightQuote: 'Approachable, performant, and versatile progressive framework with intuitive Single-File Components and fine-grained reactivity.',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    brandColor: '#42B883',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-green-900/30',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    bgGlow: 'rgba(66, 184, 131, 0.15)',
    textColor: 'text-emerald-400',
    releaseYear: 2014,
    creator: 'Evan You',
    maintainer: 'Independent Core Team & Community',
    license: 'MIT',
    reactivityModel: 'Proxy-based Reactive Getters/Setters (ref, reactive, computed, watch)',
    renderingStrategy: 'Compiler-informed Virtual DOM with Block Tree optimization',
    bundleSizeMinGzip: '33.8 KB (Runtime + Compiler)',
    bundleSizeBytes: 34610,
    githubStars: '208k+',
    starsCount: 208000,
    weeklyDownloads: '4.8M',
    downloadsCount: 4800000,
    learningCurve: 'Gentle',
    jobDemand: 'High (Versatile)',
    avgSalaryUS: '$126,000 / yr',
    metaFrameworks: [
      { name: 'Nuxt 3', desc: 'Intuitive full-stack Vue framework with auto-imports and SSR/SSG', url: 'https://nuxt.com' },
      { name: 'VitePress', desc: 'Vite & Vue-powered static site generator for documentation', url: 'https://vitepress.dev' }
    ],
    keyStrengths: [
      'Very gentle learning curve: standard HTML/CSS/JS syntax inside Single-File Components',
      'Dual API: beginner-friendly Options API and scalable Composition API with script setup',
      'Official first-party router (Vue Router) and state store (Pinia) guaranteed in sync',
      'Compiler-informed Virtual DOM optimization skips unchanged static nodes',
      'Outstanding developer experience with Vite, DevTools, and auto-imports'
    ],
    tradeoffs: [
      'Smaller US corporate enterprise job presence compared to React and Angular',
      'Split ecosystem historical transition (Vue 2 to Vue 3 migration legacy)',
      'Community plugins can lag behind React’s bleeding-edge releases'
    ],
    enterpriseAdoption: [
      { company: 'GitLab', logo: 'https://www.google.com/s2/favicons?domain=gitlab.com&sz=64', useCase: 'Entire web platform UI, repository viewer and CI/CD pipelines' },
      { company: 'Nintendo', logo: 'https://www.google.com/s2/favicons?domain=nintendo.com&sz=64', useCase: 'My Nintendo rewards store, account portals & regional microsites' },
      { company: 'Louis Vuitton', logo: 'https://www.google.com/s2/favicons?domain=louisvuitton.com&sz=64', useCase: 'Global e-commerce experience and customized product configurators' },
      { company: 'BMW', logo: 'https://www.google.com/s2/favicons?domain=bmw.com&sz=64', useCase: 'Vehicle configurator web applications and dealer portals' }
    ],
    architectureSummary: 'ES6 Proxy tracks property access and mutations automatically. Single File Components (.vue) compile into optimized render functions with dynamic block hints.',
    ecosystemHighlights: [
      { category: 'State Management', tool: 'Pinia (Official lightweight store), Vuex' },
      { category: 'Routing', tool: 'Vue Router 4 (Official nested routes & transitions)' },
      { category: 'UI Components', tool: 'Vuetify, Element Plus, Shadcn Vue, Naive UI' },
      { category: 'Build Tools', tool: 'Vite (Official build engine), Vitest' }
    ]
  },
  svelte: {
    id: 'svelte',
    name: 'Svelte',
    tagline: 'Cybernetically enhanced web apps with zero runtime overhead',
    badge: 'Fastest Runtime & Zero Virtual DOM',
    highlightQuote: 'Radical compiler approach that shifts work to build time, generating surgical vanilla DOM updates with minimal boilerplate and peak runtime speed.',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg',
    brandColor: '#FF3E00',
    gradient: 'from-orange-500/20 via-amber-500/10 to-red-900/30',
    accentBorder: 'border-orange-500/40 hover:border-orange-400',
    bgGlow: 'rgba(255, 62, 0, 0.15)',
    textColor: 'text-orange-400',
    releaseYear: 2016,
    creator: 'Rich Harris',
    maintainer: 'Svelte Team & Vercel',
    license: 'MIT',
    reactivityModel: 'Svelte 5 Runes ($state, $derived, $effect) compile-time reactive signals',
    renderingStrategy: 'No Virtual DOM: Compiler outputs surgical direct DOM node manipulations',
    bundleSizeMinGzip: '2.1 KB (Minimal runtime shim)',
    bundleSizeBytes: 2150,
    githubStars: '81k+',
    starsCount: 81000,
    weeklyDownloads: '890k',
    downloadsCount: 890000,
    learningCurve: 'Very Gentle',
    jobDemand: 'Growing Rapidly',
    avgSalaryUS: '$132,000 / yr',
    metaFrameworks: [
      { name: 'SvelteKit', desc: 'The official application framework for modern Svelte apps', url: 'https://kit.svelte.dev' }
    ],
    keyStrengths: [
      'Zero Virtual DOM: executes surgical DOM updates with microsecond latency',
      'Extremely concise syntax: write up to 40% less code than equivalent React/Angular',
      'Ultra-tiny baseline bundle size (starts at ~2KB) ideal for bandwidth-constrained devices',
      'Built-in animations, transitions, and scoped CSS right inside .svelte files',
      'Loved by developers: consistently ranked top in developer satisfaction surveys'
    ],
    tradeoffs: [
      'Smaller job market postings compared to the entrenched giant React',
      'Smaller ecosystem: fewer off-the-shelf niche third-party UI widgets',
      'Svelte 5 Runes paradigm shift requires learning new syntax compared to Svelte 4'
    ],
    enterpriseAdoption: [
      { company: 'Apple', logo: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64', useCase: 'Apple Music Web player and internal developer tooling' },
      { company: 'The New York Times', logo: 'https://www.google.com/s2/favicons?domain=nytimes.com&sz=64', useCase: 'High-speed interactive data journalism and visual stories' },
      { company: 'Spotify', logo: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64', useCase: 'Spotify Wrapped dynamic web experiences and artist dashboards' },
      { company: 'Bloomberg', logo: 'https://www.google.com/s2/favicons?domain=bloomberg.com&sz=64', useCase: 'Data-dense financial charting and interactive widgets' }
    ],
    architectureSummary: 'Transforms declarative components during build time into tiny vanilla JS imperative steps that target exact text nodes and element properties without diffing.',
    ecosystemHighlights: [
      { category: 'State Management', tool: 'Svelte 5 Runes ($state), Svelte Stores' },
      { category: 'Routing', tool: 'SvelteKit filesystem routing' },
      { category: 'UI Components', tool: 'Skeleton UI, Flowbite Svelte, Melt UI, bits-ui' },
      { category: 'Testing', tool: 'Vitest, Playwright, @testing-library/svelte' }
    ]
  }
};

export const CODE_TASKS: CodeComparisonTask[] = [
  {
    id: 'counter',
    title: 'Reactive Counter with Step & Reset',
    description: 'Basic state declaration, handling user clicks, and dynamic DOM binding.',
    difficulty: 'Beginner',
    snippets: {
      react: {
        frameworkId: 'react',
        language: 'tsx',
        linesOfCode: 15,
        explanation: 'Uses useState hook with explicit updater function. State updates trigger component re-render.',
        code: `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-box">
      <p>Count: {count}</p>
      <div className="btn-group">
        <button onClick={() => setCount(c => c - 1)}>-</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(c => c + 1)}>+</button>
      </div>
    </div>
  );
}`
      },
      angular: {
        frameworkId: 'angular',
        language: 'typescript',
        linesOfCode: 22,
        explanation: 'Uses modern Angular Signals signal(0). Clean template syntax with parentheses (click) event binding.',
        code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <div class="counter-box">
      <p>Count: {{ count() }}</p>
      <div class="btn-group">
        <button (click)="count.update(n => n - 1)">-</button>
        <button (click)="count.set(0)">Reset</button>
        <button (click)="count.update(n => n + 1)">+</button>
      </div>
    </div>
  \`
})
export class CounterComponent {
  count = signal(0);
}`
      },
      vue: {
        frameworkId: 'vue',
        language: 'vue',
        linesOfCode: 16,
        explanation: 'Vue 3 <script setup> with ref(). In template, ref is automatically unwrapped without .value.',
        code: `<script setup>
import { ref } from 'vue';

const count = ref(0);
const reset = () => count.value = 0;
</script>

<template>
  <div class="counter-box">
    <p>Count: {{ count }}</p>
    <div class="btn-group">
      <button @click="count--">-</button>
      <button @click="reset">Reset</button>
      <button @click="count++">+</button>
    </div>
  </div>
</template>`
      },
      svelte: {
        frameworkId: 'svelte',
        language: 'svelte',
        linesOfCode: 13,
        explanation: 'Svelte 5 Runes using $state(0). Cleanest syntax: direct assignment count++ without any wrapper.',
        code: `<script>
  let count = $state(0);
</script>

<div class="counter-box">
  <p>Count: {count}</p>
  <div class="btn-group">
    <button onclick={() => count--}>-</button>
    <button onclick={() => count = 0}>Reset</button>
    <button onclick={() => count++}>+</button>
  </div>
</div>`
      }
    }
  },
  {
    id: 'form-binding',
    title: 'Two-Way Form Binding & Validation',
    description: 'Controlled text inputs, password masking toggle, and dynamic error state.',
    difficulty: 'Intermediate',
    snippets: {
      react: {
        frameworkId: 'react',
        language: 'tsx',
        linesOfCode: 24,
        explanation: 'Manual controlled input with value={email} and onChange={(e) => setEmail(e.target.value)}.',
        code: `import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const isValid = email.includes('@') && email.includes('.');

  return (
    <form onSubmit={(e) => { e.preventDefault(); alert(email); }}>
      <label>Email Address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="alex@domain.com"
      />
      {!isValid && email && (
        <span className="error">Please enter a valid email</span>
      )}
      <button disabled={!isValid}>Submit</button>
    </form>
  );
}`
      },
      angular: {
        frameworkId: 'angular',
        language: 'typescript',
        linesOfCode: 28,
        explanation: 'Banana-in-a-box [(ngModel)] for two-way binding or ReactiveForms with FormControl validators.',
        code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <form (ngSubmit)="onSubmit()">
      <label>Email Address</label>
      <input
        [(ngModel)]="email"
        name="email"
        type="email"
        placeholder="alex@domain.com"
      />
      @if (!isValid() && email) {
        <span class="error">Please enter a valid email</span>
      }
      <button [disabled]="!isValid()">Submit</button>
    </form>
  \`
})
export class LoginFormComponent {
  email = '';
  isValid() { return this.email.includes('@') && this.email.includes('.'); }
  onSubmit() { alert(this.email); }
}`
      },
      vue: {
        frameworkId: 'vue',
        language: 'vue',
        linesOfCode: 20,
        explanation: 'v-model directive provides out-of-the-box two-way reactive binding.',
        code: `<script setup>
import { ref, computed } from 'vue';

const email = ref('');
const isValid = computed(() => email.value.includes('@') && email.value.includes('.'));
const onSubmit = () => alert(email.value);
</script>

<template>
  <form @submit.prevent="onSubmit">
    <label>Email Address</label>
    <input v-model="email" type="email" placeholder="alex@domain.com" />
    <span v-if="!isValid && email" class="error">Please enter a valid email</span>
    <button :disabled="!isValid">Submit</button>
  </form>
</template>`
      },
      svelte: {
        frameworkId: 'svelte',
        language: 'svelte',
        linesOfCode: 18,
        explanation: 'bind:value={email} creates immediate two-way synchronization with zero ceremony.',
        code: `<script>
  let email = $state('');
  let isValid = $derived(email.includes('@') && email.includes('.'));

  function handleSubmit(e) {
    e.preventDefault();
    alert(email);
  }
</script>

<form onsubmit={handleSubmit}>
  <label for="email">Email Address</label>
  <input id="email" bind:value={email} type="email" placeholder="alex@domain.com" />
  {#if !isValid && email}
    <span class="error">Please enter a valid email</span>
  {/if}
  <button disabled={!isValid}>Submit</button>
</form>`
      }
    }
  },
  {
    id: 'fetch-data',
    title: 'Async API Fetch with Loading & Error States',
    description: 'Fetching user list from REST API with loading indicator, error handling, and refresh.',
    difficulty: 'Intermediate',
    snippets: {
      react: {
        frameworkId: 'react',
        language: 'tsx',
        linesOfCode: 32,
        explanation: 'useEffect hook manages fetch lifecycle. In production, React developers usually use TanStack Query.',
        code: `import { useState, useEffect } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://dummyjson.com/users?limit=3');
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="err">{error}</p>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.firstName} {u.lastName}</li>)}
    </ul>
  );
}`
      },
      angular: {
        frameworkId: 'angular',
        language: 'typescript',
        linesOfCode: 34,
        explanation: 'Injects HttpClient with RxJS observable or modern httpResource / Signals.',
        code: `import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  template: \`
    @if (loading()) {
      <p>Loading users...</p>
    } @else if (error()) {
      <p class="err">{{ error() }}</p>
    } @else {
      <ul>
        @for (u of users(); track u.id) {
          <li>{{ u.firstName }} {{ u.lastName }}</li>
        }
      </ul>
    }
  \`
})
export class UserListComponent {
  private http = inject(HttpClient);
  // Uses RxJS stream piped directly to Signal
  users$ = this.http.get<any>('https://dummyjson.com/users?limit=3');
}`
      },
      vue: {
        frameworkId: 'vue',
        language: 'vue',
        linesOfCode: 26,
        explanation: 'onMounted hook with async/await, or VueUse useFetch composable.',
        code: `<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const loading = ref(true);
const error = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const res = await fetch('https://dummyjson.com/users?limit=3');
    const data = await res.json();
    users.value = data.users;
  } catch (err) {
    error.value = 'Failed to load';
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>

<template>
  <p v-if="loading">Loading...</p>
  <p v-else-if="error" class="err">{{ error }}</p>
  <ul v-else>
    <li v-for="u in users" :key="u.id">{{ u.firstName }} {{ u.lastName }}</li>
  </ul>
</template>`
      },
      svelte: {
        frameworkId: 'svelte',
        language: 'svelte',
        linesOfCode: 19,
        explanation: 'Svelte has native {#await promise} syntax directly in templates! Eliminates manual state flags.',
        code: `<script>
  let promise = fetchUsers();

  async function fetchUsers() {
    const res = await fetch('https://dummyjson.com/users?limit=3');
    const data = await res.json();
    return data.users;
  }
</script>

{#await promise}
  <p>Loading users...</p>
{:then users}
  <ul>
    {#each users as u (u.id)}
      <li>{u.firstName} {u.lastName}</li>
    {/each}
  </ul>
{:catch error}
  <p class="err">{error.message}</p>
{/await}`
      }
    }
  },
  {
    id: 'derived-state',
    title: 'Derived / Computed State Calculation',
    description: 'Calculating cart total, discount, tax, and item count from raw array.',
    difficulty: 'Beginner',
    snippets: {
      react: {
        frameworkId: 'react',
        language: 'tsx',
        linesOfCode: 18,
        explanation: 'useMemo caches expensive calculations between renders until dependencies change.',
        code: `import { useState, useMemo } from 'react';

export default function CartSummary() {
  const [items] = useState([
    { id: 1, name: 'Pro License', price: 99 },
    { id: 2, name: 'Cloud Hosting', price: 29 }
  ]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const tax = useMemo(() => subtotal * 0.1, [subtotal]);
  const total = subtotal + tax;

  return <div>Total: \${total.toFixed(2)} (Tax: \${tax.toFixed(2)})</div>;
}`
      },
      angular: {
        frameworkId: 'angular',
        language: 'typescript',
        linesOfCode: 20,
        explanation: 'computed() signal automatically tracks dependencies in its execution function and caches result.',
        code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  template: \`
    <div>Total: \${{ total().toFixed(2) }} (Tax: \${{ tax().toFixed(2) }})</div>
  \`
})
export class CartSummaryComponent {
  items = signal([
    { id: 1, name: 'Pro License', price: 99 },
    { id: 2, name: 'Cloud Hosting', price: 29 }
  ]);

  subtotal = computed(() => this.items().reduce((s, i) => s + i.price, 0));
  tax = computed(() => this.subtotal() * 0.1);
  total = computed(() => this.subtotal() + this.tax());
}`
      },
      vue: {
        frameworkId: 'vue',
        language: 'vue',
        linesOfCode: 17,
        explanation: 'computed() returns a read-only reactive ref that only re-computes when dependencies change.',
        code: `<script setup>
import { ref, computed } from 'vue';

const items = ref([
  { id: 1, name: 'Pro License', price: 99 },
  { id: 2, name: 'Cloud Hosting', price: 29 }
]);

const subtotal = computed(() => items.value.reduce((s, i) => s + i.price, 0));
const tax = computed(() => subtotal.value * 0.1);
const total = computed(() => subtotal.value + tax.value);
</script>

<template>
  <div>Total: \${{ total.toFixed(2) }} (Tax: \${{ tax.toFixed(2) }})</div>
</template>`
      },
      svelte: {
        frameworkId: 'svelte',
        language: 'svelte',
        linesOfCode: 14,
        explanation: 'Svelte 5 $derived rune calculates reactive values with automatic dependency tracking.',
        code: `<script>
  let items = $state([
    { id: 1, name: 'Pro License', price: 99 },
    { id: 2, name: 'Cloud Hosting', price: 29 }
  ]);

  let subtotal = $derived(items.reduce((s, i) => s + i.price, 0));
  let tax = $derived(subtotal * 0.1);
  let total = $derived(subtotal + tax);
</script>

<div>Total: \${total.toFixed(2)} (Tax: \${tax.toFixed(2)})</div>`
      }
    }
  }
];

export const BENCHMARK_METRICS: BenchmarkMetric[] = [
  {
    metric: 'Gzipped Bundle Size',
    unit: 'KB',
    higherIsBetter: false,
    description: 'Baseline minimal production bundle size for Hello World application.',
    values: {
      react: 42.6,
      angular: 62.4,
      vue: 33.8,
      svelte: 2.1
    },
    formatted: {
      react: '42.6 KB',
      angular: '62.4 KB',
      vue: '33.8 KB',
      svelte: '2.1 KB'
    }
  },
  {
    metric: 'Weekly NPM Downloads',
    unit: 'Millions',
    higherIsBetter: true,
    description: 'Weekly ecosystem package downloads reflecting industry adoption and active projects.',
    values: {
      react: 23.4,
      angular: 3.6,
      vue: 4.8,
      svelte: 0.89
    },
    formatted: {
      react: '23.4M / wk',
      angular: '3.6M / wk',
      vue: '4.8M / wk',
      svelte: '890k / wk'
    }
  },
  {
    metric: 'GitHub Stars',
    unit: 'k Stars',
    higherIsBetter: true,
    description: 'Developer appreciation and open-source traction on GitHub.',
    values: {
      react: 228,
      angular: 96,
      vue: 208,
      svelte: 81
    },
    formatted: {
      react: '228k ★',
      angular: '96k ★',
      vue: '208k ★',
      svelte: '81k ★'
    }
  },
  {
    metric: 'DOM Create 1,000 Rows',
    unit: 'ms',
    higherIsBetter: false,
    description: 'Krausest JS Web Framework Benchmark: Time to construct and append 1,000 table rows.',
    values: {
      react: 38.2,
      angular: 34.6,
      vue: 32.1,
      svelte: 28.4
    },
    formatted: {
      react: '38.2 ms',
      angular: '34.6 ms',
      vue: '32.1 ms',
      svelte: '28.4 ms'
    }
  },
  {
    metric: 'Memory Usage (1k Rows)',
    unit: 'MB',
    higherIsBetter: false,
    description: 'Browser heap memory allocated after rendering 1,000 table elements.',
    values: {
      react: 4.8,
      angular: 5.4,
      vue: 3.9,
      svelte: 2.6
    },
    formatted: {
      react: '4.8 MB',
      angular: '5.4 MB',
      vue: '3.9 MB',
      svelte: '2.6 MB'
    }
  },
  {
    metric: 'US Dev Job Market Share',
    unit: '%',
    higherIsBetter: true,
    description: 'Share of frontend developer job openings listing this framework as required or preferred.',
    values: {
      react: 58,
      angular: 24,
      vue: 14,
      svelte: 4
    },
    formatted: {
      react: '58% of jobs',
      angular: '24% of jobs',
      vue: '14% of jobs',
      svelte: '4% (fastest growing)'
    }
  }
];

export const DECISION_QUESTIONS = [
  {
    id: 'scale',
    question: 'What is the scale and architectural scope of your application?',
    subtitle: 'Kellton & Pennine architecture evaluation factor #1',
    options: [
      {
        label: 'Large Enterprise Platform with 20+ Distributed Developers',
        description: 'Need strict conventions, rigid architecture, dependency injection, and standardized style guides.',
        points: { react: 6, angular: 10, vue: 6, svelte: 4 }
      },
      {
        label: 'Complex Single-Page App with High Job Market / Hiring Needs',
        description: 'Rapidly evolving product requiring huge third-party ecosystem and deep candidate pool.',
        points: { react: 10, angular: 6, vue: 6, svelte: 5 }
      },
      {
        label: 'Medium Business Application or Fast-Paced Startup SaaS',
        description: 'Need fast time-to-market, clean readable code, and minimal boilerplate.',
        points: { react: 8, angular: 5, vue: 10, svelte: 8 }
      },
      {
        label: 'Ultra-Performance Critical, Embedded or Content Heavy Site',
        description: 'Every kilobyte matters, battery efficiency, fast first contentful paint on mobile.',
        points: { react: 4, angular: 3, vue: 7, svelte: 10 }
      }
    ]
  },
  {
    id: 'team_background',
    question: 'What is your engineering team’s primary technical background?',
    subtitle: 'Human capital and ramp-up velocity',
    options: [
      {
        label: 'Java, C#, .NET or Object-Oriented Backend Engineers',
        description: 'Accustomed to TypeScript, decorators, dependency injection, and modular enterprise architecture.',
        points: { react: 4, angular: 10, vue: 6, svelte: 4 }
      },
      {
        label: 'Modern JavaScript / TypeScript specialists familiar with Functional Programming',
        description: 'Comfortable with hooks, closures, immutability, and JSX syntax.',
        points: { react: 10, angular: 5, vue: 8, svelte: 7 }
      },
      {
        label: 'Generalist Web Developers (HTML, CSS, jQuery or beginner devs)',
        description: 'Prefer standard HTML templates, CSS scoped blocks, and gentle learning curve.',
        points: { react: 5, angular: 3, vue: 10, svelte: 9 }
      },
      {
        label: 'Minimalist Developers who value clean syntax and zero boilerplate',
        description: 'Despise useEffect dependency arrays and complex boilerplate wrappers.',
        points: { react: 3, angular: 2, vue: 7, svelte: 10 }
      }
    ]
  },
  {
    id: 'batteries',
    question: 'How do you prefer framework tooling and governance?',
    subtitle: 'Ecosystem philosophy: Opinionated framework vs Flexible library',
    options: [
      {
        label: 'Batteries Included: One official way for Routing, HTTP, State, and Testing',
        description: 'Google-curated stack so teams do not waste sprints debating libraries.',
        points: { react: 3, angular: 10, vue: 8, svelte: 6 }
      },
      {
        label: 'Maximum Freedom & Infinite Libraries: Pick best-of-breed packages',
        description: 'Want flexibility to choose Zustand, TanStack Router, Tailwind, or Radix UI as needed.',
        points: { react: 10, angular: 3, vue: 7, svelte: 6 }
      },
      {
        label: 'Cohesive Core: Official router & store, but friendly open ecosystem',
        description: 'Best of both worlds: official Vue Router/Pinia with frictionless community plugins.',
        points: { react: 7, angular: 6, vue: 10, svelte: 7 }
      },
      {
        label: 'Compiler Simplicity: Built-in reactivity, animations & transitions in the language',
        description: 'No external animation libraries or complex state boilerplate required.',
        points: { react: 4, angular: 4, vue: 7, svelte: 10 }
      }
    ]
  },
  {
    id: 'mobile_crossplatform',
    question: 'Do you plan to share code with native mobile apps (iOS & Android)?',
    subtitle: 'Cross-platform multi-device strategy',
    options: [
      {
        label: 'Yes, heavy multi-platform sharing via native runtime (React Native)',
        description: 'Massive advantage of React ecosystem: sharing business logic with React Native.',
        points: { react: 10, angular: 3, vue: 4, svelte: 4 }
      },
      {
        label: 'Progressive Web App (PWA) or Capacitor / WebView hybrid app',
        description: 'Works smoothly with all modern web frameworks.',
        points: { react: 8, angular: 8, vue: 9, svelte: 9 }
      },
      {
        label: 'Web-only, no mobile app required',
        description: 'Focus solely on desktop & mobile browser experience.',
        points: { react: 7, angular: 7, vue: 8, svelte: 8 }
      }
    ]
  }
];
