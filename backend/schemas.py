from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ User Schemas ============

class UserCreate(BaseModel):
    line_user_id: str
    display_name: Optional[str] = None
    picture_url: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    line_user_id: str
    display_name: Optional[str]
    picture_url: Optional[str]
    total_coins: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    picture_url: Optional[str] = None


# ============ Place Schemas ============

class PlaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    image_url: Optional[str] = None
    country: str = "Thailand"
    city: str
    rating: Optional[float] = None
    distance: Optional[str] = None
    tags: List[str] = []


class PlaceCreate(PlaceBase):
    external_id: str


class PlaceResponse(PlaceBase):
    id: int
    external_id: str
    is_active: bool
    
    class Config:
        from_attributes = True


class PlaceListResponse(BaseModel):
    places: List[PlaceResponse]
    total: int
    page: int
    per_page: int


# ============ Swipe Schemas ============

class SwipeCreate(BaseModel):
    place_id: int
    direction: str  # 'left' or 'right'


class SwipeResponse(BaseModel):
    id: int
    user_id: int
    place_id: int
    direction: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class LikedPlacesResponse(BaseModel):
    places: List[PlaceResponse]
    total: int


# ============ Preference Schemas ============

class PreferenceCreate(BaseModel):
    selected_cities: List[str] = []  # e.g., ["Bangkok", "Chiang Mai"]
    travel_personality: Optional[str] = None
    preferred_tags: List[str] = []


class PreferenceResponse(BaseModel):
    id: int
    user_id: int
    selected_cities: List[str]
    travel_personality: Optional[str]
    preferred_tags: List[str]
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============ Journey Schemas ============

class JourneyCreate(BaseModel):
    personality: str
    duration: str
    place_ids: List[int]


class JourneyResponse(BaseModel):
    id: int
    user_id: int
    personality: Optional[str]
    duration: Optional[str]
    place_ids: List[int]
    visited_place_ids: List[int]
    total_coins_earned: int
    is_completed: bool
    started_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class MarkVisitedRequest(BaseModel):
    place_id: int
    photos: List[str] = []  # Base64 encoded photos


class MarkVisitedResponse(BaseModel):
    success: bool
    coins_earned: int
    total_coins: int
    journey_completed: bool


# ============ Reward Schemas ============

class RewardResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    coin_cost: int
    category: str
    discount_code: Optional[str]
    valid_until: Optional[str]
    location: Optional[str]
    original_price: Optional[str]
    
    class Config:
        from_attributes = True


class RedeemRewardRequest(BaseModel):
    reward_id: int


class RedeemRewardResponse(BaseModel):
    success: bool
    message: str
    discount_code: Optional[str]
    remaining_coins: int


# ============ City Schemas ============

class CityResponse(BaseModel):
    name: str
    place_count: int


class AvailableCitiesResponse(BaseModel):
    cities: List[CityResponse]


# ============ Stats Schemas ============

class UserStatsResponse(BaseModel):
    total_swipes: int
    liked_places: int
    disliked_places: int
    total_coins: int
    journeys_completed: int
    photos_uploaded: int
