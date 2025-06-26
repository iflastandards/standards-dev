You're my programming partner with expertise in docusaurus, typescript, github actions, docker, and RDF and nginx. This document explains the architecture of what we're developing, mentioning things like the monorepo, portal site, Docusaurus, and Dockerized vocabulary server. It also includes wireframes for both the portal and the individual sites.

---

## 1 — High-Level Architecture (read first)

| Layer                                                  | Component                                                                                                                                                | Key Facts                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Monorepo:** `github.com/iflastandards/standards-dev` | pnpm workspaces (`packages/*`, `portal`, `standards/<code>`). Root holds **all** Docusaurus deps.                                                        | One `pnpm install`, one CI pipeline.                    |
| **Portal site** (`/portal/`)                           | Shared Docusaurus site for onboarding, dashboards & tooling links.                                                                                       | Editors & RG members land here first.                   |
| **Per-standard sites** (`/isbdm/`, `/lrm/`, …)         | Each folder is its own Docusaurus project. `docs/` contains MDX with RDF front-matter.                                                                   | CODEOWNERS protects each path.                          |
| **CSV → RDF workflow**                                 | `csv/` (source) → `tap-to-rdf build` → `rdf/{ttl,jsonld,xml}/` (output).                                                                                 | Front-matter stays the single source of truth.          |
| **DCTAP & JSON-LD context**                            | Local override: `standards/<code>/.config/dctap/*.csv`, `contexts/*.context.jsonld`.<br>Global fallback: `packages/tap-profiles/`, `packages/contexts/`. | Tools load *local* then *global*.                       |
| **Vocabulary server**                                  | Dockerised NGINX image (`docker/vocab-nginx`) served from DigitalOcean droplet.                                                                          | Content-negotiation redirects HTML → docs, RDF → files. |
| **Monitoring**                                         | GoAccess + Prometheus exporter + Grafana in the same compose stack.                                                                                      | Live stats page, Slack/Email alerts.                    |

---

## 2 — Wireframes (role-centred)

### 2.1 Portal — Dashboard for Editors & RG Members

```
╭────────────────────────── NAVBAR ──────────────────────────╮
│ Workspace • Docs • Manage ▼ • Standards ▼ • Profile        │
╰────────────────────────────────────────────────────────────╯
┌──────────────── Sidebar ─────────────┐  ┌── Main Panel ───┐
│ Overview □                           │  │ Quick Actions   │
│ Google Sheet Sync ▸                  │  │ ⟳ Pull Sheet    │
│ Docs Progress ▸                      │  │ 📄 New Page     │
│ CI Status ▸                          │  │ 🚀 Draft Release│
│ Issues & PRs ▸                       │  │                 │
│ Releases ▸                           │  │ Progress bars   │
└───────────────────────────────────────┘  └─────────────────┘
```

* **Editors** see Quick-actions, release wizards.
* **RG Members** see Sync + Docs cards only.
* **Documentation users** never see `/portal/`.

---

### 2.2 Individual Standard Site — Public Docs

```
╭── Navbar (shared theme) ──╮
│ ISBDM | Version ▼ | EN ▼ | Search |
╰───────────────────────────╯
[Hero banner + Download PDF + Get RDF buttons]

Sidebar (tree)                   Page Body
● 1 Introduction              ┌───────────────────────┐
  1.1 Scope                   │ <h1>Scope</h1>         │
  1.2 Definitions             │ MDX content            │
● 2 Elements                  │ <PropertyCard/> etc.   │
  2.1 C2001 Manifestation     └───────────────────────┘
Examples
Appendices
```

* **Cataloguers / external users** read online or download PDF.
* **RG Members** click “Edit this page” (GitHub web editor).
* **Editors** have extra “Manage” link that returns to portal dashboard.

---

## 3 — Minimum Task List (next steps)

