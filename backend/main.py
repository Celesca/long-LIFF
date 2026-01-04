from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import engine, get_db, Base
from models import User, Place, Swipe, UserPreference, Journey, JourneyPhoto, Reward, RedeemedReward
from schemas import (
    UserCreate, UserResponse, UserUpdate,
    PlaceResponse, PlaceListResponse,
    SwipeCreate, SwipeResponse, LikedPlacesResponse,
    PreferenceCreate, PreferenceResponse,
    JourneyCreate, JourneyResponse, MarkVisitedRequest, MarkVisitedResponse,
    RewardResponse, RedeemRewardRequest, RedeemRewardResponse,
    AvailableCitiesResponse, CityResponse,
    UserStatsResponse
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LONG Travel API",
    description="Backend API for the LONG Tinder-style travel app",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ User Endpoints ============

@app.post("/api/users", response_model=UserResponse)
def create_or_get_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user or return existing user by LINE user ID"""
    db_user = db.query(User).filter(User.line_user_id == user.line_user_id).first()
    
    if db_user:
        # Update user info if provided
        if user.display_name:
            db_user.display_name = user.display_name
        if user.picture_url:
            db_user.picture_url = user.picture_url
        db_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_user)
        return db_user
    
    # Create new user
    db_user = User(
        line_user_id=user.line_user_id,
        display_name=user.display_name,
        picture_url=user.picture_url,
        total_coins=0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/api/users/{line_user_id}", response_model=UserResponse)
def get_user(line_user_id: str, db: Session = Depends(get_db)):
    """Get user by LINE user ID"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.get("/api/users/{line_user_id}/stats", response_model=UserStatsResponse)
def get_user_stats(line_user_id: str, db: Session = Depends(get_db)):
    """Get user statistics"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total_swipes = db.query(Swipe).filter(Swipe.user_id == db_user.id).count()
    liked_places = db.query(Swipe).filter(
        Swipe.user_id == db_user.id,
        Swipe.direction == "right"
    ).count()
    disliked_places = db.query(Swipe).filter(
        Swipe.user_id == db_user.id,
        Swipe.direction == "left"
    ).count()
    journeys_completed = db.query(Journey).filter(
        Journey.user_id == db_user.id,
        Journey.is_completed == True
    ).count()
    photos_uploaded = db.query(JourneyPhoto).join(Journey).filter(
        Journey.user_id == db_user.id
    ).count()
    
    return UserStatsResponse(
        total_swipes=total_swipes,
        liked_places=liked_places,
        disliked_places=disliked_places,
        total_coins=db_user.total_coins,
        journeys_completed=journeys_completed,
        photos_uploaded=photos_uploaded
    )


# ============ Place Endpoints ============

@app.get("/api/places", response_model=PlaceListResponse)
def get_places(
    db: Session = Depends(get_db),
    city: Optional[str] = Query(None, description="Filter by city"),
    cities: Optional[str] = Query(None, description="Comma-separated list of cities"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """Get all places with optional filtering"""
    query = db.query(Place).filter(Place.is_active == True)
    
    # Filter by single city
    if city:
        query = query.filter(Place.city == city)
    
    # Filter by multiple cities
    if cities:
        city_list = [c.strip() for c in cities.split(",")]
        query = query.filter(Place.city.in_(city_list))
    
    # Filter by tag (check if tag is in JSON array)
    if tag:
        query = query.filter(Place.tags.contains([tag]))
    
    total = query.count()
    places = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return PlaceListResponse(
        places=[PlaceResponse.model_validate(p) for p in places],
        total=total,
        page=page,
        per_page=per_page
    )


@app.get("/api/places/{place_id}", response_model=PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    """Get a specific place by ID"""
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@app.get("/api/cities", response_model=AvailableCitiesResponse)
def get_available_cities(db: Session = Depends(get_db)):
    """Get all available cities with place counts"""
    from sqlalchemy import func
    
    results = db.query(
        Place.city,
        func.count(Place.id).label("count")
    ).filter(Place.is_active == True).group_by(Place.city).all()
    
    cities = [CityResponse(name=r[0], place_count=r[1]) for r in results]
    return AvailableCitiesResponse(cities=cities)


# ============ Swipe Endpoints ============

@app.get("/api/users/{line_user_id}/tinder-places", response_model=PlaceListResponse)
def get_tinder_places(
    line_user_id: str,
    db: Session = Depends(get_db),
    cities: Optional[str] = Query(None, description="Comma-separated list of cities")
):
    """Get places for Tinder swiping (excluding already swiped places)"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get IDs of places already swiped by this user
    swiped_place_ids = db.query(Swipe.place_id).filter(Swipe.user_id == db_user.id).subquery()
    
    # Build query for unswiped places
    query = db.query(Place).filter(
        Place.is_active == True,
        ~Place.id.in_(swiped_place_ids)
    )
    
    # Apply city filter
    if cities:
        city_list = [c.strip() for c in cities.split(",")]
        query = query.filter(Place.city.in_(city_list))
    else:
        # Check user preferences
        pref = db.query(UserPreference).filter(UserPreference.user_id == db_user.id).first()
        if pref and pref.selected_cities:
            query = query.filter(Place.city.in_(pref.selected_cities))
    
    places = query.all()
    
    return PlaceListResponse(
        places=[PlaceResponse.model_validate(p) for p in places],
        total=len(places),
        page=1,
        per_page=len(places)
    )


@app.post("/api/users/{line_user_id}/swipes", response_model=SwipeResponse)
def create_swipe(line_user_id: str, swipe: SwipeCreate, db: Session = Depends(get_db)):
    """Record a swipe action"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if place exists
    place = db.query(Place).filter(Place.id == swipe.place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    
    # Check if already swiped
    existing = db.query(Swipe).filter(
        Swipe.user_id == db_user.id,
        Swipe.place_id == swipe.place_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already swiped on this place")
    
    # Create swipe
    db_swipe = Swipe(
        user_id=db_user.id,
        place_id=swipe.place_id,
        direction=swipe.direction
    )
    db.add(db_swipe)
    db.commit()
    db.refresh(db_swipe)
    
    return db_swipe


@app.get("/api/users/{line_user_id}/liked-places", response_model=LikedPlacesResponse)
def get_liked_places(line_user_id: str, db: Session = Depends(get_db)):
    """Get all places liked by user"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    liked_swipes = db.query(Swipe).filter(
        Swipe.user_id == db_user.id,
        Swipe.direction == "right"
    ).all()
    
    place_ids = [s.place_id for s in liked_swipes]
    places = db.query(Place).filter(Place.id.in_(place_ids)).all()
    
    return LikedPlacesResponse(
        places=[PlaceResponse.model_validate(p) for p in places],
        total=len(places)
    )


