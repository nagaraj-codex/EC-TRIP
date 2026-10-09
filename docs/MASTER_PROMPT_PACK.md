<USER_REQUEST>
# QUEUECUT â€” MASTER REVIEW, REPAIR & UPGRADE PROMPT

> **How to use this file**
> 1. Create a new git branch first: `git checkout -b chore/master-cleanup`.
> 2. **Agent tools** (Claude Code, Cursor agent, Copilot agent mode, Windsurf): paste everything between `BEGIN PROMPT` and `END PROMPT`. They can read files and run commands, so they will work phase by phase on their own.
> 3. **Chat-only AI** (no file access): paste PART A + PART B, then paste ONE phase at a time together with the contents of the files that phase lists. Never paste all phases at once into a chat-only tool; it will lose track.
> 4. After every phase, check the "GATE" at the end of that phase. Do not move on until it passes.

---

## BEGIN PROMPT

# PART A â€” ROLE, MISSION, RULES

You are a senior full-stack engineer (Java 21 / Spring Boot / React / TypeScript / Vite / DevOps). You are working on the repository **QueueCut** located at `J:\QUEUE CUT`.

## A1. Mission (what "done" means)

Leave the repository in this state:

1. **Zero Python.** No `.py`, `.pyc`, `.ipynb`, `requirements.txt`, virtualenv, Python CI step, Python Docker layer, Python README text, or Python editor extension remains anywhere.
2. **Backend builds clean.** `mvnw clean verify` passes with 0 errors and 0 compiler warnings; all tests green.
3. **Frontend builds clean.** `npm ci`, lint, typecheck, test and `vite build` all pass with 0 errors and 0 warnings.
4. **Frontend and backend are in sync.** Every HTTP route, cookie, WebSocket message and error shape is verified end-to-end and documented in one contract file.
5. **Upgrades done** (Phase 8): PostgreSQL, Redis cache, Docker, secrets handling, CI/CD.
6. **Documented.** A new student can clone, configure and run the whole system in 10 minutes using only the README.

## A2. Rules (obey all of them, always)

- **R1 Read before you write.** Open and read every file fully before changing it. Never edit from memory or guess contents.
- **R2 No placeholders.** No `TODO`, `FIXME`, `// ...`, `/* rest unchanged */`, `pass`, empty catch blocks, or stub methods that return fake data. Every function is real and working.
- **R3 Whole files.** When you change a file, output the **complete final file**, not a diff or a fragment. A file may be 500+ lines; that is acceptable if it is clean and focused. If a file grows beyond ~400 lines, check whether it mixes responsibilities and split it by responsibility.
- **R4 Evidence over claims.** After each phase run the GATE commands and paste the real output. If you cannot run a command, write `NOT RUN` with the reason. Never write "should work" or "builds successfully" without showing the output.
- **R5 Do not invent.** If a file, class, route or property named in this prompt does not exist, say `NOT FOUND` and continue. Create it only if the system genuinely needs it, and say why.
- **R6 Preserve behavior.** Do not change behavior except to fix a bug or to implement a requirement in this prompt. List every behavior change in `docs/CHANGELOG-CLEANUP.md`.
- **R7 Secrets.** Never print, log or commit real secrets. Only `.env.example` files with fake values are committed. If a real secret is found in git history, flag it as "ROTATE THIS KEY" and explain how to purge it.
- **R8 Zero budget.** Prefer free tools and free tiers. If any step would cost money, mark it `COSTS MONEY` and offer a free alternative.
- **R9 Windows first.** Commands are given for PowerShell on Windows; bash equivalents are given where useful. The project path contains a space (`QUEUE CUT`), so quote paths in every command and script. Evaluate whether the folder should be renamed (e.g. `QUEUE-CUT`) and record the recommendation, but do not rename it without being told.
- **R10 No suppression.** Do not silence problems with `@SuppressWarnings`, `// eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `any`, unless a comment on the same line explains exactly why it is unavoidable. Fix the root cause instead.
- **R11 Dependencies.** Add a dependency only when needed. Pin explicit versions (or use the Spring Boot BOM). Remove unused ones. State why each new one is needed.
- **R12 Decide, don't stall.** Ask the user a question only if you are blocked. Otherwise choose the best option, and record the decision (what, why, alternatives) in `docs/DECISIONS.md`.
- **R13 Small commits.** One logical change per commit, with a clear message (`chore(python): remove legacy Python tree`, `fix(api): ...`, `feat(web): ...`).
- **R14 Stop at gates.** Do not start the next phase until the current GATE passes and its output is shown.
- **R15 Track everything.** Maintain `docs/REVIEW_LOG.md`: a table of every file in the repo with columns `Path | Phase | Reviewed | Changed | Tested | Notes`. Every file must end the job with `Reviewed = yes`.

## A3. The per-file review protocol (apply to EVERY file)

For each file, in this order:

1. **Header:** path, purpose in one sentence, who calls it / what it calls.
2. **Checklist** (see PART D for the universal checklist, plus the file-specific requirements in the phase).
3. **Findings table:** `ID | Severity (blocker/high/medium/low) | Line | Problem | Fix`.
4. **Complete corrected file** (or the line `NO CHANGES NEEDED` with a one-line justification).
5. **Verification:** the command or test that proves the file works.
6. Update `docs/REVIEW_LOG.md`.

---

# PART B â€” GROUND TRUTH ABOUT THE PROJECT

## B1. Product

QueueCut is a theme-park planning and telemetry platform. It tells users the best day to visit, predicts queue times, calculates whether a FastTrack / skip-the-line pass is worth buying, and pushes live weather, crowd level and connection status to the dashboard.

## B2. Modules

| Module | What it does |
|---|---|
| Authentication | Email/password + Google OAuth, secure HTTP-only session cookies, "Guest Mode" preview for logged-out users |
| Intelligence Engine | Scores candidate dates from weather forecast + public holidays + weekend heuristics â†’ `visit_score` and predicted wait times |
| Live Telemetry | Spring WebSockets broadcast weather, crowd estimate and connection status to React clients |
| FastTrack ROI | UI calculator: is the pass worth it, given predicted wait and the user's value of time |
| Parks catalog & trips | `unified_parks_catalog.json` serves park metadata; users save and track planned trips |

## B3. Stack (as currently stated; verify against the real files)

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS ("3.4 using v4 syntax" â€” see Known Issue K1), Zustand, Lucide React, Mapbox GL JS |
| Backend | Java 21, Spring Boot 3.3.4, Spring Security, Spring WebSockets, Spring Data JPA, Jackson |
| Database | SQLite (embedded, JDBC) â†’ PostgreSQL (Phase 8) |
| External APIs | Open-Meteo (weather), Nager.Date (public holidays) |
| Planned | Redis (Spring Cache), Docker + docker-compose, secrets manager, GitHub Actions (`deploy.yml` exists) |

## B4. Repository layout (as stated; verify with a real tree listing in Phase 0)

```
J:\QUEUE CUT\
â”œâ”€â”€ apps\
â”‚   â”œâ”€â”€ api\            Spring Boot backend
â”‚   â”‚   â”œâ”€â”€ pom.xml
â”‚   â”‚   â””â”€â”€ src\main\java\com\queuecut\api\
â”‚   â”‚       â”œâ”€â”€ config\ controller\ entity\ repository\ service\
â”‚   â””â”€â”€ web\            React + Vite frontend
â”‚       â”œâ”€â”€ package.json
â”‚       â””â”€â”€ src\ components\ features\ layouts\ pages\ store\ styles\
â”œâ”€â”€ data\               JSON catalogs, offline datasets
â”œâ”€â”€ docs\
â””â”€â”€ README.md
```

## B5. Known issues from the previous audit (verify each is really fixed; fix if not)

- **K1 â€” Tailwind version mismatch.** `tailwindcss` 3.4 is installed but the CSS uses v4 syntax (`@import "tailwindcss"`, `@theme`). That combination does not work. **Decision to implement:** upgrade to Tailwind v4 with the `@tailwindcss/vite` plugin (see Phase 5). Remove `postcss.config.*`, `autoprefixer` and `tailwind.config.js` unless still required. Confirm the plugin's peer dependency supports the installed Vite version before installing.
- **K2 â€” Null-safety.** `@NonNull` was added file by file. Replace the patchwork with package-level `@NonNullApi` / `@NonNullFields` (`package-info.java`) and explicit `@Nullable` where null is legitimate. Zero compiler warnings is required.
- **K3 â€” Double autoboxing in `TelemetryController`.** Replace boxed `Double` with primitives or explicit `@Nullable Double` + defined fallbacks.
- **K4 â€” Google login.** `/api/v1/auth/google/login` now redirects to a **hard-coded** `http://localhost:5173/login?error=google_not_configured`. Move the frontend URL to a property (`app.frontend-url`) and make the whole OAuth flow correct (see Phase 3, AuthController).
- **K5 â€” Auth desync risk.** `authStore.ts` and `apiClient.ts` must agree on cookie handling and the 401 flow (see Phase 5).
- **K6 â€” Secrets.** `.env` files are used locally. Verify none are committed; add `.env.example`.
- **K7 â€” AWS Secrets Manager is not free after its trial.** For a zero-budget project, specify free alternatives (see Phase 8.4).
- **K8 â€” Python remnants.** The backend was migrated from Python; legacy files may still exist (see Phase 1).

