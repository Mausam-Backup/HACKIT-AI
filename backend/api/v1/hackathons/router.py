import json
import os
import logging
from fastapi import APIRouter

from utils.get_env import get_app_data_directory_env

API_V1_HACKATHONS_ROUTER = APIRouter(prefix="/hackathons", tags=["Hackathons"])

@API_V1_HACKATHONS_ROUTER.get("")
async def get_hackathons():
    app_data_dir = get_app_data_directory_env()
    file_path = os.path.join(app_data_dir, "all_hackathons.json")
    
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                cached_hackathons = json.load(f)
            return {
                "hackathons": cached_hackathons,
                "count": len(cached_hackathons)
            }
        except Exception as e:
            logging.error(f"Failed to load cached hackathons: {e}")
            return {"hackathons": [], "count": 0}
            
    return {"hackathons": [], "count": 0}
