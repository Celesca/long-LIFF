from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None

    async def connect_to_database(self):
        try:
            self.client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
            print("Connected to MongoDB")
        except Exception as e:
            print(f"Could not connect to MongoDB: {e}")
            raise e

    async def close_database_connection(self):
        if self.client:
            self.client.close()
            print("MongoDB connection closed")

db = Database()

def get_database():
    return db.client.get_database()
