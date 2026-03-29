import time
from scrapers.spiders.devpost import DevpostSpider
from scrapers.spiders.mlh import MLHSpider
from scrapers.spiders.unstop import UnstopSpider
from scrapers.spiders.internshala import InternshalaSpider
from scrapers.spiders.devfolio import DevfolioSpider

def main():
    start_time = time.time()
    
    spiders = [
        DevpostSpider(),
        MLHSpider(),
        UnstopSpider(),
        InternshalaSpider(),
        DevfolioSpider()
    ]
    
    print("Starting InternMatch Scrapers...")
    
    for spider in spiders:
        spider_name = spider.__class__.__name__
        print(f"\n--- Running {spider_name} ---")
        try:
            spider_start = time.time()
            found, inserted = spider.run()
            spider_time = time.time() - spider_start
            print(f"[{spider_name}] Complete. Found: {found}, Inserted: {inserted} (Runtime: {spider_time:.2f}s).")
        except Exception as e:
            print(f"[{spider_name}] Critical Error running spider: {e}")
            
    total_time = time.time() - start_time
    print(f"\nScraping complete! Total runtime: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()
