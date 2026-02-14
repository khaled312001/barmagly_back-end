import sqlite3
import json
import os

def extract_data_safe():
    # Use URI for read-only access to bypass locks
    db_uri = 'file:prisma/dev.db?mode=ro'
    print(f"Attempting to connect to {db_uri}...")
    
    try:
        conn = sqlite3.connect(db_uri, uri=True)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        print("Connected. Fetching tables...")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('_')]

        data = {}
        for table in tables:
            print(f"Extracting {table}...")
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            data[table] = [dict(row) for row in rows]

        with open('prisma_full_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"DONE! Saved to prisma_full_data.json")
        conn.close()
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    extract_data_safe()