---

# PART C â€” EXECUTION PHASES

Work strictly in order. Phases 0â€“7 must work on the **current stack (SQLite)** before you start the infrastructure upgrades in Phase 8. This keeps problems isolated: first make it correct, then make it scalable.

---

## PHASE 0 â€” INVENTORY & SAFETY NET

**Goal:** know exactly what exists before touching anything.

**Steps**

1. Confirm you are on a clean branch: `git status`, `git branch --show-current`. Commit or stash anything pending.
2. Produce a full tree, excluding noise:
   ```powershell
   cd "J:\QUEUE CUT"
   git ls-files | Sort-Object > docs\_inventory_tracked.txt
   Get-ChildItem -Recurse -Force -File |
     Where-Object { $_.FullName -notmatch '\\(node_modules|\.git|target|dist)\\' } |
     Select-Object -ExpandProperty FullName | Sort-Object > docs\_inventory_all.txt
   ```
   ```bash
   git ls-files | sort > docs/_inventory_tracked.txt
   find . -type f -not -path '*/node_modules/*' -not -path './.git/*' -not -path '*/target/*' -not -path '*/dist/*' | sort > docs/_inventory_all.txt
   ```
3. Record versions: `java -version`, `javac -version`, `mvn -v` (or `.\mvnw.cmd -v`), `node -v`, `npm -v`, `git --version`, `docker --version`.
4. Run the **baseline** and save the output (it will probably fail; that is the point):
   ```powershell
   cd "J:\QUEUE CUT\apps\api";  .\mvnw.cmd -B -ntp clean verify  2>&1 | Tee-Object ..\..\docs\_baseline_api.txt
   cd "J:\QUEUE CUT\apps\web";  npm ci; npm run build 2>&1 | Tee-Object ..\..\docs\_baseline_web.txt
   ```
   If `mvnw.cmd` does not exist, generate the wrapper: `mvn -N wrapper:wrapper -Dmaven=3.9.9`.
5. Create `docs/REVIEW_LOG.md` listing **every tracked file** with `Reviewed = no`.
6. Create `docs/DECISIONS.md` and `docs/CHANGELOG-CLEANUP.md` (empty headers).
7. Classify every file as one of: `backend-java`, `backend-resource`, `frontend-src`, `frontend-config`, `data`, `docs`, `infra`, `python-legacy`, `junk`.

**GATE 0:** the inventory files exist, the baseline outputs are saved, and `REVIEW_LOG.md` covers 100% of tracked files. Show a count summary by classification.

---

## PHASE 1 â€” COMPLETE PYTHON REMOVAL

**Goal:** no Python anywhere, with no loss of needed behavior.

### 1.1 Find everything Python

```powershell
# files
Get-ChildItem -Recurse -Force -File -Include *.py,*.pyc,*.pyo,*.pyd,*.pyw,*.pyi,*.ipynb -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\(node_modules|\.git)\\' }
# directories
Get-ChildItem -Recurse -Force -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -in '__pycache__','.venv','venv','env','.pytest_cache','.mypy_cache','.ruff_cache','.tox' -or $_.Name -like '*.egg-info' }
# Python project/config files
Get-ChildItem -Recurse -Force -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^(requirements.*\.txt|Pipfile(\.lock)?|pyproject\.toml|poetry\.lock|setup\.(py|cfg)|tox\.ini|pytest\.ini|\.python-version|runtime\.txt|Procfile|\.flake8|\.pylintrc|mypy\.ini|alembic\.ini)$' }
# references inside tracked files
git ls-files | ForEach-Object { Select-String -Path $_ -Pattern 'python|pip install|uvicorn|fastapi|flask|django|pydantic|sqlalchemy|alembic|gunicorn|requirements\.txt|venv|\.py\b' -ErrorAction SilentlyContinue }
```
```bash
git ls-files | grep -Ei '\.(py|pyc|pyo|pyd|pyw|pyi|ipynb)$'
git ls-files | xargs grep -nEi 'python|pip install|uvicorn|fastapi|flask|django|pydantic|sqlalchemy|alembic|gunicorn|requirements\.txt|venv' 2>/dev/null
```

### 1.2 Classify BEFORE deleting (produce this table; no deletion until it is complete)

For every Python file or Python reference found:

| Path | What it did | Already ported to Java/TS? (name the Java class/method) | Action |
|---|---|---|---|

Allowed actions:

- **Delete** â€” logic already exists in Java/TS with equivalent behavior (name where).
- **Port then delete** â€” logic is still needed. Typical cases:
  - *Data-generation / ETL scripts* (for example, something that built `unified_parks_catalog.json`): treat the JSON as the source of truth and delete the script, OR port the logic to a small Java `CommandLineRunner` / Node script under `tools/` only if the data must be regenerated regularly.
  - *Prediction / scoring logic*: compare it with `IntelligenceService` line by line; port any missing rule, weight or fallback into Java **with a unit test**.
  - *Python tests*: port to JUnit 5.
  - *Model artifacts* (`.pkl`, `.joblib`, `.csv` training data): decide whether they are needed; if not, delete; if yes, document where they now live and how Java uses them.
- **Rewrite reference** â€” a doc, script, workflow or Dockerfile that mentions Python gets edited to describe the Java/Node reality.

### 1.3 Remove

- Use `git rm -r` (never plain delete) so history is clean. Separate commit: `chore(python): remove legacy Python tree`.
- Remove Python entries from `.gitignore` (`__pycache__/`, `*.py[cod]`, `.venv/`, etc.).
- Remove Python steps from `.github/workflows/*.yml` (`setup-python`, `pip install`, `pytest`, `ruff`, `flake8`, `mypy`).
- Remove Python from any `Dockerfile`, `docker-compose.yml`, `.devcontainer`, `Makefile`, `*.bat`, `*.ps1`, `*.sh`, and from `package.json` scripts.
- Remove Python editor settings and extensions (`ms-python.python`, `ms-python.vscode-pylance`, `ms-python.debugpy`) from `.vscode/`.
- Map every Python-era environment variable (for example `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`, `PYTHONPATH`) to its Spring/Vite equivalent in the new `.env.example`, then delete the stale ones.
- Never delete `.env` or the SQLite database file; those are the user's local data. Add them to `.gitignore` if not already ignored.

### 1.4 Prevent regression

Add a guard script `scripts/check-no-python.ps1` (and `.sh`) that fails if any tracked file matches the Python patterns above. Wire it into CI in Phase 8.5.

**GATE 1:** run all searches from 1.1 again. They must return **nothing** (except the guard script itself, which must exclude itself). Show the output. Show the final `git status` and the commit.

---

## PHASE 2 â€” REPOSITORY HYGIENE & TOOLING (ROOT FILES)

Review and fix each of these files (create if missing and needed):

### 2.1 Root files

