from os import environ
import requests
from src.feed_api import get_feed
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

dummy_session_id = "c53521d3-e2ba-4814-8e46-7c167799a949"
res = get_feed(dummy_session_id)

print(res)


