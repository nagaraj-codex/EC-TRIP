import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MONITORING_DIR = path.join(ROOT_DIR, 'data', 'monitoring');
const STATUS_FILE = path.join(MONITORING_DIR, 'park_source_status.json');
const CHANGELOG_FILE = path.join(MONITORING_DIR, 'changelog.json');

const USER_AGENT = 'QueueCut-ParkMonitor/1.0 (+https://github.com/nagaraj-codex/EC-TRIP)';
const REQUEST_TIMEOUT_MS = 12000;

const MONITORED_PARKS = [
  {
    id: 'wonderla-chennai',
    name: 'Wonderla Amusement Park Chennai',
    officialWebsite: 'https://www.wonderla.com/',
    sources: [
      {
        category: 'operating_hours_and_notices',
        url: 'https://www.wonderla.com/chennai/'
      },
      {
        category: 'offers_and_terms',
        url: 'https://www.wonderla.com/offers'
      }
    ]
  },
  {
    id: 'black-thunder-mettupalayam',
    name: 'Black Thunder Water Theme Park (Coimbatore / Mettupalayam)',
    officialWebsite: 'https://www.blackthunder.in/',
    sources: [
      {
        category: 'daily_hours_and_advisories',
        url: 'https://www.blackthunder.in/'
      },
      {
        category: 'tariff_and_pricing',
        url: 'https://www.blackthunder.in/tariff/'
      },
      {
        category: 'rides_and_attractions',
        url: 'https://www.blackthunder.in/rides/'
      }
    ]
  },
  {
    id: 'mgm-dizzee-chennai',
    name: 'MGM Dizzee World Chennai',
    officialWebsite: 'https://www.mgmdizzeeworld.com/',
    sources: [
      {
        category: 'park_overview_and_hours',
        url: 'https://www.mgmdizzeeworld.com/'
      },
      {
        category: 'tickets_and_pricing',
        url: 'https://www.mgmdizzeeworld.com/tickets/'
      },
      {
        category: 'rides_and_regulations',
        url: 'https://www.mgmdizzeeworld.com/rides/'
      }
    ]
  }
];

const SCAN_KEYWORDS = [
  'closure', 'closed', 'maintenance', 'renovation', 'timing', 'timings',
  'hours', 'price', 'pricing', 'tariff', 'offer', 'discount', 'advisory',
  'rules', 'dress code', 'synthetic', 'gst', 'fastrack', 'water ride'
];

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow'
    });
    const text = await res.text();
    const duration = Date.now() - startTime;
    return {
      ok: res.ok,
      status: res.status,
      durationMs: duration,
      headers: {
        lastModified: res.headers.get('last-modified'),
        etag: res.headers.get('etag'),
        contentType: res.headers.get('content-type')
      },
      text
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    return {
      ok: false,
      status: 0,
      durationMs: duration,
      error: err.name === 'AbortError' ? 'Request timed out' : err.message,
      headers: {},
      text: ''
    };
  } finally {
    clearTimeout(timer);
  }
}

