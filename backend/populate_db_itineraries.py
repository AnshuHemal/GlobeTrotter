import json
from pathlib import Path
from pymongo import MongoClient, UpdateOne

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "globetrotter"
COLLECTION = "travel_packages"


def load_seed_data():
    data_path = Path(__file__).with_name("itinerary_seed.json")
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    col = db[COLLECTION]

    data = load_seed_data()

    ops = []
    for pkg in data:
        # Normalize numerics and ensure required keys
        pkg["current_price"] = float(pkg.get("current_price", 0))
        pkg["old_price"] = float(pkg.get("old_price", 0))
        pkg["save_amount"] = float(pkg.get("save_amount", 0))
        pkg["rating"] = float(pkg.get("rating", 0))
        pkg.setdefault("category", "")
        pkg.setdefault("subtitle", "")
        pkg.setdefault("description", "")
        pkg.setdefault("duration", "")
        pkg.setdefault("image_url", "")
        pkg.setdefault("itinerary", [])

        ops.append(
            UpdateOne(
                {"title": pkg["title"]},  # upsert by title in dev
                {"$set": pkg},
                upsert=True,
            )
        )

    if ops:
        result = col.bulk_write(ops, ordered=False)
        print("Upserted:", getattr(result, "upserted_count", 0))
        print("Modified:", result.modified_count)

    client.close()


if __name__ == "__main__":
    main()