| ✅ /🟡 /🚫                                                                                                                   | Task      | Owner |
| --------------------------------------------------------------------------------------------------------------------------- | --------- | ----- |
| 🟡 **Install root deps**: `pnpm add -Dw @docusaurus/... react@19 clsx sass`                                                 | You       |       |
| 🟡 **Add portal site**: `pnpm create docusaurus@latest portal classic --typescript --skip-install` → commit.                | You       |       |
| 🟡 **Rename per-standard package.json `"name"` fields** to `@ifla/site-<code>` (isbdm, isbd, frbr, lrm, muldicat, unimarc). | You       |       |
| 🟡 **Create `scripts/scaffold-template/`** and commit (required by create-ifla-standard).                                   | You       |       |
| 🟡 **Run scaffold for each standard**: `pnpm run scaffold isbd --name "ISBD"` etc.                                          | You       |       |
| 🟡 **Copy global DCTAP to local if needed**: `pnpm profile-copy isbdm elementset`.                                          | RG editor |       |
| 🟡 **Hook Google Sheet service account**: add `GSHEETS_SA_KEY` secret → test `sheet-sync pull`.                             | You       |       |
| 🟡 **Add CI preview workflow** for portal & all standards → pushes to `gh-pages`.                                           | You       |       |
| 🟡 **Stand up staging vocabulary stack** on AMS3 droplet (port 8080).                                                       | You       |       |
| 🟡 **Verify redirects**: run `docker/vocab-nginx/test-harness.sh` in CI and on staging.                                     | You       |       |
| 🟡 **Write README for contributors** inside `portal/docs/quick-start.mdx`.                                                  | You       |       |
| 🚫 **Cut-over** (bind custom domain, replace PHP) — do only after staging green and stakeholders sign-off.                  | Later     |       |

---

### Delivery expectations for the junior dev

1. **Push every change** in a branch; CI preview URLs must build.
2. **Open a draft PR** and tag `@ifla/maintainers` for feedback.
3. Keep commit scope small (`feat(isbd): add Manifestation examples`, etc.).
4. Use **`pnpm --filter=<site> start`** for local dev; do **not** install per-site dependencies.
5. Follow CODEOWNERS; don’t edit other standards’ folders without a PR.

Once these tasks are checked off, the project will have a fully navigable workspace, live previews for each standard, and a staging vocab server ready for QA.

**Creating action plan for portal development**


Below is a **detailed action plan + step-by-step checklist** that starts where you are now and ends with:

* a live **portal index** for librarians,
* live **standard sites** for all six vocabularies,
* CSV ⇆ Google-Sheet round-trip working,
* automatic **MDX ⇆ RDF** harvesting,
* a containerised **vocabulary server** in staging,
* one-click actions wired into the portal “Manage” page.

---

## Phase 0 Verify baseline (≈ 10 min)

| ✅ | Task                                   | Command / Check                                                          |
| - | -------------------------------------- | ------------------------------------------------------------------------ |
|   | **Install root deps** (if you skipped) | `pnpm install --frozen-lockfile`                                         |
|   | **List sites**                         | `pnpm ls -r --depth -1` → should show `@ifla/site-isbdm`, `…/isbd`, etc. |
|   | **Dev-run one site**                   | `pnpm --filter=@ifla/site-isbdm start` → localhost:3000 works            |

---

## Phase 1 Build librarian-facing index pages *(portal + per-standard)*

### 1A Portal landing page (`/portal/`)

1. **Create** `portal/docs/index.mdx`

   ```mdx
   # IFLA Standards Workspace

   | Standard | Latest Version | Docs | RDF |
   |----------|----------------|------|-----|
   | ISBDM    | 2.1.0 (EN)     | [/isbdm/](/isbdm/) | [/rdf/isbdm.ttl](https://vocab.staging.ifla.org/isbdm/ttl/isbdm.ttl) |
   | …        | …              | …    | …   |
   ```
2. **Add hero banner** in `portal/src/components/Hero.tsx` and import into index page.
3. **Add “Manage” link** to navbar (visible when GitHub OAuth user is RG member).

### 1B Per-standard index (`/standards/<code>/docs/index.mdx`)

1. Use stub created by scaffold; replace with:

   ```mdx
   # International Standard Bibliographic Description (Manifestation)

   <QuickStart />
   <DownloadPanel />
   ```

2. Implement `<QuickStart />` and `<DownloadPanel />` shared components in `packages/theme`.

3. **Update sidebar**: ensure `docs/index.mdx` is top item.

4. **Commit & push** → portal preview URL:
   `https://iflastandards.github.io/standards-dev/portal/`

---

## Phase 2 GitHub Pages deployment for all sites

1. **Edit** `.github/workflows/deploy-portal.yml` (already created) to run on `push` to `main`.