@app.delete("/api/users/{line_user_id}/liked-places/{place_id}")
def remove_liked_place(line_user_id: str, place_id: int, db: Session = Depends(get_db)):
    """Remove a place from liked places"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    swipe = db.query(Swipe).filter(
        Swipe.user_id == db_user.id,
        Swipe.place_id == place_id,
        Swipe.direction == "right"
    ).first()
    
    if not swipe:
        raise HTTPException(status_code=404, detail="Liked place not found")
    
    db.delete(swipe)
    db.commit()
    
    return {"success": True, "message": "Place removed from liked places"}


@app.delete("/api/users/{line_user_id}/liked-places")
def clear_liked_places(line_user_id: str, db: Session = Depends(get_db)):
    """Clear all liked places for a user"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.query(Swipe).filter(
        Swipe.user_id == db_user.id,
        Swipe.direction == "right"
    ).delete()
    db.commit()
    
    return {"success": True, "message": "All liked places cleared"}


# ============ Preference Endpoints ============

@app.get("/api/users/{line_user_id}/preferences", response_model=PreferenceResponse)
def get_preferences(line_user_id: str, db: Session = Depends(get_db)):
    """Get user preferences"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    pref = db.query(UserPreference).filter(UserPreference.user_id == db_user.id).first()
    if not pref:
        # Return default preferences
        pref = UserPreference(
            user_id=db_user.id,
            selected_cities=[],
            travel_personality=None,
            preferred_tags=[]
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    
    return pref


@app.put("/api/users/{line_user_id}/preferences", response_model=PreferenceResponse)
def update_preferences(line_user_id: str, preferences: PreferenceCreate, db: Session = Depends(get_db)):
    """Update user preferences"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    pref = db.query(UserPreference).filter(UserPreference.user_id == db_user.id).first()
    
    if pref:
        pref.selected_cities = preferences.selected_cities
        pref.travel_personality = preferences.travel_personality
        pref.preferred_tags = preferences.preferred_tags
        pref.updated_at = datetime.utcnow()
    else:
        pref = UserPreference(
            user_id=db_user.id,
            selected_cities=preferences.selected_cities,
            travel_personality=preferences.travel_personality,
            preferred_tags=preferences.preferred_tags
        )
        db.add(pref)
    
    db.commit()
    db.refresh(pref)
    return pref


# ============ Journey Endpoints ============

