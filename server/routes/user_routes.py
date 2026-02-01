from fastapi import APIRouter, HTTPException, Body
from models.user_place import User, UserPreferences
from services.db_service import get_database
from typing import Optional
from datetime import datetime

router = APIRouter()

@router.post("/user", response_model=User)
async def create_or_update_user(user_data: dict = Body(...)):
    db = get_database()
    users_collection = db["users"]
    
    # Check if user exists
    liff_id = user_data.get("liff_user_id")
    if not liff_id:
        raise HTTPException(status_code=400, detail="liff_user_id is required")

    existing_user = await users_collection.find_one({"liff_user_id": liff_id})
    
    if existing_user:
        # Update fields
        update_data = {k: v for k, v in user_data.items() if k != "liff_user_id"}
        if "preferences" in update_data:
            # Should validate preferences structure
            pass
            
        await users_collection.update_one(
            {"liff_user_id": liff_id},
            {"$set": update_data}
        )
        existing_user.update(update_data)
        return existing_user
    else:
        # Create new
        new_user = User(**user_data)
        await users_collection.insert_one(new_user.model_dump(by_alias=True, exclude=["id"]))
        return new_user

@router.get("/user/{liff_id}", response_model=User)
async def get_user(liff_id: str):
    db = get_database()
    user = await db["users"].find_one({"liff_user_id": liff_id})
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")
