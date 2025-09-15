from pkgutil import iter_modules
import pandas as pd
from typing import List
from src.item_api import IngestionObject, add_items, get_items, METADATA
import json



def convert_df_to_items(df: pd.DataFrame) -> List[IngestionObject]:

    items = []
    for index, row in df.iterrows():

        metadata = [
            METADATA(name="imdb_id", value=row["imdb_title_id"]),
            METADATA(name="year", value=str(row["year"])),
            METADATA(name="genre", value=row["genre"]),
            # METADATA(name="duration", value=row["duration"]),
            METADATA(name="director", value=row["director"]),
            METADATA(name="writer", value=row["writer"]),
            METADATA(name="production_company", value=row["production_company"]),
            METADATA(name="actors", value=row["actors"]),
        ]

        items.append(IngestionObject(
            title=row["original_title"],
            description=row["description"],
            image_url="",
            external_url=f"https://www.imdb.com/title/{row['imdb_title_id']}",
            metadata=metadata
        ))
    return items

def convert_json_to_items(json_data: list[dict]) -> List[IngestionObject]:
    items = []
    for item in json_data:
        metadata = [
            METADATA(name=key, value=value) for key, value in item["metadata"].items()
        ]
        items.append(IngestionObject(
            title=item["title"],
            description=item["description"],
            image_url=item["image_url"],
            external_url=item["external_url"],
            metadata=metadata
        ))
    return items
from os import environ
PROJECT_NAME = environ.get("PROJECT_NAME")
# items = convert_json_to_items(json.load(open("dataset/books.json")))
# items = json.load(open("dataset/books.json"))
items = json.load(open("dataset/test.json"))
items = items[:50]
PROJECT_NAME = "dummy-name"
for item in items:
    item.pop("id")

res = add_items(PROJECT_NAME, items)
print(res)
# items = convert_df_to_items(df)[:4]
# res = add_items(items)
# print(res)
# PROJECT_NAME = "dummy-name"
# PROJECT_NAME = environ.get("PROJECT_NAME")
# items = get_items(PROJECT_NAME)[:3]
# print(json.dumps(items, indent=4))


# for index, row in df.iterrows():
#     print(row["title"])
#     print(row["description"])
#     print(row["image_url"])
#     print(row["external_url"])
#     print(row["metadata"])