| File | Requirements |
|---|---|
| `.gitignore` | Covers `target/`, `node_modules/`, `dist/`, `.env`, `.env.*` (but not `.env.example`), `*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`, `data/*.db`, `.idea/`, `.vscode/*` except shared files, `*.log`, OS junk (`Thumbs.db`, `.DS_Store`), coverage reports |
| `.gitattributes` | `* text=auto eol=lf`; mark `*.bat`, `*.cmd`, `*.ps1` as `eol=crlf`; binary types explicit |
| `.editorconfig` | UTF-8, LF, final newline, 4 spaces for Java/XML, 2 spaces for TS/TSX/JSON/YAML/CSS/MD |
| `README.md` | Rewritten in Phase 9 |
| `.env.example` (root) and `apps/web/.env.example` | Every variable used anywhere, with fake values and a comment per variable (see Phase 6 env matrix) |

### 2.2 `.vscode/` (shared team config)

`.vscode/extensions.json` â€” recommended extensions (verify each ID in the Extensions panel before committing):

```json
{
  "recommendations": [
    "vscjava.vscode-java-pack",
    "vmware.vscode-boot-dev-pack",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "vitest.explorer",
    "editorconfig.editorconfig",
    "usernamehw.errorlens",
    "redhat.vscode-yaml",
    "ms-azuretools.vscode-docker",
    "github.vscode-github-actions",
    "humao.rest-client",
    "qwtel.sqlite-viewer"
  ],
  "unwantedRecommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-python.debugpy"
  ]
}
```

`.vscode/settings.json` â€” format on save; ESLint fix on save; Prettier as default formatter for TS/TSX/JSON/CSS/MD; Java `java.configuration.updateBuildConfiguration: "automatic"`; Java 21 runtime configured; `files.eol: "\n"`; Tailwind IntelliSense configured for `clsx`/`cn` helpers if used; search excludes for `node_modules`, `target`, `dist`.

`.vscode/launch.json` / `tasks.json` â€” tasks: `api: run`, `api: test`, `web: dev`, `web: test`, `all: verify`. Quote the project path.

### 2.3 "Extensions" resolved at three levels (verify all three)

1. **Editor extensions:** only the list above; no Python ones.
2. **Dependencies (Maven + npm):**
   - `mvnw dependency:analyze` â†’ remove unused declared dependencies, declare used-but-undeclared ones.
   - `npx depcheck` in `apps/web` â†’ remove unused, add missing.
   - `npm audit` and `npm ls` â†’ no unresolved peer-dependency errors; no duplicate React copies.
   - `mvnw dependency:tree` â†’ no conflicting versions; Spring Boot BOM controls Spring versions.
3. **File extensions:** `src/**` is `.ts/.tsx` only (no stray `.js/.jsx`), Java file names match their public class and package path, YAML uses `.yml` consistently, no files with double extensions or BOM-prefixed JSON.

**GATE 2:** show the final `extensions.json`, `.gitignore`, `.gitattributes`, `.editorconfig`; show `depcheck` and `dependency:analyze` clean (or each remaining item justified).

---

## PHASE 3 â€” BACKEND (`apps/api`) FILE-BY-FILE

**Review order** (dependencies first, callers last): `pom.xml` â†’ resources â†’ `config` â†’ `entity` â†’ `repository` â†’ DTOs â†’ `service` â†’ security filter â†’ `controller` â†’ WebSocket handler â†’ exception handling â†’ tests.

### 3.1 `pom.xml`

- Parent `spring-boot-starter-parent` 3.3.4 (keep for this pass; see Phase 9.3 for the currency report). `java.version` = 21.
- Dependencies, each justified: `spring-boot-starter-web`, `-security`, `-websocket`, `-data-jpa`, `-validation`, `-actuator`, `-cache`, `-test` (test scope), `spring-security-test` (test scope), `org.xerial:sqlite-jdbc`, `org.hibernate.orm:hibernate-community-dialects` (version managed by the Boot BOM), Caffeine (local cache).
- Prefer Java records and explicit constructors. If Lombok is currently used, either keep it with annotation processing correctly configured, or remove it. Do not leave it half-configured.
- `maven-compiler-plugin`: `<release>21</release>`, `<parameters>true</parameters>`, `<compilerArgs><arg>-Xlint:all,-processing</arg></compilerArgs>`, `<failOnWarning>true</failOnWarning>`.
- `spring-boot-maven-plugin` with `repackage`; build-info goal so `/actuator/info` works.
- Remove any dependency that exists only for the old Python bridge.

### 3.2 Resources

**`application.yml`** â€” reference shape (adapt to the real properties; keep the structure):

```yaml
spring:
  application:
    name: queuecut-api
  profiles:
    default: local
  threads:
    virtual:
      enabled: true
  datasource:
    url: jdbc:sqlite:./data/queuecut.db
    driver-class-name: org.sqlite.JDBC
    hikari:
      maximum-pool-size: 1          # SQLite allows one writer; a bigger pool causes "database is locked"
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: update              # LOCAL ONLY; replaced by Flyway in Phase 8
    properties:
      hibernate:
        dialect: org.hibernate.community.dialect.SQLiteDialect
  cache:
    type: caffeine
server:
  port: 8080
  error:
    include-message: never
    include-stacktrace: never
management:
  endpoints:
    web:
      exposure:
        include: health,info
app:
  frontend-url: ${APP_FRONTEND_URL:http://localhost:5173}
  cors:
    allowed-origins: ${APP_CORS_ORIGINS:http://localhost:5173}
  auth:
    cookie-name: qc_session
    cookie-secure: ${APP_COOKIE_SECURE:false}
    cookie-same-site: Lax
    session-ttl: 7d
    google:
      client-id: ${GOOGLE_CLIENT_ID:}
      client-secret: ${GOOGLE_CLIENT_SECRET:}
      redirect-uri: ${GOOGLE_REDIRECT_URI:http://localhost:8080/api/v1/auth/google/callback}
  intelligence:
    open-meteo-base-url: https://api.open-meteo.com
    nager-base-url: https://date.nager.at
    http-timeout: 4s
    cache-ttl-weather: 30m
    cache-ttl-holidays: 24h
  telemetry:
    broadcast-interval: 15s
    allowed-origins: ${APP_CORS_ORIGINS:http://localhost:5173}
```

Also provide `application-docker.yml` and `application-prod.yml` (Phase 8). Rules: no secrets in YAML; every `${...}` has a safe default or fails fast at startup with a clear message when required in `prod`.

**`unified_parks_catalog.json`** â€” see Phase 4.

### 3.3 `config` package

- `package-info.java` in **every** package with `@NonNullApi` and `@NonNullFields` (from `org.springframework.lang`).
- **`AppProperties` (rename of `SecurityProperties` if it mixes concerns):** `@ConfigurationProperties(prefix = "app")` as nested immutable records, `@Validated`, constructor binding, validation annotations (`@NotBlank`, `@NotNull`, `@DurationMin`). Enable with `@ConfigurationPropertiesScan`.
- **`SecurityConfig`:**
  - Stateless w.r.t. Spring's HTTP session (`SessionCreationPolicy.STATELESS`); authentication is via the app's own session cookie, resolved by a `OncePerRequestFilter` before `UsernamePasswordAuthenticationFilter`.
  - Explicit public routes (health, parks catalog, auth endpoints, guest-preview recommendation endpoint if any, `/ws/telemetry` handshake as designed); everything else authenticated.
  - Return **401 JSON** (ProblemDetail) for unauthenticated API calls and **403 JSON** for forbidden. **Never** a redirect to a login page or an HTML error from `/api/**`.
  - CSRF â€” decide and record in `DECISIONS.md`: **(A)** enabled with `CookieCsrfTokenRepository.withHttpOnlyFalse()` plus the SPA handler pattern, and `apiClient` sends `X-XSRF-TOKEN`; or **(B)** disabled, justified by `SameSite=Lax` cookies, no state-changing GET routes, JSON-only bodies, plus a small Origin/Referer verification filter for non-GET requests. Implement whichever you choose completely, on both sides.
  - Security headers: `X-Content-Type-Options`, `Referrer-Policy`, frame options deny, a sensible `Cache-Control` for API responses.
  - `PasswordEncoder` bean: `BCryptPasswordEncoder` (strength 10â€“12) or Argon2 if the dependency is acceptable.