function computeHash(text) {
  if (!text) return null;
  // Normalize whitespace to prevent false alarms on trivial formatting changes
  const normalized = text.replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

function findKeywords(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return SCAN_KEYWORDS.filter(kw => lower.includes(kw));
}

function extractTitle(html) {
  if (!html) return null;
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim().replace(/\s+/g, ' ') : null;
}

export async function runMonitoring() {
  const now = new Date().toISOString();
  console.log(`[ParkMonitor] Starting official source verification at ${now}`);

  if (!fs.existsSync(MONITORING_DIR)) {
    fs.mkdirSync(MONITORING_DIR, { recursive: true });
  }

  let previousStatus = {};
  if (fs.existsSync(STATUS_FILE)) {
    try {
      previousStatus = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    } catch {
      previousStatus = {};
    }
  }

  let changelog = [];
  if (fs.existsSync(CHANGELOG_FILE)) {
    try {
      changelog = JSON.parse(fs.readFileSync(CHANGELOG_FILE, 'utf8'));
    } catch {
      changelog = [];
    }
  }

  const results = {
    last_check_utc: now,
    monitor_version: '1.0.0',
    parks_monitored: MONITORED_PARKS.length,
    total_sources_checked: 0,
    sources_healthy: 0,
    sources_changed: 0,
    sources_unavailable: 0,
    parks: {}
  };

  for (const park of MONITORED_PARKS) {
    console.log(`\nChecking park: ${park.name} (${park.id})`);
    const parkPrevious = previousStatus.parks?.[park.id] || {};
    const checkedSources = [];
    let parkHasError = false;

    for (const src of park.sources) {
      results.total_sources_checked++;
      process.stdout.write(`  -> Checking ${src.url} ... `);
      const res = await fetchWithTimeout(src.url, REQUEST_TIMEOUT_MS);
      const hash = res.text ? computeHash(res.text) : null;
      const detectedKeywords = res.text ? findKeywords(res.text) : [];
      const title = extractTitle(res.text);

      const prevSrc = parkPrevious.sources?.find(s => s.url === src.url);
      let status = 'UP';
      let changeNote = null;

      if (!res.ok) {
        status = 'UNAVAILABLE';
        results.sources_unavailable++;
        parkHasError = true;
        console.log(`FAIL (HTTP ${res.status}: ${res.error || 'Server error'})`);
      } else {
        if (!prevSrc) {
          status = 'UP';
          results.sources_healthy++;
          changeNote = 'Initial baseline established';
          console.log(`OK (baseline created, ${res.durationMs}ms)`);
        } else if (prevSrc.content_hash && hash && prevSrc.content_hash !== hash) {
          status = 'CHANGED';
          results.sources_changed++;
          changeNote = `Content hash changed from ${prevSrc.content_hash.slice(0, 8)} to ${hash.slice(0, 8)}`;
          console.log(`CHANGED (${res.durationMs}ms, content update detected)`);
        } else {
          status = 'UP';
          results.sources_healthy++;
          console.log(`OK (verified fresh, ${res.durationMs}ms)`);
        }
      }

      if (changeNote && changeNote !== 'Initial baseline established') {
        changelog.unshift({
          timestamp: now,
          park_id: park.id,
          park_name: park.name,
          source_url: src.url,
          category: src.category,
          change_type: status,
          details: changeNote,
          http_status: res.status
        });
      }

      checkedSources.push({
        category: src.category,
        url: src.url,
        status,
        http_status: res.status,
        duration_ms: res.durationMs,
        title,
        content_hash: hash,
        last_modified_header: res.headers.lastModified || null,
        etag: res.headers.etag || null,
        keywords_detected: detectedKeywords,
        error: res.error || null,
        last_verified_utc: now
      });
    }

    results.parks[park.id] = {
      park_name: park.name,
      official_website: park.officialWebsite,
      freshness: parkHasError ? 'DEGRADED' : 'FRESH',
      last_checked_utc: now,
      sources: checkedSources
    };
  }

  // Cap changelog at 100 entries to prevent unbounded growth
  if (changelog.length > 100) {
    changelog = changelog.slice(0, 100);
  }

  fs.writeFileSync(STATUS_FILE, JSON.stringify(results, null, 2), 'utf8');
  fs.writeFileSync(CHANGELOG_FILE, JSON.stringify(changelog, null, 2), 'utf8');

  console.log(`\n[ParkMonitor] Verification complete.`);
  console.log(`Total: ${results.total_sources_checked} | Healthy: ${results.sources_healthy} | Changed: ${results.sources_changed} | Unavailable: ${results.sources_unavailable}`);
  console.log(`Results saved to: ${STATUS_FILE}`);
  return results;
}

// Direct execution support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMonitoring().catch(err => {
    console.error('Fatal monitoring error:', err);
    process.exit(1);
  });
}
