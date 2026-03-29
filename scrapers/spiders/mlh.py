import httpx
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

class HackerEarthSpider(Spider):
    def fetch(self) -> List[dict]:
        urls = [
            "https://www.hackerearth.com/api/v2/challenges/?type=hackathon&status=ongoing&limit=20",
            "https://www.hackerearth.com/api/v2/challenges/?type=hackathon&status=upcoming&limit=20"
        ]
        all_entries = []
        headers = {
            "client-secret": "none"
        }
        
        for url in urls:
            try:
                response = httpx.get(url, headers=headers, follow_redirects=True, timeout=15)
                print(f"[HackerEarth] Status code: {response.status_code}")
                print(f"[HackerEarth] Response preview: {response.text[:500]}")
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    all_entries.extend(results)
            except Exception as e:
                print(f"[HackerEarth] Request failed: {e}")
                
        return all_entries

    def normalize(self, raw: dict) -> Listing:
        title = raw.get("title", "")
        url = raw.get("url", "")
        tags = raw.get("tags", [])
        
        end_utc = raw.get("end_utc", "")
        deadline = None
        if end_utc:
            try:
                # Convert from ISO string (e.g. "2024-05-15T18:00:00Z") to naieve datetime
                deadline = datetime.fromisoformat(end_utc.replace('Z', '+00:00')).replace(tzinfo=None)
            except Exception:
                pass
                
        prize_pool = raw.get("prize_in_usd", None)
        
        location_restriction = raw.get("location_restriction", "")
        location = "India" if location_restriction == "INDIA" else "Unknown"
        remote = True if location == "Unknown" else False
        
        return Listing(
            id=self.generate_id(url),
            source="hackerearth",
            type="hackathon",
            title=title,
            org="HackerEarth",
            url=url,
            description="",
            tags=tags,
            location=location,
            remote=remote,
            stipend_min=None,
            stipend_max=None,
            prize_pool=prize_pool,
            deadline=deadline,
            posted_at=datetime.utcnow()
        )

# Retain MLHSpider name for potential explicit imports in other parts of the codebase
MLHSpider = HackerEarthSpider
