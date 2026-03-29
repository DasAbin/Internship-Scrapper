import httpx
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

class DevpostSpider(Spider):
    def fetch(self) -> List[dict]:
        urls = [
            "https://devpost.com/api/hackathons?challenge_type=all&status=open&page=1",
            "https://devpost.com/api/hackathons?challenge_type=all&status=open&page=2"
        ]
        all_entries = []
        headers = {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0"
        }
        
        for url in urls:
            try:
                response = httpx.get(url, headers=headers, follow_redirects=True, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    hackathons = data.get("hackathons", [])
                    all_entries.extend(hackathons)
                else:
                    print(f"[Devpost] API request failed with status {response.status_code} for {url}")
            except Exception as e:
                print(f"[Devpost] API request failed: {e}")
                
        return all_entries

    def normalize(self, raw: dict) -> Listing:
        title = raw.get("title", "")
        url = raw.get("url", "")
        
        themes = raw.get("themes", [])
        tags = [t.get("name", "") if isinstance(t, dict) else str(t) for t in themes]
        
        displayed_location = raw.get("displayed_location", {})
        location = displayed_location.get("location", "Unknown") if isinstance(displayed_location, dict) else "Unknown"
        
        prize_pool = raw.get("prize_amount", None)
        
        return Listing(
            id=self.generate_id(url),
            source="devpost",
            type="hackathon",
            title=title,
            org="Devpost",
            url=url,
            description="",
            tags=tags,
            location=location,
            remote=True,
            stipend_min=None,
            stipend_max=None,
            prize_pool=prize_pool,
            deadline=None,
            posted_at=datetime.utcnow()
        )
