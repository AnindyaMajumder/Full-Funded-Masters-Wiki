#!/usr/bin/env python3
"""Backfill sources/ archive for southkorea, taiwan, singapore, malaysia."""
import asyncio
import os
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, BrowserConfig, CacheMode

PAGES = [
    # southkorea
    ("southkorea", "global-korea-scholarship-gks-g-study-in-korea__1.md",
     "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do"),
    ("southkorea", "kaist-international-graduate-scholarship__1.md",
     "https://admission.kaist.ac.kr/intl-graduate/FinancialSupport/Scholarship/KAISTScholarship"),
    ("southkorea", "gist-international-graduate-scholarship__1.md",
     "https://www.gist.ac.kr/iadm/html/sub04/0401.html"),
    ("southkorea", "dgist-graduate-scholarship__1.md",
     "https://www.dgist.ac.kr/iadm/sub02_01_02.do"),
    ("southkorea", "unist-graduate-scholarship__1.md",
     "https://cia.unist.ac.kr/quick-links/scholarship/"),
    ("southkorea", "postech-graduate-assistantship__1.md",
     "https://www.postech.ac.kr/eng/admission-aid/scholarship_types.do"),
    ("southkorea", "snu-graduate-scholarship-gsfs__1.md",
     "https://oga.snu.ac.kr/graduate-scholarship-excellent-foreign-students-gsfs"),
    ("southkorea", "koica-ciat-scholarship__1.md",
     "https://www.koica.go.kr/sites/ciat/index.do"),
    # taiwan
    ("taiwan", "moe-taiwan-scholarship__1.md",
     "https://taiwanscholarship.moe.gov.tw/web/index.aspx"),
    ("taiwan", "ntu-taiwan-elite-and-outstanding-graduate-scholarship__1.md",
     "https://isss.ntu.edu.tw/finances/scholarships/"),
    ("taiwan", "nthu-international-student-scholarship__1.md",
     "https://apply.nthu.edu.tw/en/article/102-nthu-scholarship"),
    ("taiwan", "nycu-international-student-scholarship__1.md",
     "https://oia.nycu.edu.tw/oia/en/app/data/view?id=792&module=nycu0012&serno=0f046f83-4147-4ec7-8921-bbaccd8c678f"),
    ("taiwan", "ncku-distinguished-international-student-scholarship__1.md",
     "https://oia.ncku.edu.tw/p/404-1032-229890.php?Lang=en"),
    ("taiwan", "ntust-international-student-scholarship__1.md",
     "https://oia-r.ntust.edu.tw/p/412-1060-8931.php?Lang=en"),
    ("taiwan", "nccu-new-inbound-international-scholarship__1.md",
     "https://oic.nccu.edu.tw/Post/1074"),
    # singapore
    ("singapore", "nus-research-scholarship__1.md",
     "https://nusgs.nus.edu.sg/scholarships/nus-research-scholarship"),
    ("singapore", "ntu-research-scholarship__1.md",
     "https://www.ntu.edu.sg/admissions/graduate/financialmatters/scholarships/rss"),
    ("singapore", "lkyspp-endowed-school-funded-scholarship__1.md",
     "https://lkyspp.nus.edu.sg/graduate-admissions/fees-and-funding"),
    ("singapore", "lkyspp-hinrich-global-trade-leader-scholarship__1.md",
     "https://www.hinrichfoundation.com/education/scholarships/lkyspp-mia"),
    # malaysia
    ("malaysia", "mtcp-scholarship__1.md",
     "https://mtcp.kln.gov.my/scholarship"),
    ("malaysia", "malaysia-international-scholarship-mis__1.md",
     "https://biasiswa.mohe.gov.my/INTER/index.php"),
    ("malaysia", "universiti-malaya-scholarship-scheme-umss__1.md",
     "https://umresearch.um.edu.my/join-us/universiti-malaya-scholarshipscheme-umss/"),
]

BASE = os.path.join(os.path.dirname(__file__), "..", "sources")

config = CrawlerRunConfig(
    page_timeout=45000,
    wait_for="css:body",
    scan_full_page=True,
    delay_before_return_html=2.0,
    cache_mode=CacheMode.BYPASS,
)

browser_cfg = BrowserConfig(headless=True, verbose=False)


async def crawl_one(crawler, country, filename, url):
    dest_dir = os.path.join(BASE, country)
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, filename)
    try:
        result = await crawler.arun(url, config=config)
        content = ""
        if result.markdown:
            md = result.markdown
            content = md.raw_markdown if hasattr(md, "raw_markdown") else str(md)
        if not content.strip() and result.html:
            content = result.html
        if not content.strip():
            content = f"# Crawl attempted\nURL: {url}\nNo content returned."
        header = f"<!-- source: {url} | archived: 2026-06-21 -->\n\n"
        with open(dest, "w", encoding="utf-8") as f:
            f.write(header + content)
        size = len(content)
        print(f"  ✓ {country}/{filename} ({size:,} chars)")
    except Exception as e:
        error_content = f"<!-- source: {url} | archived: 2026-06-21 | ERROR: {e} -->\n\n# Crawl failed\nURL: {url}\nError: {e}\n"
        with open(dest, "w", encoding="utf-8") as f:
            f.write(error_content)
        print(f"  ✗ {country}/{filename} — {e}")


async def main():
    # batch into groups of 5 to avoid overwhelming servers
    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        batch_size = 5
        for i in range(0, len(PAGES), batch_size):
            batch = PAGES[i:i + batch_size]
            print(f"\nBatch {i//batch_size + 1}/{(len(PAGES)-1)//batch_size + 1}: {[p[1][:35] for p in batch]}")
            await asyncio.gather(*[crawl_one(crawler, c, f, u) for c, f, u in batch])

    print("\nDone.")
    for country in ["southkorea", "taiwan", "singapore", "malaysia"]:
        d = os.path.join(BASE, country)
        if os.path.isdir(d):
            n = len(os.listdir(d))
            print(f"  sources/{country}/: {n} file(s)")


asyncio.run(main())
