import hashlib
import os
import psycopg2
from psycopg2.extras import execute_values
from dataclasses import dataclass, asdict
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(".env.local"))

_model = None
def get_embedding_model():
    global _model
    if _model is None and SentenceTransformer is not None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL is not set in .env")
    return psycopg2.connect(db_url)

@dataclass
class Listing:
    id: str  # md5 of url
    source: str
    type: str
    title: str
    org: str
    url: str
    description: str
    tags: List[str]
    location: str
    remote: bool
    stipend_min: Optional[int]
    stipend_max: Optional[int]
    prize_pool: Optional[int]
    deadline: Optional[datetime]
    posted_at: datetime
    embedding: Optional[List[float]] = None

    def generate_embedding(self):
        text_to_embed = f"{self.title} {' '.join(self.tags)} {self.description[:300]}"
        model = get_embedding_model()
        if model:
            self.embedding = model.encode(text_to_embed).tolist()

class Spider:
    def fetch(self) -> List[dict]:
        raise NotImplementedError

    def normalize(self, raw: dict) -> Listing:
        raise NotImplementedError

    def generate_id(self, url: str) -> str:
        return hashlib.md5(url.encode('utf-8')).hexdigest()

    def run(self) -> tuple[int, int]:
        raw_items = []
        try:
            raw_items = self.fetch()
        except Exception as e:
            print(f"Error fetching data: {e}")
            return (0, 0)
            
        listings = []
        for item in raw_items:
            try:
                listing = self.normalize(item)
                listing.generate_embedding()
                listings.append(listing)
            except Exception as e:
                print(f"Error normalizing item: {e}")

        inserted_count = self.upsert_to_db(listings)
        return (len(raw_items), inserted_count)

    def upsert_to_db(self, listings: List[Listing]) -> int:
        if not listings:
            return 0
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        insert_query = """
            INSERT INTO listings (
                id, source, type, title, org, url, description, tags, 
                location, remote, stipend_min, stipend_max, prize_pool, 
                deadline, posted_at, embedding
            ) VALUES %s
            ON CONFLICT (url) DO NOTHING
            RETURNING id;
        """
        
        values = []
        for l in listings:
            values.append((
                l.id, l.source, l.type, l.title, l.org, l.url, l.description, l.tags,
                l.location, l.remote, l.stipend_min, l.stipend_max, l.prize_pool,
                l.deadline, l.posted_at, l.embedding
            ))
            
        try:
            result = execute_values(cursor, insert_query, values, fetch=True)
            conn.commit()
            count = len(result)
        except Exception as e:
            print(f"Database insertion error: {e}")
            conn.rollback()
            count = 0
        finally:
            cursor.close()
            conn.close()
            
        return count
