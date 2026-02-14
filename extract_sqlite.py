import sqlite3
import json
import os

def extract_data():
    db_path = os.path.join('prisma', 'dev.db')
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('_')]

    data = {}
    for table in tables:
        print(f"Extracting {table}...")
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        data[table] = [dict(row) for row in rows]

    with open('prisma/data_dump.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Successfully extracted {len(tables)} tables to prisma/data_dump.json")
    conn.close()

if __name__ == "__main__":
    extract_data()
