from os import environ
import requests
import json
from typing import List, Optional, TypedDict
from datetime import datetime

PROJECT_NAME = environ.get("PROJECT_NAME")
TOKEN = environ.get("ACCESS_TOKEN")
URL_ORIGIN = "https://app.productgenius.io"


class GeniusModelInstructionSubmission(TypedDict):
    promptlet: str

class GeniusModelInstruction(TypedDict):
    id: str
    created_at: str
    promptlet: str

class GeniusModel(TypedDict):
    id: str
    created_at: str
    instructions: List[GeniusModelInstruction]
    status: str
    accuracy: Optional[float]

# Instruction Management Functions

def list_instructions(project_name: str) -> List[GeniusModelInstruction]:
    """Retrieve a list of instructions for a specific hackathon project."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/instruction/list"
    response = requests.get(URL, 
                           headers={
                               "Authorization": f"Bearer {TOKEN}",
                               "Content-Type": "application/json",
                           })
    return response.json()

def get_instruction(project_name: str, promptlet_id: str) -> GeniusModelInstruction:
    """Retrieve a specific instruction for a hackathon project."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/instruction/{promptlet_id}"
    response = requests.get(URL, 
                           headers={
                               "Authorization": f"Bearer {TOKEN}",
                               "Content-Type": "application/json",
                           })
    return response.json()

def create_instructions(project_name: str, instructions: List[GeniusModelInstructionSubmission]) -> List[GeniusModelInstruction]:
    """Submit a list of instructions for a hackathon project."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/instruction/create"
    
    print(json.dumps(instructions, indent=4))
    response = requests.post(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            },
                            data=json.dumps(instructions))
    return response.json()

def update_instruction(project_name: str, promptlet_id: str, instruction: GeniusModelInstructionSubmission) -> GeniusModelInstruction:
    """Update an existing instruction for a hackathon project."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/instruction/{promptlet_id}/update"
    response = requests.put(URL, 
                           headers={
                               "Authorization": f"Bearer {TOKEN}",
                               "Content-Type": "application/json",
                           },
                           data=json.dumps(instruction))
    return response.json()

def delete_instruction(project_name: str, promptlet_id: str):
    """Delete a specific instruction for a hackathon project."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/instruction/{promptlet_id}/delete"
    response = requests.delete(URL, 
                              headers={
                                  "Authorization": f"Bearer {TOKEN}",
                                  "Content-Type": "application/json",
                              })
    return response.json()

# Model Management Functions

def list_models(project_name: str) -> List[GeniusModel]:
    """Retrieve a list of models for a specific hackathon project."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/list"
    response = requests.get(URL, 
                           headers={
                               "Authorization": f"Bearer {TOKEN}",
                               "Content-Type": "application/json",
                           })
    return response.json()

def get_model(project_name: str, model_id: str) -> GeniusModel:
    """Retrieve a specific model for a hackathon project."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/{model_id}"
    response = requests.get(URL, 
                           headers={
                               "Authorization": f"Bearer {TOKEN}",
                               "Content-Type": "application/json",
                           })
    return response.json()

def create_model(project_name: str):
    """Create a new model for a hackathon project. This will trigger a new model build."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/create"
    response = requests.post(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            })
    return response.json()

def promote_model(project_name: str, model_id: str) -> bool:
    """Promote a model for a hackathon project. Resulting feeds will source recommendations from this model."""
    URL = f"{URL_ORIGIN}/hackathon/{project_name}/model/{model_id}/promote"
    response = requests.post(URL, 
                            headers={
                                "Authorization": f"Bearer {TOKEN}",
                                "Content-Type": "application/json",
                            })
    return response.json()
