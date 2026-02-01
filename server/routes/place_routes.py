from fastapi import APIRouter, Query
from models.user_place import Place
from services.db_service import get_database
from typing import List, Optional

router = APIRouter()

@router.get("/places", response_model=List[Place])
async def get_places(
    province: Optional[str] = None, 
    category: Optional[str] = None,
    limit: int = 20
):
    db = get_database()
    places_collection = db["places"]
    
    query = {}
    if province and province != "All":
        query["province"] = province
    if category:
        query["category"] = category
        
    cursor = places_collection.find(query).limit(limit)
    places = await cursor.to_list(length=limit)
    return places

@router.post("/places/seed")
async def seed_places():
    db = get_database()
    places_collection = db["places"]
    
    # Simple check if empty
    if await places_collection.count_documents({}) > 0:
        return {"message": "Database already has places"}

    # Mock data from frontend
    mock_places = [
        {
          "name": "Wat Phra That Doi Suthep",
          "description": "Sacred temple with golden pagoda overlooking Chiang Mai city.",
          "image_url": "https://images.unsplash.com/photo-1599525409139-38e2133cecfc",
          "province": "Chiang Mai",
          "category": "Culture",
          "lat": 18.80498, 
          "long": 98.92157
        },
        {
          "name": "Grand Palace",
          "description": "The spectacular official residence of the Kings of Siam.",
          "image_url": "https://images.unsplash.com/photo-1582457801648-2615dcae984d",
          "province": "Bangkok",
          "category": "Culture",
          "lat": 13.7500, 
          "long": 100.4913
        },
        {
          "name": "Railay Beach",
          "description": "Stunning limestone cliffs and clear emerald water.",
          "image_url": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
          "province": "Krabi",
          "category": "Nature",
          "lat": 8.0109, 
          "long": 98.8340
        },
        {
          "name": "Doi Inthanon",
          "description": "The highest mountain in Thailand, part of the Himalayan range.",
          "image_url": "https://images.unsplash.com/photo-1504214208698-ea1916a2195a",
          "province": "Chiang Mai",
          "category": "Nature",
          "lat": 18.5884, 
          "long": 98.4862
        },
        {
          "name": "Khao San Road",
          "description": "Famous backpacker street with vibrant nightlife and street food.",
          "image_url": "https://images.unsplash.com/photo-1596701833633-ab932c021c5f",
          "province": "Bangkok",
          "category": "City",
          "lat": 13.7588, 
          "long": 100.4972
        }
    ]
    
    await places_collection.insert_many(mock_places)
    return {"message": f"Seeded {len(mock_places)} places"}