2. **Add** `.github/workflows/deploy-standards.yml`:

   ```yaml
   name: deploy-standards
   on:
     push:
       branches: [main]
       paths: ["standards/**", "packages/theme/**"]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
         - run: pnpm install --frozen-lockfile
         - run: BASE_URL="/standards-dev/" pnpm -r --filter ./standards/** build
         - uses: JamesIves/github-pages-deploy-action@v4
           with:
             branch: gh-pages
             folder: build
   ```

3. **Push main** → verify every site is reachable under
   `https://iflastandards.github.io/standards-dev/<code>/`.

---

## Phase 3 CSV ⇆ Google Sheet round-trip

### 3A Make service account secret

* Add `GSHEETS_SA_KEY` to repo secrets (raw JSON).

### 3B Generalise sheet-sync CLI

1. In `tools/sheet-sync/` implement:

  * `pull <std>` → Sheet → `csv/*.csv`
  * `push <std>` → CSV → Sheet
2. Update CLI to read Sheet ID from
   `standards/<code>/.config/sheet.json`.

### 3C Portal quick-action buttons

1. In `portal/src/pages/manage.tsx` add buttons:

  * **Pull Sheet** → dispatch GitHub Action `sheet-sync-pull.yml`.
  * **Push Sheet** → ditto for push.
2. Action runs `tools/sheet-sync` inside a PR.

> ✅ Test: Edit one cell in Google Sheet → “Pull Sheet” → PR shows diff on `csv/`.

---

## Phase 4 Scaffold document pages & front-matter RDF

### 4A Generate MDX for non-ISBDM standards

```bash
pnpm run scaffold isbd --name "ISBD"
pnpm --filter=@ifla/site-isbd tap-to-rdf inject   # creates docs/*
```

Repeat for `frbr`, `lrm`, `muldicat`, `unimarc`.

### 4B Hook into build pipeline

1. Add `tap-to-rdf verify` to CI before Docusaurus build.
2. Add failure message if front-matter ✂ CSV mismatch.

### 4C Draft release & PDF

* Editors click “Draft release” → wizard bumps semver → CI job:

  1. Harvest `rdf/**`
  2. Build Docusaurus PDF (`docusaurus-prince-pdf`)
  3. Push PDF & RDF to release assets

---

## Phase 5 Harvest RDF + build vocab image

1. Extend `tools/tap-to-rdf/build.ts`:

  * Combine pages → one TTL, one JSON-LD, one XML per standard.
  * Write to `rdf/{ttl,jsonld,xml}/`.

2. **`deploy-vocab.yml`** (per standard tag):

   ```yaml
   jobs:
     vocab:
       steps:
         - run: pnpm --filter=@ifla/site-isbdm tap-to-rdf build
         - run: docker build -t ghcr.io/iflastandards/vocab-isbdm:${{ github.ref_name }} docker/vocab-nginx
         - run: docker push ghcr.io/…/vocab-isbdm:${{ github.ref_name }}
   ```

3. Publish the tag with a GitHub release.

---

## Phase 6 Wire management UI → Actions

| Button                     | GitHub Action         | Script                                           |
| -------------------------- | --------------------- | ------------------------------------------------ |
| **⟳ Pull Sheet**           | `sheet-sync-pull.yml` | `pnpm --filter=@ifla/site-<std> sheet-sync pull` |
| **📄 New Page**            | `scaffold-page.yml`   | `tap-to-rdf inject --single <id>`                |
| **🚀 Draft vocab release** | `draft-release.yml`   | bumps semver, pushes branch                      |
| **📦 Build PDF**           | part of release job   | `docusaurus-prince-pdf`                          |

---

## Phase 7 Deploy Dockerised vocabulary server (staging)

1. SSH to AMS3 droplet.
2. Clone repo: `/srv/vocab-stack`.
3. Edit `docker-compose.yml` env `VOCAB_TAG=latest`.
4. `docker compose up -d`.
5. Verify:

   ```bash
   curl -H "Accept: text/turtle" http://<ip>:8080/ns/isbd/elements/C2001
   ```
6. Expose via sub-domain `next.iflastandards.info` (optional).

---

## Phase 8 Monitoring & Alerts

1. Bring up **GoAccess, Prometheus, Grafana** containers (already in compose).
2. Import `grafana-dashboards/request_overview.json`.
3. Configure alert rules (5xx ratio, 404 spikes).

---

