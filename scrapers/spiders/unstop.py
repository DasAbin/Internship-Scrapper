from playwright.sync_api import sync_playwright
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

class UnstopSpider(Spider):
    def fetch(self) -> List[dict]:
        events = []
        seen_hrefs = set()
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(user_agent="Mozilla/5.0")
            page = context.new_page()
            
            for pg in range(1, 4):
                url = f"https://unstop.com/hackathons?per_page=20&page={pg}"
                try:
                    page.goto(url, wait_until="networkidle", timeout=30000)
                    page.wait_for_timeout(2000)
                    
                    cards = page.query_selector_all("a[href*='/hackathons/']")
                    for card in cards:
                        try:
                            href = card.get_attribute("href")
                            if not href or href in seen_hrefs:
                                continue
                            seen_hrefs.add(href)
                            
                            full_url = href if href.startswith("http") else f"https://unstop.com{href}"
                            
                            title_el = card.query_selector("h2, h3, .title, strong")
                            title = title_el.inner_text().strip() if title_el else "Unstop Hackathon"
                            
                            org_el = card.query_selector(".org-name, .company, span.truncate")
                            org = org_el.inner_text().strip() if org_el else "Unstop"
                            
                            events.append({
                                "title": title,
                                "url": full_url,
                                "org": org,
                            })
                        except Exception:
                            continue
                except Exception as e:
                    print(f"Error on Unstop page {pg}: {e}")
                    
            browser.close()
            
        return events

    def normalize(self, raw: dict) -> Listing:
        return Listing(
            id=self.generate_id(raw["url"]),
            source="unstop",
            type="hackathon",
            title=raw["title"],
            org=raw["org"],
            url=raw["url"],
            description="",
            tags=["hackathon"],
            location="Remote",
            remote=True,
            stipend_min=None,
            stipend_max=None,
            prize_pool=None, 
            deadline=None,
            posted_at=datetime.utcnow()
        )
