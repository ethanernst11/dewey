from os import environ
from re import U
import requests
import json

from urllib3.util import Url

PROJECT_NAME = environ.get("PROJECT_NAME")
TOKEN = environ.get("ACCESS_TOKEN")
URL_ORIGIN = "https://app.productgenius.io"
USERNAME_EMAIL = environ.get("USERNAME_EMAIL")
PASSWORD = environ.get("PASSWORD")
USER = environ.get("USER")
PASS= environ.get("PASS")
from uuid import uuid4
from typing import List, Optional, TypedDict

class METADATA(TypedDict):
    name: str
    value: str


class IngestionObject(TypedDict):
    id: Optional[uuid4]
    title: str
    description: str
    image_url: str
    external_url: str
    metadata: List[METADATA]



def add_items(project_name: str, items: List[IngestionObject]):

    URL = f"{URL_ORIGIN}/hackathon/project/{project_name}/items/create"

    print(json.dumps(items, indent=4))
    response = requests.post(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            },
                            data=json.dumps(items)
    )
    return response.json()


def get_items(project_name: str, *, page: int = 1, page_size: int = 10) -> List[IngestionObject]:
    URL = f"{URL_ORIGIN}/hackathon/project/{project_name}/items/list"
    response = requests.get(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            },
                            params={"page": page, "page_size": page_size})
    return response.json()



def get_item(project_name: str, item_id: str) -> IngestionObject:
    URL = f"{URL_ORIGIN}/hackathon/project/{project_name}/items/{item_id}"
    response = requests.get(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            })
    return response.json()

def update_item(project_name: str, item_id: str, item: IngestionObject) -> IngestionObject:
    URL = f"{URL_ORIGIN}/hackathon/project/{project_name}/items/{item_id}"
    response = requests.put(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            },
                            data=json.dumps(item))
    return response.json()


def delete_item(project_name: str, item_id: str) -> IngestionObject:
    URL = f"{URL_ORIGIN}/hackathon/project/{project_name}/items/{item_id}/delete"
    response = requests.delete(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            })
    return response.json()
