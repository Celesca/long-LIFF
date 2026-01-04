import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

class LLMService:
    @staticmethod
    def generate_trip(user_preferences: dict, liked_places: list):
        prompt = f"""
        Act as a travel guide for Thailand. 
        User Preferences: {user_preferences}
        Available Liked Places: {liked_places}
        
        Select the best places from the "Available Liked Places" list to create a route/itinerary based on the preferences.
        You can also reorder them logically for travel.
        Limit the number of places based on duration (e.g. 1 day = ~3 places, 2 days = ~6 places).
        
        Return strictly JSON format with the following structure:
        {{
            "trip_name": "Trip Name",
            "description": "Short trip overview",
            "selected_place_ids": ["id_of_place_1", "id_of_place_2", ...]
        }}
        """
        
        headers = {'Content-Type': 'application/json'}
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        try:
            response = requests.post(API_URL, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            # Extract text from response
            text_content = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            
            # Clean generic markdown if present
            text_content = text_content.replace('```json', '').replace('```', '')
            
            return json.loads(text_content)
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return {"error": "Failed to generate trip"}
