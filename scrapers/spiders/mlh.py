import httpx
from bs4 import BeautifulSoup
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

class MLHSpider(Spider):
    def fetch(self) -> List[dict]:
        urls = [
            "https://mlh.io/seasons/2026/events",
            "https://mlh.io/seasons/2025/events"
        ]
        headers = {"User-Agent": "Mozilla/5.0"}
        
        events = []
        for url in urls:
            try:
                response = httpx.get(url, headers=headers, follow_redirects=True, timeout=15)
                if response.status_code != 200:
                    continue
                soup = BeautifulSoup(response.text, "html.parser")
                
                cards = soup.select("div.event-wrapper")
                if not cards:
                    cards = soup.select("div.event")
                if not cards:
                    cards = soup.select("a.event-link")
                    
                for card in cards:
                    try:
                        title_el = card.select_one("h3, h2, .event-name")
                        location_el = card.select_one(".event-location, .location")
                        date_el = card.select_one("p.event-date, .event-date")
                        
                        link_el = card if card.name == "a" else card.select_one("a")
                        if not link_el or "href" not in link_el.attrs:
                            continue
                            
                        href = link_el["href"]
                        full_url = href if href.startswith("http") else f"https://mlh.io{href}"
                        
                        events.append({
                            "title": title_el.text.strip() if title_el else "",
                            "date": date_el.text.strip() if date_el else "",
                            "location": location_el.text.strip() if location_el else "Unknown",
                            "url": full_url
                        })
                    except Exception:
                        continue
            except Exception as e:
                print(f"Error fetching MLH from {url}: {e}")
                
        return events

    def normalize(self, raw: dict) -> Listing:
        location = raw.get("location", "Unknown")
        remote = "Digital" in location or "Remote" in location or location == "Unknown"
        
        deadline = None
        
        return Listing(
            id=self.generate_id(raw["url"]),
            source="mlh",
            type="hackathon",
            title=raw["title"],
            org="MLH",
            url=raw["url"],
            description="",
            tags=["hackathon", "mlh"],
            location=location,
            remote=remote,
            stipend_min=None,
            stipend_max=None,
            prize_pool=None,
            deadline=deadline,
            posted_at=datetime.utcnow()
        )
