import re
from typing import List
from datetime import datetime
from scrapers.base import Spider, Listing

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

class InternshalaSpider(Spider):
    def fetch(self) -> List[dict]:
        if not sync_playwright:
            print("Playwright not installed, skipping internshala")
            return []
            
        events = []
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                page.goto("https://internshala.com/internships/", timeout=60000)
                page.wait_for_selector(".internship_meta", timeout=30000)
                
                cards_elements = page.query_selector_all(".internship_meta")
                for card in cards_elements:
                    try:
                        title_el = card.query_selector(".heading_4_5, .job-title-href")
                        company_el = card.query_selector(".heading_6, .company-name")
                        location_el = card.query_selector("a.location_link")
                        stipend_el = card.query_selector("span.stipend")
                        
                        url = ""
                        if title_el:
                            href = title_el.get_attribute("href")
                            url = "https://internshala.com" + href if href else ""

                        events.append({
                            "title": title_el.inner_text().strip() if title_el else "Internshala Internship",
                            "company": company_el.inner_text().strip() if company_el else "Unknown",
                            "location": location_el.inner_text().strip() if location_el else "Unknown",
                            "stipend": stipend_el.inner_text().strip() if stipend_el else "",
                            "url": url,
                        })
                    except Exception as e:
                        print(f"Error extracting Internshala card: {e}")
            except Exception as e:
                print(f"Error fetching Internshala: {e}")
            finally:
                browser.close()
                
        return events

    def normalize(self, raw: dict) -> Listing:
        location = raw.get("location", "Unknown")
        remote = "work from home" in location.lower() or "remote" in location.lower()
        
        stipend_text = raw.get("stipend", "")
        stipend_min = None
        stipend_max = None
        
        numbers = re.findall(r'\d+(?:,\d+)?', stipend_text)
        if numbers:
            parsed_nums = [int(n.replace(',', '')) for n in numbers]
            if len(parsed_nums) == 1:
                stipend_min = stipend_max = parsed_nums[0]
            elif len(parsed_nums) >= 2:
                stipend_min = parsed_nums[0]
                stipend_max = parsed_nums[1]
                
        return Listing(
            id=self.generate_id(raw["url"]),
            source="internshala",
            type="internship",
            title=raw["title"],
            org=raw["company"],
            url=raw["url"],
            description="",
            tags=["internship"],
            location=location,
            remote=remote,
            stipend_min=stipend_min,
            stipend_max=stipend_max,
            prize_pool=None, 
            deadline=None,
            posted_at=datetime.utcnow()
        )
