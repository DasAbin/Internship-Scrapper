import httpx
from bs4 import BeautifulSoup
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

class UnstopSpider(Spider):
    def fetch(self) -> List[dict]:
        events = []
        headers = {"User-Agent": "Mozilla/5.0"}
        
        for page in range(1, 6):
            url = f"https://unstop.com/hackathons?per_page=20&page={page}"
            try:
                response = httpx.get(url, headers=headers, timeout=10.0)
                if response.status_code != 200:
                    print(f"Failed to fetch Unstop page {page}: {response.status_code}")
                    continue
                    
                soup = BeautifulSoup(response.text, "html.parser")
                cards = soup.select("div.listing-card")
                if not cards:
                    cards = soup.select("a[href*='/hackathons/']")
                    
                for card in cards:
                    href = card.get("href") if card.name == "a" else card.select_one("a").get("href") if card.select_one("a") else None
                    if not href:
                        continue
                        
                    full_url = href if href.startswith("http") else f"https://unstop.com{href}"
                    
                    title_el = card.select_one("h2, .title, .content h3, h3")
                    org_el = card.select_one(".org, .organization")

                    events.append({
                        "title": title_el.text.strip() if title_el else "Unstop Hackathon",
                        "url": full_url,
                        "org": org_el.text.strip() if org_el else "Unstop",
                    })
            except Exception as e:
                print(f"Error fetching Unstop page {page}: {e}")
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
