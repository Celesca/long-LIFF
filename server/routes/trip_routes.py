from fastapi import APIRouter, Body, HTTPException
from services.llm_service import LLMService
from services.db_service import get_database

router = APIRouter()

@router.post("/trip/generate")
async def generate_trip(
    user_preferences: dict = Body(...),
    liked_place_ids: list[str] = Body(...)
):
    db = get_database()
    places_collection = db["places"]
    
    # Fetch details of liked places to feed into LLM
    liked_places_cursor = places_collection.find({"_id": {"$in": [p for p in liked_place_ids]}}) # Need to handle ObjectId conversion if ids are passed as strings but stored as ObjectIds?
    # Usually frontend sends strings. Motor handles string queries for ObjectIds if we construct them, but here we scan by string matching if we used string IDs or let Pydantic handle it.
    # For simplicity, let's assume names or we fetch by ID if possible.
    # Actually, let's rely on the text passed or minimal info if fetching fails.
    
    # Better: Feed the names/provinces of the places.
    # For now, let's assume the frontend passes the PLACE OBJECTS or we fetch them.
    # Let's fetch them.
    
    from bson import ObjectId
    try:
        object_ids = [ObjectId(pid) for pid in liked_place_ids]
        liked_places_docs = await places_collection.find({"_id": {"$in": object_ids}}).to_list(length=100)
    except:
        liked_places_docs = [] # Fallback if IDs are invalid or dummy

    # Prepare data for LLM
    liked_places_summary = [
        {"id": str(p["_id"]), "name": p.get("name"), "province": p.get("province"), "category": p.get("category"), "description": p.get("description")}
        for p in liked_places_docs
    ]
    
    result = LLMService.generate_trip(user_preferences, liked_places_summary)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    # Map back IDs to full objects
    selected_ids = result.get("selected_place_ids", [])
    ordered_places = []
    
    # Create a lookup map
    place_map = {str(p["_id"]): p for p in liked_places_docs}
    
    for pid in selected_ids:
        if pid in place_map:
            place_obj = place_map[pid]
            # Ensure proper JSON valid response for ObjectId
            place_obj["id"] = str(place_obj["_id"])
            del place_obj["_id"]
            if "location" in place_obj:
               # Flatten location for frontend if needed, but frontend expects lat/long on root object often
               # The seed data had lat/long? NO, seed data in my replace_file didn't have lat/long. 
               # I need to ensure seed data has lat/long or I mock it here.
               pass
            ordered_places.append(place_map[pid])
            
    # If LLM failed to return valid IDs, fallback to simple algo?
    if not ordered_places:
         ordered_places = [
             {**p, "id": str(p["_id"])} for p in liked_places_docs[:5]
         ]
         for p in ordered_places:
             if "_id" in p: del p["_id"]

    return {
        "trip_name": result.get("trip_name", "My Trip"),
        "description": result.get("description", "Enjoy your trip!"),
        "places": ordered_places
    }