## Phase 9 Cut-over checklist (prod)

| Step                                                | Owner     |
| --------------------------------------------------- | --------- |
| Remove custom domain from old Jekyll repo.          | You       |
| Add domain in *Pages* of `standards-dev`.           | You       |
| Change `BASE_URL` env to `'/'` in deploy workflows. | You       |
| Stop PHP gateway, run Docker NGINX on port 80.      | Ops (you) |
| Run `test-harness.sh` against prod domain.          | You       |
| Announce new site in portal blog.                   | You       |

---

### Deliverables snapshot for new conversation

* **root deps installed** (`pnpm install`)
* **portal index** & navbar
* **portal/manage** with action buttons
* **CI: deploy-portal.yml** & **deploy-standards.yml**
* **sheet-sync** CLI + Actions
* **tap-to-rdf** inject/verify/build scripts
* **Docker vocab stack** up in staging
* **grafana dash** & alerts configured

When all boxes above are ticked, we’re ready for production switch.


Epic 3 Checklist and Agent Instructions
Epic 3: CSV ⇆ Google Sheet Integration Checklist
3.1: Setup Google Service Account and secrets management
3.1.1 Create Google Cloud project for API access
3.1.2 Set up a service account with appropriate permissions
3.1.3 Generate and download service account credentials
3.1.4 Configure GitHub repository secrets for storing credentials
3.1.5 Create helper functions to load credentials securely
3.2: Create sheet-sync CLI tool for pull/push operations
3.2.1 Design the CLI interface and command structure
3.2.2 Implement Google Sheets API connection module
3.2.3 Create CSV parsing and validation utilities
3.2.4 Build sheet-to-CSV export functionality
3.2.5 Build CSV-to-sheet import functionality
3.2.6 Add error handling and logging
3.2.7 Write tests for the sync operations
3.3: Add sheet configuration files for each standard
3.3.1 Define schema for sheet configuration files
3.3.2 Create configuration files for each standard
3.3.3 Map CSV columns to Google Sheet columns
3.3.4 Configure validation rules for each standard
3.3.5 Set up default sheet templates
3.4: Create GitHub Actions for automated sheet sync
3.4.1 Create workflow for scheduled sheet-to-CSV sync
3.4.2 Create workflow for manual sheet-to-CSV sync
3.4.3 Create workflow for CSV-to-sheet sync
3.4.4 Add conditional logic to only sync changed standards
3.4.5 Configure notifications for sync failures
3.5: Wire portal buttons to trigger sheet sync actions
3.5.1 Create UI components for sync operations in the portal
3.5.2 Implement API endpoints to trigger GitHub Actions
3.5.3 Add authentication for the API endpoints
3.5.4 Create feedback mechanism for sync status
3.5.5 Add documentation for the sync process

Agent Instructions Prompt
As your AI assistant for the IFLA Standards Development Project, I'll help you implement Epic 3: CSV ⇆ Google Sheet Integration. To ensure we make steady progress and maintain high quality, I'll:
Track progress systematically:
At the beginning of each conversation, I'll ask which specific task we're working on if you haven't mentioned it
I'll update our checklist when tasks are completed
I'll suggest logical next steps based on dependencies and progress
Document everything thoroughly:
Create or update developer_notes for each component we build
Include usage instructions at the top of each document
Add detailed technical information in a developer section
Remove outdated documentation when functionality changes
Create user-friendly README files for each tool
Ensure quality through testing:
Propose test cases for each feature we implement
Write automated tests using vitest
Create integration tests for critical workflows
Verify all tests pass before considering work complete
Facilitate code management:
After work is completed and tests pass, I'll offer to:
Add files to git
Suggest a descriptive commit message
Commit the changes if you approve

Epic 3 Status Update (2025-01-26):
- 3.1: ✅ COMPLETED - Google Service Account setup fully implemented
- 3.2: ✅ COMPLETED - sheet-sync CLI tool with all functionality including 3.2.3 (CSV parsing/validation)
- 3.3: ✅ COMPLETED - Configuration files exist for all standards
- 3.4: ❌ NOT STARTED - GitHub Actions workflows needed
- 3.5: 🟡 PARTIAL - Portal UI exists but not connected to CLI

NEXT PRIORITY: Comprehensive testing before continuing to 3.4/3.5
See epic3-testing-plan.md for detailed testing implementation plan