- **`CorsConfig`:** origins from `app.cors.allowed-origins` (never `*` when `allowCredentials(true)`), methods GET/POST/PUT/PATCH/DELETE/OPTIONS, allowed headers explicit, `maxAge` set. Applied through the security filter chain (`http.cors(...)`) so preflight works with security on.
- **`WebSocketConfig`:** register `TelemetryWebSocketHandler` at `/ws/telemetry`; `setAllowedOrigins(...)` from properties (never `*`); handshake interceptor that resolves the session cookie if present (guest connections allowed only if the product requires it); message size and idle-timeout limits.
- **Scheduling / cache config:** `@EnableScheduling`, `@EnableCaching`; named caches `weather`, `holidays` with the TTLs from properties.

### 3.4 `entity` package (`User`, `Session`, `Trip`)

For each entity check: JPA annotations, `equals/hashCode` on ID only (or none), no Lombok `@Data` on entities, `@Table` names and constraints explicit, indexes on lookup columns, `Instant` for timestamps (UTC), enums stored as `STRING`, `@Version` where concurrent edits are possible.

- **`User`:** id (UUID or long, consistent everywhere), `email` unique, stored **lower-cased and trimmed**; `passwordHash` nullable (Google-only accounts); `authProvider` enum (`LOCAL`, `GOOGLE`); display name; `createdAt`. If registration collects a contact number and age group, store the age group as an **enum**, validate the phone format, never log either, and keep them out of API responses unless the owner is the caller.
- **`Session`:** store only the **SHA-256 hash** of the random session token (never the raw token); `userId`, `createdAt`, `lastSeenAt`, `expiresAt`, optional user-agent/IP hash; index on `tokenHash` and on `expiresAt`. A scheduled job purges expired sessions.
- **`Trip`:** owner (`userId`), `parkId` (must exist in the catalog), `visitDate` (`LocalDate`), optional notes (length-limited), `createdAt`; unique constraint on `(userId, parkId, visitDate)`; cascade/orphan behavior defined.

### 3.5 `repository` package

Spring Data interfaces only: derived queries with explicit names, `Optional` returns, no `findAll()` on unbounded tables without paging, `deleteByExpiresAtBefore` implemented as a bulk `@Modifying @Query` with `@Transactional`. No native SQL that is SQLite-only (it must survive the PostgreSQL move in Phase 8).

### 3.6 DTOs (create if the code currently returns entities or `Map<String,Object>`)

- Java **records** for every request and response. Never expose entities.
- Request records carry Bean Validation (`@NotBlank`, `@Email`, `@Size`, `@Pattern`, `@Past`/`@FutureOrPresent` as appropriate).
- Telemetry messages use one envelope, mirrored exactly in TypeScript (Phase 6):
  ```json
  { "v": 1, "type": "weather" | "crowd" | "status", "parkId": "string", "ts": "2026-10-08T10:15:30Z", "data": { } }
  ```

### 3.7 `service` package

**`IntelligenceService` (+ `WeatherService`, `HolidayService` if split):**

- Outbound HTTP with `RestClient` (or `WebClient`): connect and read timeouts from properties, `User-Agent`, retry with backoff for idempotent GETs only, circuit-breaker-like fallback (return degraded data with a flag instead of failing the whole request).
- Fetch weather and holidays **concurrently** (virtual threads or `CompletableFuture`), then combine.
- Cache with `@Cacheable` on a **different bean** than the caller (self-invocation bypasses the proxy). Cache keys include park id/coordinates and date range; never cache errors.
- Open-Meteo forecasts only cover a limited horizon. For dates beyond it, fall back to a heuristic and set `confidence` lower; return `forecastAvailable=false` rather than inventing numbers.
- Nager.Date may not support every country: handle "unsupported country"/empty responses as "no holidays", with `holidayDataAvailable=false` in the response.
- `visit_score`: a pure, deterministic function `score(WeatherDay, boolean isHoliday, boolean isWeekend, ParkProfile) â†’ 0..100`, weights in `@ConfigurationProperties` (no magic numbers in code), result clamped and rounded consistently. Unit-tested for: rainy weekend, clear weekday, holiday weekday, extreme heat, missing weather data.
- Wait-time prediction: documented formula, inputs and units; returns minutes as `int`; never negative; has a minimum and maximum.
- Time zones: compute "weekend" and "holiday" using the **park's** time zone from the catalog, not the server's.

**`ParksService`:** loads and validates the catalog once at startup (fail fast with a clear message), immutable in-memory index by park id, `findById` returns `Optional`, list endpoint supports filtering by country.

**`AuthService`:**

- Register: normalize email, enforce a password policy (length â‰¥ 8â€“10, not in an obvious-passwords list), hash with the encoder, reject duplicates with a **generic** conflict response (no account-enumeration detail beyond what is necessary), create session.
- Login: constant-time-ish behavior (same response for unknown email and wrong password), rate limiting per IP and per email (in-memory token bucket is enough for now; document the Redis upgrade).
- Session creation: 256-bit random token via `SecureRandom`, Base64-URL encoded; store only its hash; set cookie via `ResponseCookie` (HttpOnly, `Secure` per profile, `SameSite=Lax`, `Path=/`, `Max-Age` = TTL); sliding expiration with a bounded update frequency.
- Logout: delete the session row **and** expire the cookie.
- Google users: upsert by **verified** email; never merge into a LOCAL account without verified-email proof.

