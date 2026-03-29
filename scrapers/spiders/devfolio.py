import httpx
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

class DevfolioSpider(Spider):
    def fetch(self) -> List[dict]:
        url = "https://api.devfolio.co/api/hackathons?page=0&per_page=20"
        headers = {
            "Content-Type": "application/json"
        }
        all_entries = []
        
        try:
            response = httpx.post(url, headers=headers, json={}, follow_redirects=True, timeout=15)
            if response.status_code == 200:
                data = response.json()
                hackathons = data.get("hackathons", [])
                all_entries.extend(hackathons)
            else:
                print(f"[Devfolio] POST request failed with status {response.status_code}")
        except Exception as e:
            print(f"[Devfolio] POST request failed: {e}")
            
        return all_entries

    def normalize(self, raw: dict) -> Listing:
        name = raw.get("name", "")
        slug = raw.get("slug", "")
        url = f"https://devfolio.co/hackathons/{slug}"
        
        description = raw.get("tagline", "")
        tags = raw.get("tags", [])
        
        ends_at = raw.get("ends_at", "")
        deadline = None
        if ends_at:
            try:
                # ISO format often used: "2024-05-15T18:00:00Z"
                deadline = datetime.fromisoformat(ends_at.replace('Z', '+00:00')).replace(tzinfo=None)
            except Exception:
                pass
                
        prize_pool = raw.get("prize_pool", None)
        location = raw.get("city", "Remote")
        remote = raw.get("is_online", True)
        
        return Listing(
            id=self.generate_id(url),
            source="devfolio",
            type="hackathon",
            title=name,
            org="Devfolio",
            url=url,
            description=description,
            tags=tags,
            location=location,
            remote=remote,
            stipend_min=None,
            stipend_max=None,
            prize_pool=prize_pool,
            deadline=deadline,
            posted_at=datetime.utcnow()
        )
