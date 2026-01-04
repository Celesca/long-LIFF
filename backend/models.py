from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    """User model - stores LINE user information"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    line_user_id = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=True)
    picture_url = Column(String(500), nullable=True)
    total_coins = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    swipes = relationship("Swipe", back_populates="user")
    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    journeys = relationship("Journey", back_populates="user")
    redeemed_rewards = relationship("RedeemedReward", back_populates="user")


class Place(Base):
    """Place model - stores travel destinations"""
    __tablename__ = "places"
    
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(50), unique=True, index=True)  # Original ID from frontend data
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    country = Column(String(100), default="Thailand")
    city = Column(String(100), nullable=False)  # Bangkok, Chiang Mai, etc.
    rating = Column(Float, nullable=True)
    distance = Column(String(50), nullable=True)
    tags = Column(JSON, default=list)  # Store tags as JSON array
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    swipes = relationship("Swipe", back_populates="place")


class Swipe(Base):
    """Swipe model - stores user swipe actions (like/dislike)"""
    __tablename__ = "swipes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    direction = Column(String(10), nullable=False)  # 'left' (dislike) or 'right' (like)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="swipes")
    place = relationship("Place", back_populates="swipes")


class UserPreference(Base):
    """User preferences for filtering places"""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    selected_cities = Column(JSON, default=list)  # List of cities: ["Bangkok", "Chiang Mai"]
    travel_personality = Column(String(50), nullable=True)  # introvert, extrovert, adventure
    preferred_tags = Column(JSON, default=list)  # Preferred tags
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="preferences")


class Journey(Base):
    """Journey model - stores user travel journeys"""
    __tablename__ = "journeys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    personality = Column(String(50), nullable=True)
    duration = Column(String(50), nullable=True)
    place_ids = Column(JSON, default=list)  # List of place IDs in the journey
    visited_place_ids = Column(JSON, default=list)  # List of visited place IDs
    total_coins_earned = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="journeys")
    photos = relationship("JourneyPhoto", back_populates="journey")


class JourneyPhoto(Base):
    """Photos uploaded during a journey"""
    __tablename__ = "journey_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    journey_id = Column(Integer, ForeignKey("journeys.id"), nullable=False)
    place_id = Column(Integer, nullable=False)
    photo_url = Column(String(500), nullable=False)  # Base64 or URL
    coins_earned = Column(Integer, default=10)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    journey = relationship("Journey", back_populates="photos")


class Reward(Base):
    """Available rewards that users can redeem"""
    __tablename__ = "rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    coin_cost = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)  # discount, experience, food, souvenir
    discount_code = Column(String(50), nullable=True)
    valid_until = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    original_price = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    redeemed = relationship("RedeemedReward", back_populates="reward")


class RedeemedReward(Base):
    """Track redeemed rewards by users"""
    __tablename__ = "redeemed_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id"), nullable=False)
    redeemed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="redeemed_rewards")
    reward = relationship("Reward", back_populates="redeemed")