**`TripService`:** ownership checks on every read/write/delete (a user can never touch another user's trip), validation that `parkId` exists, `visitDate` not in the past (for new trips), idempotent create on the unique constraint, `@Transactional` boundaries correct (read-only where applicable).

**Telemetry service / scheduler:** produces typed events on `app.telemetry.broadcast-interval`, reuses the cached weather data, never blocks the scheduler thread on slow HTTP.

### 3.8 Controllers

Every controller: `@RestController`, versioned base path `/api/v1/...`, `@Valid` on bodies, DTOs only, correct status codes (201 + `Location` on create, 204 on delete), no business logic.

**`AuthController` â€” routes (keep existing paths where they exist; add missing ones):**

| Method + path | Behavior |
|---|---|
| `POST /api/v1/auth/register` | Validate, create user + session cookie, return the user DTO |
| `POST /api/v1/auth/login` | Verify, create session cookie, return the user DTO |
| `POST /api/v1/auth/logout` | Delete session, expire cookie, `204` |
| `GET /api/v1/auth/me` | `200` user DTO when the session is valid, `401` otherwise (this is the **only** way the frontend learns session state) |
| `GET /api/v1/auth/providers` | `{ "google": true|false }` so the UI can hide or disable the Google button when it is not configured |
| `GET /api/v1/auth/google/login` | If not configured â†’ **302** to `${app.frontend-url}/login?error=google_not_configured` (URL built with `UriComponentsBuilder`, never string concatenation). If configured â†’ generate `state` (+ nonce), store it in a short-lived HttpOnly cookie, **302** to Google |
| `GET /api/v1/auth/google/callback` | Verify `state` against the cookie, exchange `code`, validate the ID token / userinfo (verified email, audience, issuer, expiry), upsert user, create session, **302** to `${app.frontend-url}/` ; on any failure **302** to `/login?error=<code>` using a **fixed set of error codes** |

Error codes used in redirects must be a closed set (`google_not_configured`, `google_denied`, `google_state_mismatch`, `google_failed`, `google_email_unverified`). The frontend maps codes to friendly text; it never renders a raw query-string value.

**`RecommendationController`:** validates the date range (max span, `from <= to`, not absurdly far), park id exists, returns a list of per-day results with `visitScore`, `predictedWaitMinutes`, `confidence`, and reasons (weather / holiday / weekend flags).

**`TelemetryController`:** REST snapshot for first paint; primitives or explicit `@Nullable` per K3.

**`ParksController` / `TripController`:** as per the contract (Phase 6).

### 3.9 `TelemetryWebSocketHandler`

- Extend `TextWebSocketHandler`; keep sessions in a `ConcurrentHashMap`; **wrap every session in `ConcurrentWebSocketSessionDecorator`** (send time limit + buffer limit) because raw WebSocket sessions are not thread-safe for concurrent sends.
- Serialize one envelope type with Jackson (no hand-built JSON strings).
- Handle `afterConnectionClosed` and `handleTransportError` (remove + close, log at debug), ping/idle handling, and graceful shutdown.
- Optional client â†’ server messages (`subscribe: parkId`) validated; unknown messages ignored with a log, never crash the handler.
- On connect, send an immediate `status` + latest cached snapshot so the UI is never blank.

### 3.10 Exception handling

One `@RestControllerAdvice` returning RFC 7807 `ProblemDetail` with extra fields `code` (stable machine string) and `errors[]` (field + message) for validation failures. Map: validation â†’ 400, malformed JSON â†’ 400, auth â†’ 401, forbidden â†’ 403, not found â†’ 404, conflict â†’ 409, upstream failure â†’ 502/503 with degraded flag where applicable, anything else â†’ 500 with a generic message and a logged correlation id. Stack traces never reach the client.

### 3.11 Backend tests (create; target meaningful coverage of logic, not a percentage)

- Unit: score function, wait-time function, session token hashing, password policy, catalog validation.
- `@DataJpaTest`: repositories (unique constraints, bulk delete).
- `@WebMvcTest` + `spring-security-test`: auth flows (register/login/me/logout cookie attributes), 401 vs 403 shapes, Google not-configured redirect, validation errors.
- Service tests with Mockito for external HTTP (use `MockRestServiceServer` or WireMock; **no live network in tests**).
- WebSocket: a test connecting with `StandardWebSocketClient` that receives the initial `status` message.

**GATE 3:**
```powershell
cd "J:\QUEUE CUT\apps\api"
.\mvnw.cmd -B -ntp clean verify
```
Must end in `BUILD SUCCESS` with **0 warnings** (`[WARNING]` lines from the compiler = failure). Then smoke test:
```powershell
Start-Process powershell -ArgumentList '-NoExit','-Command','cd "J:\QUEUE CUT\apps\api"; .\mvnw.cmd spring-boot:run'
curl.exe -s http://localhost:8080/actuator/health
curl.exe -i -c cj.txt -H "Content-Type: application/json" -d "{\"email\":\"t@example.com\",\"password\":\"Str0ng-Passw0rd!\",\"name\":\"T\"}" http://localhost:8080/api/v1/auth/register
curl.exe -i -b cj.txt http://localhost:8080/api/v1/auth/me
curl.exe -i http://localhost:8080/api/v1/auth/google/login
curl.exe -i -b cj.txt -X POST http://localhost:8080/api/v1/auth/logout
curl.exe -i -b cj.txt http://localhost:8080/api/v1/auth/me     # must be 401 now
```
Show the outputs. Confirm `Set-Cookie` shows `HttpOnly; SameSite=Lax; Path=/`.

---

## PHASE 4 â€” DATA FILES

### 4.1 `unified_parks_catalog.json`

- Valid UTF-8 **without BOM**, valid JSON, 2-space indent, stable key order.
- Create `data/parks.schema.json` (JSON Schema draft 2020-12) and validate the catalog against it (use `npx ajv-cli` once, and the Java startup validation permanently).
- Required per park: `id` (unique, kebab-case), `name`, `country` (ISO 3166-1 alpha-2), `city`, `latitude` (âˆ’90..90), `longitude` (âˆ’180..180), `timeZone` (IANA, e.g. `Asia/Kolkata`), `openingHours` (or `typicalHours`), optional `fastTrack` (`price`, `currency` ISO 4217, `description`), optional `website`, optional `capacityHint` used by the crowd heuristic.
- Check: no duplicate ids, no ids referenced by trips that are missing, no NaN/null coordinates, currency present when a price is present, no trailing commas, consistent number types (numbers, not strings).
- Decide where the file lives and record it in `DECISIONS.md`. Recommended: **`apps/api/src/main/resources/data/unified_parks_catalog.json`** (packaged inside the jar so Docker works with no volume), with `data/` at the repo root documented as the editing location only if there is a sync script; otherwise keep a single copy. Two divergent copies are a bug.

### 4.2 Other files in `data/`

Classify each: used by code / reference only / junk. Delete junk; document the rest in `data/README.md` (what it is, where it came from, how to refresh it, license/attribution if applicable).

**GATE 4:** show the schema validation result, the startup log line proving the catalog loaded (count of parks), and the unit test for catalog validation passing.

---

## PHASE 5 â€” FRONTEND (`apps/web`) FILE-BY-FILE

**Review order:** `package.json` â†’ TS configs â†’ Vite config â†’ env typing â†’ `index.html` â†’ styles â†’ types â†’ lib â†’ api â†’ store â†’ hooks â†’ components â†’ features â†’ layouts â†’ pages â†’ `main.tsx`/`App.tsx` â†’ tests.

### 5.1 `package.json`

- `"type": "module"`, `"engines": { "node": ">=20" }`, `"private": true`.
- Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `lint`, `typecheck` (`tsc -b --noEmit`), `test` (`vitest`), `test:run` (`vitest run`), `format`, `format:check`.
- Dependencies (justify each): `react@18`, `react-dom@18`, `react-router-dom`, `zustand`, `axios`, `lucide-react`, `mapbox-gl`, `zod` (runtime validation of WebSocket/API payloads), `clsx` + `tailwind-merge` (only if actually used).
- Dev dependencies: `vite@5`, `@vitejs/plugin-react`, `typescript`, `tailwindcss@4`, `@tailwindcss/vite`, `eslint` + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` (flat config), `prettier` (+ `prettier-plugin-tailwindcss` optional), `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@types/react`, `@types/react-dom`, `@types/node`; install `@types/mapbox-gl` **only if** the installed `mapbox-gl` version does not ship its own types.
- Lockfile (`package-lock.json`) committed; only one package manager in the repo.

### 5.2 TypeScript configs

Use project references: `tsconfig.json` (references), `tsconfig.app.json` (src), `tsconfig.node.json` (vite config). Required flags: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `exactOptionalPropertyTypes` (if it does not create unreasonable friction), `verbatimModuleSyntax`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `paths: { "@/*": ["./src/*"] }`.

### 5.3 `vite.config.ts` â€” reference

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
  build: { sourcemap: true, target: 'es2022' },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true },
});
```

Why the proxy matters: in development the browser talks only to `localhost:5173`, so cookies are first-party, CORS is not exercised, and the WebSocket upgrade works. In production nginx does the same job (Phase 8.3). Frontend code therefore uses **relative URLs** (`/api/v1/...`, `/ws/telemetry`), never `http://localhost:8080`.

### 5.4 Environment typing â€” `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;   // default '/api/v1'
  readonly VITE_WS_PATH?: string;        // default '/ws/telemetry'
  readonly VITE_MAPBOX_TOKEN?: string;   // public pk.* token only
}
interface ImportMeta { readonly env: ImportMetaEnv; }
```

### 5.5 Styles (resolves K1)

`src/styles/index.css` begins with `@import "tailwindcss";` and uses `@theme { ... }` for design tokens. Remove any `@tailwind base/components/utilities` lines, remove `tailwind.config.js` unless `@config` is deliberately used, remove `postcss.config.*`/`autoprefixer` if nothing else needs them. Verify with a production build that utility classes appear in the output CSS. Respect `prefers-reduced-motion` and `prefers-color-scheme` if dark mode exists.

### 5.6 `index.html`

`lang`, charset, viewport, title, description, favicon, theme-color, a single `<div id="root">`, `<script type="module" src="/src/main.tsx">`. No inline scripts.

### 5.7 `src/types` and `src/lib`

- `types/api.ts`: TypeScript types **mirroring the Java DTO records exactly** (field names, nullability, enums as string unions). Add `zod` schemas next to them for anything that crosses the network, and infer the TS types from the schemas so they cannot drift.
- `types/telemetry.ts`: discriminated union on `type` (`'weather' | 'crowd' | 'status'`) with `v: 1`.
- `lib/fastTrack.ts` (**pure function, unit-tested**):
  ```
  timeSavedMinutes = max(0, predictedWaitMinutes - fastTrackWaitMinutes) * ridesPlanned
  valueOfTimeSaved = (timeSavedMinutes / 60) * valueOfTimePerHour
  netBenefit       = valueOfTimeSaved - passPrice
  recommendation   = netBenefit > 0 ? 'worth-it' : (netBenefit > -passPrice * 0.15 ? 'marginal' : 'skip')
  breakEvenRides   = ceil( passPrice / ((max(0, predictedWait - fastTrackWait) / 60) * valueOfTimePerHour) )   // guard divide-by-zero
  ```
  Validate inputs (non-negative, finite), format currency with `Intl.NumberFormat` using the park's currency from the catalog.
- `lib/format.ts`, `lib/dates.ts` (park-time-zone aware formatting), `lib/errors.ts` (maps backend `code` + `ProblemDetail` to user-friendly messages, including the Google redirect error codes from Phase 3.8).

### 5.8 `src/api` â€” `apiClient.ts` (resolves K5) â€” reference

```ts
import axios, { AxiosError } from 'axios';

