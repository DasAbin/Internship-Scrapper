import httpx
from bs4 import BeautifulSoup

url = "https://devpost.com/hackathons?open_to=public&status=open"
headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}
try:
    response = httpx.get(url, headers=headers, follow_redirects=True, timeout=15)
    print("Status:", response.status_code)
    soup = BeautifulSoup(response.text, "html.parser")
    # Finding out what classes elements have
    print("div.hackathon-tile count:", len(soup.select("div.hackathon-tile")))
    print("a[data-challenge-id] count:", len(soup.select("a[data-challenge-id]")))
    
    # Try looking for other typical event containers
    containers = soup.select(".hackathon-tile")
    if not containers:
        containers = soup.select(".challenge-listing")
    print(".challenge-listing count:", len(containers))
    
    articles = soup.select("article")
    print("article count:", len(articles))
    
    # Save a small block to text
    with open("devpost_html_sample.html", "w") as f:
        f.write(response.text[:10000])
except Exception as e:
    print(e)
