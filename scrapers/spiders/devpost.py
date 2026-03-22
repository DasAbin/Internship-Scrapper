import feedparser
from typing import List
from datetime import datetime
from email.utils import parsedate_to_datetime
from scrapers.base import Spider, Listing

class DevpostSpider(Spider):
    def fetch(self) -> List[dict]:
        feed = feedparser.parse("https://devpost.com/hackathons.rss")
        return feed.entries

    def normalize(self, raw: dict) -> Listing:
        title = raw.get("title", "")
        url = raw.get("link", "")
        
        raw_tags = raw.get("tags", [])
        tags = [t.term for t in raw_tags if 'term' in t]
        
        # Devpost RSS parser
        deadline = None
        
        posted_at = datetime.utcnow()
        try:
            if "published" in raw and raw["published"]:
                dt = parsedate_to_datetime(raw["published"])
                if dt:
                    posted_at = dt.replace(tzinfo=None)
        except Exception:
            pass

        description = raw.get("description", "")
        org = raw.get("author", "Devpost")
        
        return Listing(
            id=self.generate_id(url),
            source="devpost",
            type="hackathon",
            title=title,
            org=org,
            url=url,
            description=description[:1000], # Trucate just in case
            tags=tags,
            location="Remote",
            remote=True,
            stipend_min=None,
            stipend_max=None,
            prize_pool=None, 
            deadline=deadline,
            posted_at=posted_at
        )
