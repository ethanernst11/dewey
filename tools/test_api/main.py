from os import environ
from uuid import uuid4
import requests
from src.feed_api import get_feed
from src.item_api import delete_item, get_items
# /docs#/Onboarding/list_projects_hackathon_project_list_get

PROJECT_NAME = environ.get("PROJECT_NAME")
TOKEN = environ.get("ACCESS_TOKEN")
URL_ORIGIN = "https://app.productgenius.io"
USERNAME_EMAIL = environ.get("USERNAME_EMAIL")
PASSWORD = environ.get("PASSWORD")
USER = environ.get("USER")
PASS= environ.get("PASS")

def get_list_of_projects():

    URL = f"{URL_ORIGIN}/hackathon/project/list"
    response = requests.get(URL, 
        headers={
            "Content-Type": "application/json",
        },
        auth=(USER, PASS)
    )
    return response.json()

def get_project_by_name(project_name):

    URL = f"{URL_ORIGIN}/hackathon/project/{project_name}"

    response = requests.get(URL, 
                            headers={
                                "Authorization": "Bearer 7e9ada8e-bfae-4715-abc3-40dd02e37af1",
                                "Content-Type": "application/json",
                            }
    )
    return response.json()

# # res = get_list_of_projects()
# print(PROJECT_NAME)
# res = get_project_by_name(PROJECT_NAME)

# dummy_session_id = "c53521d3-e2ba-4814-8e46-7c167799a949"
# res = get_feed(dummy_session_id)

# data = []
import json
# # print(res)

# PROJECT_NAME = "dummy-name"
# page = 1
# while True:

#     res = get_items(PROJECT_NAME, page=page, page_size=100)
#     for item in res:
#         print(item["id"])
#         # data.append(item)
#         delete_item(PROJECT_NAME, item["id"])
#     page += 1

#     if len(res) < 100:
#         break

# print(json.dumps(data, indent=4))

def test_feed_from_ligeering_events():
    """This function is to get the capabilities of the feed api, latent events, search prompt"""

    PROJECT_NAME = "Bookly"
    # session_id = "c53521d3-e2ba-4814-8e46-7c167799a949"
    # session_id = "15013b18-d000-47a1-9572-528452219984"
    session_id = str(uuid4())


    res = get_feed(PROJECT_NAME, session_id, search_prompt="Adventure books")
    
    print(f"""Search query: Adventure books
    Number of cards that were outputed: {len(res['cards'])}
    Cards: {res['cards']}
    """)
    print("Number of cards that were outputed: ",len(res['cards']))
    # print(json.dumps(res, indent=4))

    dummy_events = [
        {
            "event": "feed linger metrics",
            "properties": {
                "organization_id": "Bookly",
                "visitor_id": "6ee0e958-adb0-49b4-8415-31556bef71e9",
                "session_id": "c53521d3-e2ba-4814-8e46-7c167799a949",
                "payload": {
                    "c3817d5a-397a-4832-9843-389b3be85d46": {
                        "enter_count": 1,
                        "id": res["cards"][1]["id"],
                        "time": 0.2,
                        "type": "product_detail_card"
                    }, 
                    "7a6890b2-2d80-4af6-9fc1-1ec9445be359": {
                        "enter_count": 1,
                        "id": res["cards"][2]["id"],
                        "time": 0.2,
                        "type": "product_detail_card"
                    } 
                }
            }
        }, 
    ]
    res = get_feed(PROJECT_NAME, session_id, events=dummy_events, page=2, search_prompt="Adventure books")
    print("Number of cards that were outputed when we pass events: ",len(res['cards']))
    print(json.dumps(res, indent=4))


test_feed_from_ligeering_events()