<div align="center">

# 🎓 Full‑Funded Masters Wiki

**A trustworthy, verifiable directory of fully funded master's scholarships** —
Europe · UK · China · Japan · South Korea · Taiwan · Singapore · Malaysia.

Every fact is extracted from the program's **official page** and dated. No aggregator blogs, no invented stats.

[![Built with SvelteKit](https://img.shields.io/badge/SvelteKit-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
![Scholarships](https://img.shields.io/badge/scholarships-201-blueviolet)

</div>

---

## ✨ What it is

A static, prerendered site that turns scattered scholarship pages into one **searchable, filterable ledger**.
Cards render to plain HTML (readable with JS off); search, filter, sort, and `.ics` deadline export run client‑side.

| Country | Count | | Country | Count |
|---|---|---|---|---|
| 🇪🇺 Europe | 127 | | 🇰🇷 South Korea | 8 |
| 🇬🇧 United Kingdom | 19 | | 🇹🇼 Taiwan | 8 |
| 🇨🇳 China | 19 | | 🇸🇬 Singapore | 4 |
| 🇯🇵 Japan | 13 | | 🇲🇾 Malaysia | 3 |

> **Total: 201 verified scholarships.**

---

## 🚀 Install · Run · Remove

```bash
# Install
git clone https://github.com/AnindyaMajumder/Full-Funded-Masters-Wiki.git && cd Full-Funded-Masters-Wiki
npm install

# Run (local dev at http://localhost:5173)
npm run dev

# Build static output + preview it
npm run build
npm run preview

# Type-check everything (.svelte + .ts)
npm run check
```

```bash
# Remove
rm -rf node_modules .svelte-kit     # clean the workspace
cd .. && rm -rf Full-Funded-Masters-Wiki   # remove entirely
```

Requires **Node 18+**. Output is prerendered static HTML (deployed via the Cloudflare adapter).

---

## 🗂️ How it's structured

**Data and presentation are strictly separated.** Components only *render* — they never hold scholarship facts.

```
src/
├─ types/scholarship.ts        # the Scholarship contract — single source of truth
├─ data/<country>.ts           # export const <country>: Scholarship[] = [...]
│  └─ all.ts                   # aggregates every country + helpers
├─ lib/
│  ├─ scholarship.ts           # helpers: status, tags, sort, .ics, country config
│  └─ components/
│     ├─ Directory.svelte      # reactive island: search / filter / sort
│     ├─ ScholarshipRow.svelte # static render of one scholarship
│     └─ Seo.svelte
└─ routes/
   ├─ +page.svelte             # landing hero + cross-country directory
   └─ [country]/+page.svelte   # one prerendered page per country

sources/<country>/<program>.html   # saved official pages used as research
scripts/build-data.mjs             # compile verified JSON → typed data file
```

One typed `.ts` file per country, each validated against one shared `Scholarship` type.
The `[country]` route prerenders every bucket automatically.

---

## 🐛 Reporting an issue

Found something off? [**Open an issue**](https://github.com/AnindyaMajumder/Full-Funded-Masters-Wiki/issues/new) — pick the type and include what's listed.

| Type | Use when | Please include |
|---|---|---|
| 🔗 **Broken link** | `officialLink` 404s or redirects | scholarship name, country, the correct URL |
| 📅 **Stale data** | a deadline, benefit, or requirement changed | the field, the new value, and the **official** page showing it |
| 🖥️ **UI / a11y bug** | layout, mobile, contrast, keyboard nav | screen width, browser/OS, a screenshot |
| ➕ **New scholarship/country** | you want one added | official link + confirmation it's open to the target applicant |
| 💡 **Feature idea** | search, filter, compare, etc. | what you want and why it helps an applicant |

> Tag accuracy matters most: a stale deadline or a dead official link is a higher-priority issue than a styling nit — the whole point is a resource an applicant can trust.

---

## 🤝 How to contribute

Adding a scholarship is **appending one typed object** to a country file. That's it.

**1.** Open the program's **official** page (optionally save it to `sources/<country>/`).
**2.** Append an object to `src/data/<country>.ts`:

```ts
{
  name: 'Example Excellence Scholarship',
  officialLink: 'https://university.edu/scholarship',   // primary source ONLY
  requiredDocuments: ['CV', 'Transcripts', 'Two references'],
  timeline: { cycle: '2025-2026', deadline: '2025-12-01' },
  benefits: ['Full tuition', 'Monthly stipend', 'Travel'],
  acceptanceRate: { value: 'Not officially published', isOfficial: false },
  mustKnow: ['Supervisor must be secured before applying'],
  sources: [{ label: 'Official page', url: 'https://…', accessed: '2026-06-20' }],
  lastVerified: '2026-06-20',
  tags: ['#NoIELTS', '#SupervisorRequired'],
}
```

**3.** Run `npm run check` to confirm it satisfies the type.
**4.** Tick it off in the **Coverage** section of [`CLAUDE.md`](./CLAUDE.md).

> Adding a **country**? Create `data/<country>.ts`, wire it into `data/all.ts` and
> `COUNTRY_ORDER` / `COUNTRY_LABELS` in `lib/scholarship.ts` — the route prerenders it for you.

### 📐 The six required fields

`officialLink` · `requiredDocuments` · `timeline` · `benefits` · `acceptanceRate` · `mustKnow`.
Everything else (stipend, age limit, language reqs, bonds…) is optional — **omit if unknown, never guess.**

### 🛡️ Data-integrity rules (non-negotiable)

1. **Never invent a statistic or a source.** No official rate? → `"Not officially published"`.
2. **`officialLink` = primary source only** — the funder's own page, never a blog.
3. **Cite every non-obvious claim** with a working URL + access date.
4. **Set `lastVerified`** whenever you check the facts.

### 🔀 Opening a pull request

```bash
# 1. Fork on GitHub, then clone your fork
git clone https://github.com/<you>/Full-Funded-Masters-Wiki.git
cd Full-Funded-Masters-Wiki && npm install

# 2. Branch off main
git checkout -b data/add-<country>-<scholarship>

# 3. Make your change, then verify it type-checks and builds
npm run check && npm run build

# 4. Commit and push
git commit -am "data(<country>): add <Scholarship Name>"
git push origin data/add-<country>-<scholarship>

# 5. Open a PR against `main` and describe the source you used
```

**PR checklist**

- [ ] `npm run check` passes (no type errors)
- [ ] `officialLink` points to the funder's own page
- [ ] every non-obvious fact has a `source` with a working URL + access date
- [ ] `lastVerified` set to the date you checked
- [ ] for a new scholarship: eligibility for the target applicant is confirmed on the official page

One scholarship (or one fix) per PR keeps reviews fast. Small, well-sourced PRs get merged quickest.

---

## 🧰 Tech stack

**SvelteKit 5** (runes) · **TypeScript** (strict) · prerendered static output · zero scholarship data in components.
Micro-animations are pure CSS / Svelte transitions and respect `prefers-reduced-motion`.

## 📄 License

[MIT](./LICENSE) © 2026 Anindya Majumder