@app.post("/api/users/{line_user_id}/journeys", response_model=JourneyResponse)
def create_journey(line_user_id: str, journey: JourneyCreate, db: Session = Depends(get_db)):
    """Create a new journey"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_journey = Journey(
        user_id=db_user.id,
        personality=journey.personality,
        duration=journey.duration,
        place_ids=journey.place_ids,
        visited_place_ids=[],
        total_coins_earned=0,
        is_completed=False
    )
    db.add(db_journey)
    db.commit()
    db.refresh(db_journey)
    
    return db_journey


@app.get("/api/users/{line_user_id}/journeys/current", response_model=JourneyResponse)
def get_current_journey(line_user_id: str, db: Session = Depends(get_db)):
    """Get the current (most recent uncompleted) journey"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    journey = db.query(Journey).filter(
        Journey.user_id == db_user.id,
        Journey.is_completed == False
    ).order_by(Journey.started_at.desc()).first()
    
    if not journey:
        raise HTTPException(status_code=404, detail="No active journey found")
    
    return journey


@app.post("/api/users/{line_user_id}/journeys/{journey_id}/visit", response_model=MarkVisitedResponse)
def mark_place_visited(
    line_user_id: str,
    journey_id: int,
    request: MarkVisitedRequest,
    db: Session = Depends(get_db)
):
    """Mark a place as visited and optionally upload photos"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    journey = db.query(Journey).filter(
        Journey.id == journey_id,
        Journey.user_id == db_user.id
    ).first()
    
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    
    if request.place_id not in journey.place_ids:
        raise HTTPException(status_code=400, detail="Place not in journey")
    
    if request.place_id in journey.visited_place_ids:
        raise HTTPException(status_code=400, detail="Place already visited")
    
    # Calculate coins earned
    coins_earned = 0
    PHOTO_COIN_VALUE = 10
    COMPLETION_BONUS = 100
    
    if request.photos:
        coins_earned = len(request.photos) * PHOTO_COIN_VALUE
        
        # Save photos
        for photo in request.photos:
            db_photo = JourneyPhoto(
                journey_id=journey.id,
                place_id=request.place_id,
                photo_url=photo,
                coins_earned=PHOTO_COIN_VALUE
            )
            db.add(db_photo)
    
    # Update visited places
    visited = list(journey.visited_place_ids)
    visited.append(request.place_id)
    journey.visited_place_ids = visited
    journey.total_coins_earned += coins_earned
    
    # Check if journey completed
    journey_completed = False
    if set(journey.visited_place_ids) >= set(journey.place_ids):
        journey.is_completed = True
        journey.completed_at = datetime.utcnow()
        coins_earned += COMPLETION_BONUS
        journey.total_coins_earned += COMPLETION_BONUS
        journey_completed = True
    
    # Update user coins
    db_user.total_coins += coins_earned
    
    db.commit()
    
    return MarkVisitedResponse(
        success=True,
        coins_earned=coins_earned,
        total_coins=db_user.total_coins,
        journey_completed=journey_completed
    )


# ============ Reward Endpoints ============

@app.get("/api/rewards", response_model=List[RewardResponse])
def get_rewards(db: Session = Depends(get_db)):
    """Get all available rewards"""
    rewards = db.query(Reward).filter(Reward.is_active == True).all()
    return rewards


@app.post("/api/users/{line_user_id}/rewards/redeem", response_model=RedeemRewardResponse)
def redeem_reward(line_user_id: str, request: RedeemRewardRequest, db: Session = Depends(get_db)):
    """Redeem a reward"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reward = db.query(Reward).filter(Reward.id == request.reward_id, Reward.is_active == True).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if db_user.total_coins < reward.coin_cost:
        raise HTTPException(status_code=400, detail="Insufficient coins")
    
    # Deduct coins
    db_user.total_coins -= reward.coin_cost
    
    # Record redemption
    redemption = RedeemedReward(
        user_id=db_user.id,
        reward_id=reward.id
    )
    db.add(redemption)
    db.commit()
    
    return RedeemRewardResponse(
        success=True,
        message=f"Successfully redeemed: {reward.name}",
        discount_code=reward.discount_code,
        remaining_coins=db_user.total_coins
    )


@app.get("/api/users/{line_user_id}/rewards/redeemed", response_model=List[RewardResponse])
def get_redeemed_rewards(line_user_id: str, db: Session = Depends(get_db)):
    """Get user's redeemed rewards"""
    db_user = db.query(User).filter(User.line_user_id == line_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    redemptions = db.query(RedeemedReward).filter(RedeemedReward.user_id == db_user.id).all()
    reward_ids = [r.reward_id for r in redemptions]
    rewards = db.query(Reward).filter(Reward.id.in_(reward_ids)).all()
    
    return rewards


# ============ Health Check ============

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
