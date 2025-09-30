"""
The goal of hte function is to print the followign stats about the data:
Number of items that are ingested in the Database
Number of models trained 
"""

from src.item_api import get_items
from src.model_api import list_models

PROJECT_NAME = "Bookly"

PAGE_SIZE = 50
def get_all_items():
    page = 1
    all_items = []

    while True:
        items = get_items(PROJECT_NAME, page=page, page_size=PAGE_SIZE)
        if len(items) == 0:
            break
        all_items.extend(items)
        page += 1

    return all_items


def get_item_duplicate_count(items: list):

    duplicates = {}
    for item in items:

        if item["title"] in duplicates:
            duplicates[item["title"]].append(item["id"])
        else:
            duplicates[item["title"]] = [item["id"]]
    return duplicates


def get_model():
    models = list_models(PROJECT_NAME)
    return models

items = get_all_items()
print(f"Number of items that are ingested in the Database: {len(items)}")
duplicates = get_item_duplicate_count(items)
print(f"Number of distinct titles: {len(duplicates)}")
count_per_title = {key: len(item) for key, item in duplicates.items() if len(item) > 1}
print(f"Number of titles that have duplicates: {len(count_per_title)}")

models = get_model()
print(f"Number of models that are trained: {len(models)}")


