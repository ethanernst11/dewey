from os import environ
from uuid import uuid4
from typing import List, Optional, TypedDict
import requests
import json

PROJECT_NAME = environ.get("PROJECT_NAME")
TOKEN = environ.get("ACCESS_TOKEN")
URL_ORIGIN = "https://app.productgenius.io"
USER = environ.get("USER")
PASS= environ.get("PASS")

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




def get_feed(project_name: str, session_id: str, *, page = 1, batch_count= 10, events = [], search_prompt = ""):

    URL = f"{URL_ORIGIN}/hackathon/{PROJECT_NAME}/feed/{session_id}"
    data = {
        "page": page,
        "batch_count": batch_count,
        "events": events,
        "search_prompt": search_prompt.strip()  
    }
    print(URL)
    print(TOKEN)
    print(data)

    response = requests.post(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            },
                            json=data
    )
    try:
        assert response.status_code == 200
    except Exception as e:
        print(response.json())
        print(e)
        return
    return response.json()