let onUnauthorized: (() => void) | undefined;
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    const url = error.config?.url ?? '';
    const isAuthProbe = url.endsWith('/auth/me') || url.endsWith('/auth/login') || url.endsWith('/auth/register');
    if (error.response?.status === 401 && !isAuthProbe) onUnauthorized?.();
    return Promise.reject(error);
  },
);
```

Notes: the handler is **injected** (called once from `main.tsx` with `useAuthStore.getState().clearSession`) so `apiClient` and `authStore` never import each other (no circular import). If CSRF option A was chosen in Phase 3.3, configure `xsrfCookieName` / `xsrfHeaderName` here. One module per resource: `api/auth.ts`, `api/parks.ts`, `api/recommendations.ts`, `api/trips.ts`, `api/telemetry.ts`, each returning **parsed, validated** data (zod `parse`), never `any`.

### 5.9 `src/store` â€” `authStore.ts` (Zustand)

- State is an explicit status union: `'idle' | 'loading' | 'authenticated' | 'guest' | 'unauthenticated'`, plus `user: User | null` and `error: string | null`.
- Actions: `hydrate()` (calls `GET /auth/me` once on app start; 401 â†’ `unauthenticated`, never an error banner), `login`, `register`, `logout` (calls the API, then clears local state even if the API call fails), `enterGuest()`, `clearSession()`.
- **Never** store the session token or password; the cookie is HttpOnly and invisible to JS by design. Persist nothing sensitive (guest flag may be persisted in `sessionStorage` only).
- Use selectors (`useAuthStore((s) => s.user)`) to avoid re-render storms. Other stores as needed: `parkStore` (selected park, catalog), `tripStore`, `telemetryStore` (latest snapshot by park, connection state).
- Guest Mode rules: guests may view the catalog and a limited recommendation preview; actions that need an account (save trip) open `AuthModal` instead of failing.

### 5.10 `src/hooks` â€” `useTelemetrySocket.ts` â€” behavior spec

- URL built from `window.location` (`ws:`/`wss:` according to `https:`) + `VITE_WS_PATH`.
- Exponential backoff with jitter (1 s â†’ 30 s cap), reset on successful open; stop reconnecting after unmount; pause when `document.visibilityState === 'hidden'` and resume on visible.
- Parse every message with the zod discriminated union; **invalid messages are dropped and counted**, never thrown into React.
- Exposes `{ status: 'connecting' | 'open' | 'closed' | 'error', lastMessageAt }` and writes data to `telemetryStore`.
- Cleanup closes the socket and clears timers (verify no leak in React 18 StrictMode double-mount).

### 5.11 Components, features, layouts, pages â€” requirements per file

| File | Requirements |
|---|---|
| `components/AuthModal` | Focus trap, `Esc` closes, `aria-modal`, returns focus; tabs (Login / Sign up) accessible with `role="tablist"`; shows server field errors; disables submit while pending; Google button hidden/disabled when `/auth/providers` says not configured |
| `features/auth/*` (tabs) | Controlled inputs, client validation mirroring server rules, no password in component state longer than needed, `autocomplete` attributes correct, error text from `lib/errors.ts` |
| `components/DestinationCard` | Pure presentational, typed props from the catalog type, image `alt`, `loading="lazy"`, keyboard-focusable action, no inline fetches |
| `components/FastTrackCalculator` | Uses `lib/fastTrack.ts` only; accessible number inputs with labels and units; sensible defaults; result region `aria-live="polite"` |
| `components/Map*` | Reads token from env; if missing show a graceful fallback panel; create the map in `useEffect`, call `map.remove()` in cleanup; import `mapbox-gl/dist/mapbox-gl.css` once; markers cleaned up. If the project wants a fully token-free option, `maplibre-gl` is a drop-in alternative; record the decision |
| `components/TelemetryBadge` (or equivalent) | Shows connection state, last update age, weather, crowd level; handles "no data yet" |
| `components/ErrorBoundary` | Wraps routes; friendly fallback with reload action; logs to console only in dev |
| `layouts/AppShell` | Semantic landmarks (`header`, `nav`, `main`, `footer`), skip-to-content link, responsive nav, user menu reflects `authStore`, mounts the telemetry hook once |
| `pages/*` (Landing, Login, Dashboard, ParkDetail, Trips, NotFound) | Route-level code splitting with `React.lazy` + `Suspense`; each page has loading, empty and error states; `Login` page parses `?error=` through a **whitelist map** and renders friendly text; protected pages redirect guests/unauthenticated users with a `redirectTo` that is validated to be an internal path |
| `App.tsx` / `main.tsx` | `StrictMode`, router, `setUnauthorizedHandler(...)`, `authStore.hydrate()` once, global error boundary |

Global frontend rules: no `any`; no unhandled promise (every `await` in a handler is in `try/catch` or goes through the store's error state); no `dangerouslySetInnerHTML`; no secrets in the bundle (only the public Mapbox `pk.` token); stable `key` props; effects have correct dependency arrays (the hooks lint rule must pass with zero warnings); images and icons have accessible names.

### 5.12 Frontend tests (create)

- `lib/fastTrack.test.ts`: worth-it, marginal, skip, zero-wait, negative input rejected, break-even guard.
- `store/authStore.test.ts`: hydrate 200/401, login success/failure, logout clears state even when the API fails, 401 handler.
- `hooks/useTelemetrySocket.test.ts`: mock `WebSocket`; valid message stored, invalid dropped, reconnect after close, cleanup on unmount.
- Component tests: `AuthModal` (a11y roles, error display), `FastTrackCalculator` (result updates), `Login` page error-code mapping (unknown code â†’ generic message).

**GATE 5:**
```powershell
cd "J:\QUEUE CUT\apps\web"
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```
All five must pass with 0 errors and 0 warnings. Show output. Then open the built CSS and confirm Tailwind utilities exist (K1 resolved).

---

## PHASE 6 â€” FRONTEND â†” BACKEND CONTRACT RECONCILIATION

**Goal:** prove both sides agree, in one document: `docs/API.md`.

### 6.1 Discover, don't assume

List every route actually implemented in the controllers, and every call actually made in `src/api/*`. Build this table for each endpoint:

`Method | Path | Auth (public/session) | Request DTO (Java) | Request type (TS) | Response DTO (Java) | Response type (TS) | Error codes | Verified`

The route list in Phase 3.8 is the **recommended** contract: where a route already exists under a different name, **keep the existing name and adapt the other side**, unless the existing one is broken. Each row must be verified with a real request (curl) and a real UI action.

### 6.2 Things to check explicitly

1. Field names and casing (camelCase everywhere; `visit_score` in docs becomes `visitScore` in JSON; if any consumer still needs `visit_score`, use `@JsonProperty` deliberately and mirror it).
2. Dates: `Instant` â†” ISO-8601 UTC strings; `LocalDate` â†” `YYYY-MM-DD`; Jackson `WRITE_DATES_AS_TIMESTAMPS=false`.
3. Nullability: a field that is optional in Java is optional in TS and in the zod schema.
4. Enums: identical string sets on both sides.
5. Error body: `ProblemDetail` + `code` + `errors[]`; `lib/errors.ts` handles every code the backend can emit.
6. Cookies: name, attributes, and that `GET /auth/me` works after a page refresh in dev (through the Vite proxy) and in Docker (through nginx).
7. WebSocket envelope: Java record â†” zod union; send a recorded real message through the TS parser in a test.
8. CORS/CSRF: whichever option was chosen works on both sides, including a failed-preflight negative test.

### 6.3 Environment variable matrix (put in `docs/ENV.md` and the `.env.example` files)

`Variable | Used by | Required in | Example (fake) | Notes` â€” include at least: `APP_FRONTEND_URL`, `APP_CORS_ORIGINS`, `APP_COOKIE_SECURE`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_URL/USERNAME/PASSWORD`, `SPRING_DATA_REDIS_HOST/PORT/PASSWORD`, `POSTGRES_USER/PASSWORD/DB`, `VITE_API_BASE_URL`, `VITE_WS_PATH`, `VITE_MAPBOX_TOKEN`.

**GATE 6:** `docs/API.md` has every row verified = yes; show one full end-to-end trace for each of: register â†’ me â†’ logout; Google not-configured redirect displayed correctly in the UI; telemetry message from backend log â†’ parsed in the browser.

---

## PHASE 7 â€” FULL-SYSTEM VERIFICATION ON THE CURRENT STACK (SQLite)

1. Fresh clone simulation: delete `target/`, `node_modules/`, `dist/`, the local DB; follow only the README; the app must come up.
2. Run both servers; walk the golden path manually and record results in `docs/QA.md`: guest preview â†’ sign up â†’ save a trip â†’ refresh the page (still logged in) â†’ logout â†’ login â†’ Google button (not configured message) â†’ FastTrack calculator â†’ live telemetry updates â†’ kill the backend (UI shows "reconnecting", then recovers when restarted).
3. Browser DevTools: Console has **no errors or warnings**; Network has **no failed requests**; the WebSocket stays open; the cookie shows `HttpOnly`.
4. Run all test suites again.

**GATE 7:** `docs/QA.md` is filled with actual observations; both suites are green; Python guard passes.

---

## PHASE 8 â€” INFRASTRUCTURE UPGRADES

Only start after GATE 7. Do the sub-steps in order; each ends with its own verification.

### 8.1 SQLite â†’ PostgreSQL (with Flyway)

1. Add `org.postgresql:postgresql` and Flyway (`flyway-core` **and** `flyway-database-postgresql`, required by Flyway 10+). Remove `sqlite-jdbc` and `hibernate-community-dialects` once migration is verified (or keep SQLite only behind a `local-sqlite` profile if you want an offline mode; decide and record).
2. Create `src/main/resources/db/migration/V1__baseline.sql` from the **actual** current entities (users, sessions, trips, indexes, unique constraints, foreign keys). Use PostgreSQL types (`uuid` or `bigint` identity, `timestamptz`, `varchar(n)`, `boolean`). Set `spring.jpa.hibernate.ddl-auto=validate` for all non-test profiles, so the entities must match the migration.
3. Data migration (only if the existing SQLite data must be kept): export tables to CSV with the `sqlite3` CLI, load with `\copy` in `psql`, then reset sequences with `setval`. Write the exact commands into `docs/MIGRATION.md` and test them on a copy. Verify row counts and a few spot checks.
4. Local database via Docker (Phase 8.3). **Free hosted options** for demos: Neon or Supabase free tier (verify current limits); record the choice.
5. Tests: use Testcontainers (`postgresql`) for repository tests so the real dialect is tested (requires Docker; keep the pure unit tests Docker-free so CI stays fast).
6. Check there is no SQLite-specific SQL left (`grep -ri "sqlite" apps/api`).

### 8.2 Redis cache (Spring Cache)

1. Add `spring-boot-starter-data-redis` (+ `spring-boot-starter-cache` already present). Profiles: `local` keeps Caffeine (no Redis needed for beginners); `docker` and `prod` use Redis.
2. Cache names and TTLs from properties: `weather` 30 min, `holidays` 24 h, `recommendations` short (e.g. 5â€“10 min). Keys: `park:{id}:{from}:{to}`. Use typed Jackson serialization (records with `GenericJackson2JsonRedisSerializer` or a typed serializer), and namespace keys with a prefix (`queuecut:`).
3. Resilience: a `CacheErrorHandler` that logs and **continues without cache** if Redis is down. The API must still work when Redis is unavailable.
4. Verify with logs/metrics: first call hits Open-Meteo/Nager, second does not (assert with a test using `MockRestServiceServer` call counts). Also enable `management.endpoint.caches`/cache metrics if useful.
5. Optional: move the in-memory auth rate limiter to Redis when running multiple instances; document.

### 8.3 Docker & docker-compose

**`apps/api/Dockerfile`** (multi-stage, non-root, health-checked):
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:21-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10001 --create-home qc
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
USER qc
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
HEALTHCHECK --interval=15s --timeout=3s --start-period=40s --retries=5 \
  CMD curl -fsS http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java","-jar","/app/app.jar"]
```
(Make sure only one runnable jar matches `target/*.jar`, e.g. configure `finalName` or exclude `*.jar.original`.)

**`apps/web/Dockerfile`**:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_MAPBOX_TOKEN
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
```

**`apps/web/nginx.conf`:** SPA fallback (`try_files $uri /index.html;`), long cache for hashed assets, no cache for `index.html`, `location /api/ { proxy_pass http://api:8080; }`, `location /ws/ { proxy_pass http://api:8080; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_read_timeout 3600s; }`, forwarded headers (`X-Forwarded-For`, `X-Forwarded-Proto`, `Host`), gzip, security headers.

Because the frontend uses **relative URLs**, the same web image works in dev-compose, staging and production. (Vite `VITE_*` values are baked at build time; only the public Mapbox token needs a build arg.)

**`docker-compose.yml`** (repo root) â€” services `db` (postgres:16-alpine), `redis` (redis:7-alpine), `api`, `web`. Requirements: healthchecks on all four; `depends_on` with `condition: service_healthy`; named volume for Postgres; passwords **required** via `${POSTGRES_PASSWORD:?set in .env}`; the API receives `SPRING_PROFILES_ACTIVE=docker`, `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/queuecut`, `SPRING_DATA_REDIS_HOST=redis`, and Google/cookie variables via `env_file`; only `web` (port 8080â†’80 or 80) and optionally `db` for local tools are published; `restart: unless-stopped`.

Add `.dockerignore` files (node_modules, target, dist, .git, .env*, *.db).

**Verification:** `docker compose config` (valid), `docker compose build`, `docker compose up -d`, `docker compose ps` (all healthy), then repeat the Phase 7 golden path against the compose URL. Show outputs.

### 8.4 Secrets management (zero-budget version)

- Rule: **no secret is ever in git, an image layer, or a `VITE_*` variable.**
- Local: `.env` (ignored) + `.env.example` (committed).
- CI: GitHub **Actions secrets / environment secrets** (free).
- Containers: pass via `env_file`/environment; for Docker Swarm/Compose file-based secrets use `*_FILE` conventions where supported.
- When a cloud vault is wanted, use a free option rather than AWS Secrets Manager (not free after its trial): e.g. AWS SSM Parameter Store (standard parameters), Google Secret Manager free allotment, or a free-tier secrets service. **Verify current pricing and limits before choosing**, and record the choice in `DECISIONS.md`.
- Startup validation: in `prod`, the API fails fast with a clear message if a required secret is missing (`@Validated` properties).
- Document rotation steps for Google OAuth credentials and DB password in `docs/SECRETS.md`.

### 8.5 CI/CD â€” `.github/workflows/deploy.yml` (and `ci.yml`)

Split into a **CI** workflow (every push and PR) and a **deploy** workflow (main only, gated). CI jobs:

1. `guard`: run `scripts/check-no-python.sh`; fail on any tracked Python file; also fail if `.env` is tracked.
2. `api`: `actions/setup-java@v4` (Temurin 21, Maven cache) â†’ `./mvnw -B -ntp verify` (publish test reports as artifacts).
3. `web`: `actions/setup-node@v4` (Node 20, npm cache) â†’ `npm ci` â†’ `npm run lint` â†’ `npm run typecheck` â†’ `npm run test:run` â†’ `npm run build` â†’ upload `dist`.
4. `docker`: build both images (no push on PRs) and run `docker compose config`; optionally start the stack and curl `/actuator/health`.

Rules: `permissions: contents: read` by default (elevate per job only when needed); concurrency group to cancel superseded runs; `actions/*` pinned to a major version (or SHA); secrets only through `${{ secrets.* }}`; deploy job `needs: [guard, api, web, docker]`, uses a GitHub **Environment** with optional required reviewer, and its final step is whichever free target the user selects (e.g. push images to GHCR, then deploy to a free host). If no deployment target is chosen yet, make the deploy workflow build and publish images to GHCR and stop there, documenting the next step; do not fake a deploy.

**GATE 8:** show `docker compose ps` (all healthy), the golden-path results against Docker, the cache hit proof, the Flyway migration log (`Successfully applied 1 migration`), and a green CI run (or the local `act`/manual equivalent output if CI cannot run).

---

## PHASE 9 â€” DOCUMENTATION & FINAL VERIFICATION

### 9.1 Documents to write (clear, short, accurate, tested by following them)

- `README.md`: what QueueCut is, screenshot placeholder note, architecture diagram (Mermaid), prerequisites (Java 21, Node 20, Docker), **3 ways to run** (local SQLite profile; docker compose; production notes), common errors and fixes, project layout, scripts table, how to run tests.
- `docs/ARCHITECTURE.md`: components, data flow (request â†’ cache â†’ external APIs â†’ score), sequence diagram for login (cookie flow) and for telemetry (scheduler â†’ WebSocket â†’ store â†’ UI), module boundaries.
- `docs/API.md` (from Phase 6), `docs/ENV.md`, `docs/SECRETS.md`, `docs/MIGRATION.md`, `docs/DECISIONS.md`, `docs/QA.md`, `docs/CHANGELOG-CLEANUP.md`, `data/README.md`.
- `CONTRIBUTING.md` (short): branch naming, commit style, how to run the gates.

### 9.2 Final repository audit

1. `docs/REVIEW_LOG.md`: **every** file `Reviewed = yes`; list files deleted and why.
2. Re-run, and show output for, every gate command from Phases 1, 3, 5, 8.
3. `git ls-files | Measure-Object` before vs. after (summary of what was removed).
4. Search for leftovers: `TODO|FIXME|XXX`, `console.log`, `System.out.println`, `printStackTrace`, `@SuppressWarnings`, `eslint-disable`, `@ts-ignore`, `: any`, `http://localhost` in source (only allowed in `.env.example` and docs), hard-coded ports, hard-coded origins.

### 9.3 Dependency currency report (report only; do not upgrade without approval)

Produce a table of the major dependencies with: current version, latest stable, whether the current line still receives security fixes, and risk of upgrading. Include a specific note on **Spring Boot 3.3.x** (check the official Spring Boot support page for whether this line is still maintained and which line to move to), **Vite 5**, **React 18** and **Tailwind 4**. Recommend an upgrade order; do not perform it in this pass.

---

# PART D â€” UNIVERSAL CHECKLISTS

## D1. Every file

- [ ] Purpose is clear from the name and a short header comment where it is not obvious.
- [ ] No dead code, unused imports, unused variables, commented-out blocks.
- [ ] No duplicated logic that belongs in a shared helper.
- [ ] Errors are handled at the right level and surfaced to the user in friendly text; nothing is swallowed silently.
- [ ] No secrets, tokens, personal data or real emails in the file.
- [ ] Naming is consistent (Java: `PascalCase` classes, `camelCase` members; TS: `PascalCase` components, `camelCase` functions, `kebab-case` or `PascalCase` files consistently per folder).
- [ ] Formatting passes the formatter (Prettier / `.editorconfig`).
- [ ] The file has a test, or a written reason why not.

## D2. Java

- [ ] Package matches the path; one top-level type per file.
- [ ] Records for DTOs, constructor injection only (no field `@Autowired`), `final` fields.
- [ ] `Optional` is used for return values only (not fields or parameters).
- [ ] No `null` returns from public methods unless annotated `@Nullable` and documented.
- [ ] Time uses `java.time` (`Instant`, `LocalDate`, `ZoneId`), never `Date`/`Calendar`.
- [ ] Money is never `double` (use `BigDecimal` or integer minor units) on the backend; the TS side formats only.
- [ ] Logging uses SLF4J with parameters, no string concatenation, no PII, no tokens.
- [ ] Transactions: write methods `@Transactional`, reads `@Transactional(readOnly = true)`, no transactions around slow HTTP calls.
- [ ] Zero compiler warnings with `-Xlint:all,-processing`.

## D3. React / TypeScript

- [ ] Components are small, typed, and either presentational or container (not both).
- [ ] Hooks follow the rules; effects clean up; dependency arrays are correct.
- [ ] No state duplicated between Zustand and local state.
- [ ] Forms are accessible: labels, `aria-invalid`, `aria-describedby`, error text, keyboard flow.
- [ ] Every async UI shows loading, empty and error states.
- [ ] No `any`, no non-null assertions (`!`) without an explanatory comment.
- [ ] No layout shift on load; images sized; responsive from 360 px up.

## D4. Security

- [ ] Passwords hashed; session tokens random and stored hashed; cookies HttpOnly/SameSite/Secure-by-profile.
- [ ] Every state-changing endpoint is protected against CSRF per the chosen option.
- [ ] All input validated on the server regardless of client validation.
- [ ] No open redirects (`redirectTo` and OAuth `state` validated), no reflected raw query values in the UI.
- [ ] CORS and WebSocket origins are explicit allow-lists.
- [ ] Rate limiting on login/register; generic auth error messages.
- [ ] `npm audit` and a Maven dependency vulnerability check reviewed; criticals fixed or justified.

## D5. Performance & reliability

- [ ] External HTTP has timeouts, retries (idempotent only) and cached results.
- [ ] No N+1 queries (check with `spring.jpa.show-sql` once, then turn off).
- [ ] Frontend bundle: route-level splitting; Mapbox loaded only on map pages.
- [ ] The system degrades gracefully when Open-Meteo, Nager.Date, Redis or the WebSocket is down.

---

# PART E â€” FINAL OUTPUT FORMAT

When all phases are complete, reply with exactly these sections:

1. **Summary** (â‰¤ 15 lines): what was wrong, what you changed.
2. **Phase results table:** `Phase | Gate passed (yes/no) | Evidence (command + one-line result)`.
3. **Python purge proof:** the outputs of the searches from 1.1, all empty.
4. **Files changed / added / deleted:** counts and the full list (the details live in `docs/REVIEW_LOG.md`).
5. **Behavior changes:** every one, one line each.
6. **Decisions made:** the entries added to `docs/DECISIONS.md`.
7. **Open risks and follow-ups:** anything not done, why, and what the user must do (for example rotate a leaked key, create Google OAuth credentials, choose a deploy target).
8. **How to run it now:** the exact 5â€“8 commands for (a) local development and (b) Docker.

Do not claim completion unless every gate has shown real output.

## END PROMPT
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-08T14:52:04+05:30.

The user's current state is as follows:
Active Document: j:\QUEUE CUT\apps\web\src\components\destination\DestinationCard.tsx (LANGUAGE_TSX)
Cursor is on line: 1
Other open documents:
- j:\QUEUE CUT\.git\COMMIT_EDITMSG (LANGUAGE_UNSPECIFIED)
- j:\QUEUE CUT\apps\web\src\components\destination\DestinationCard.tsx (LANGUAGE_TSX)
- j:\QUEUE CUT\apps\api\src\main\java\com\queuecut\api\controller\AuthController.java (LANGUAGE_JAVA)
- j:\QUEUE CUT\README.md (LANGUAGE_MARKDOWN)
- j:\QUEUE CUT\queuecut_final.py (LANGUAGE_PYTHON)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from Gemini 3.1 Pro (High) to Claude Opus 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>
