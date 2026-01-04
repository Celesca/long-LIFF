from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserPreferences(BaseModel):
    personality: Optional[str] = None
    trip_duration: Optional[str] = None
    location_filter: Optional[str] = None # e.g., "Bangkok", "Chiang Mai", "All"

class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    liff_user_id: str = Field(..., description="Line User ID")
    display_name: str
    picture_url: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    liked_places: List[str] = [] # List of Place IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Place(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    description: str
    image_url: str
    province: str
    category: str # e.g. "Nature", "Culture", "City"
    location: Optional[dict] = None # {lat: ..., lng: ...}
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
