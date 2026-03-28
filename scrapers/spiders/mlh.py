import httpx
from bs4 import BeautifulSoup
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

class MLHSpider(Spider):
    def fetch(self) -> List[dict]:
        response = httpx.get("https://mlh.io/seasons/2025/events", follow_redirects=True)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        events = []
        for card in soup.select("div.event-wrapper"):
            title_el = card.select_one("h3.event-name")
            date_el = card.select_one("p.event-date")
            location_inner = card.select_one("div.event-location span[itemprop='locality']")
            state_inner = card.select_one("div.event-location span[itemprop='region']")
            link_el = card.select_one("a.event-link")
            
            loc = "Remote"
            if location_inner:
                loc = location_inner.text.strip()
                if state_inner:
                    loc += f", {state_inner.text.strip()}"

            events.append({
                "title": title_el.text.strip() if title_el else "",
                "date": date_el.text.strip() if date_el else "",
                "location": loc,
                "url": link_el["href"] if link_el and "href" in link_el.attrs else ""
            })
        return events

    def normalize(self, raw: dict) -> Listing:
        location = raw.get("location", "Unknown")
        remote = "Digital" in location or "Remote" in location or location == "Unknown"
        
        # Basic deadline mapping omitted to prevent parser errors on weird formats
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
