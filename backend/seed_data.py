"""
Seed script to populate the database with initial travel places and rewards.
Run this after starting the backend to populate the database.
"""
from database import SessionLocal, engine, Base
from models import Place, Reward

# Create tables
Base.metadata.create_all(bind=engine)


def seed_places():
    """Seed travel places from frontend data"""
    db = SessionLocal()
    
    # Check if places already exist
    existing = db.query(Place).count()
    if existing > 0:
        print(f"Database already has {existing} places. Skipping seed.")
        db.close()
        return
    
    # Chiang Mai places (from frontend travelPlaces.ts)
    chiang_mai_places = [
        {
            "external_id": "1",
            "name": "Wat Umong",
            "latitude": 18.783636,
            "longitude": 98.953588,
            "image_url": "https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg",
            "description": "It is a peaceful place for meditation and spiritual practice. Visitors can walk through the tunnels, take photos, and pay respect to the Buddha images enshrined within. The temple grounds are shaded by large trees, and during the rainy season, the old walls are beautifully covered with green moss, adding to the serene and lively atmosphere.",
            "city": "Chiang Mai",
            "rating": 4.6,
            "distance": "~3.2km",
            "tags": ["Culture", "Green", "PM2.5 free"]
        },
        {
            "external_id": "2",
            "name": "Ang Kaew",
            "latitude": 18.8020,
            "longitude": 98.9446,
            "image_url": "https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg",
            "description": "This small reservoir features pleasant walking and jogging trails, along with benches and open grassy lawns ideal for relaxing or picnicking",
            "city": "Chiang Mai",
            "rating": 4.7,
            "distance": "~3.4km",
            "tags": ["Green", "PM2.5 free"]
        },
        {
            "external_id": "3",
            "name": "Chiang Mai PAO Park",
            "latitude": 18.7979,
            "longitude": 98.9876,
            "image_url": "https://media.nationthailand.com/uploads/images/contents/w1024/2024/11/NwBTfIZjeNeA3Ec98Sz2.webp?x-image-process=style/lg-webp",
            "description": "It is the new public park of Chiang Mai Province that has quickly become popular as a beautiful place for relaxation and exercise. The park features a shady and natural atmosphere, along with stunning mountain views",
            "city": "Chiang Mai",
            "rating": 4.7,
            "distance": "~6.3km",
            "tags": ["Green", "PM2.5 free"]
        },
        {
            "external_id": "4",
            "name": "Mae Kha Canal",
            "latitude": 18.7881,
            "longitude": 98.9936,
            "image_url": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/0e/cd/b2/caption.jpg?w=900&h=500&s=1",
            "description": "Mae Kha Canal is an ancient canal that holds significant historical importance and plays a vital role in the way of life of Chiang Mai city. Originally, it served as both the outer moat of the city and a drainage system",
            "city": "Chiang Mai",
            "rating": 4.2,
            "distance": "~5.8km",
            "tags": ["Culture", "Green"]
        },
        {
            "external_id": "5",
            "name": "Ginger Farm",
            "latitude": 18.6672,
            "longitude": 98.9645,
            "image_url": "https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg",
            "description": "A full-service organic farm located in Chiang Mai Province offering a variety of activities for children and families, such as vegetable planting, egg collecting, rice planting, harvesting, threshing, cooking, making traditional Thai desserts, clay molding, and kids yoga",
            "city": "Chiang Mai",
            "rating": 4.5,
            "distance": "~13.5km",
            "tags": ["Green", "Culture", "PM2.5 free"]
        },
        {
            "external_id": "6",
            "name": "Hor Kham Luang",
            "latitude": 18.752879,
            "longitude": 98.922341,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg",
            "description": "An elegant Lanna-style architecture, the building is a two-story half-wood, half-brick structure painted in reddish-brown. It stands proudly on a hill, covering an area of approximately 3,000 square meters amidst more than 470 rai of land at the Chiang Mai Royal Agricultural Research Center",
            "city": "Chiang Mai",
            "rating": 4.7,
            "distance": "~10.7km",
            "tags": ["Culture", "Green", "PM2.5 free"]
        },
        {
            "external_id": "7",
            "name": "One Nimman",
            "latitude": 18.80015771106662,
            "longitude": 98.96756289999999,
            "image_url": "https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg",
            "description": "Discover One Nimman Select—a vibrant treasure trove of Thai designer pieces, local crafts, and unique Chiang Mai souvenirs, all handpicked for quality and charm, right in the heart of Nimman.",
            "city": "Chiang Mai",
            "rating": 4.5,
            "distance": "~750m",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "8",
            "name": "Think Park",
            "latitude": 18.80140939691727,
            "longitude": 98.96754306673772,
            "image_url": "https://changpuakmagazine.com/images/article/182925ArticleThumpnai_September2018-07-07_resize.jpg",
            "description": "Think Park is Chiang Mai's first art-inspired open-air shopping hub, where trendy cafés, unique local boutiques, and a vibrant night market come together to offer handmade crafts, stylish fashion, and live music in a creative, youthful atmosphere.",
            "city": "Chiang Mai",
            "rating": 4.3,
            "distance": "~1km",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "10",
            "name": "สุกี้ช้างเผือก",
            "latitude": 18.79580688165689,
            "longitude": 98.9853312120712,
            "image_url": "https://d13q9rhbndrrl0.cloudfront.net/posts/none/2021/8/1640512803955-655157687290318600.jpeg",
            "description": "ร้านสุกี้ช้างเผือกสาขาตลาดโต้รุ่งเป็นหนึ่งในร้านสตรีทฟู้ดเจ้าดังที่อยู่คู่ขวัญชาวเชียงใหม่มานาน ความพิเศษของสุกี้ร้านนี้คือ สุกี้แห้งที่หอมกลิ่นกระทะ รวมถึงปริมาณเครื่องที่ให้มาแบบจัดเต็มในราคาที่จับต้องได้",
            "city": "Chiang Mai",
            "rating": 4.5,
            "distance": "~2.2km",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "11",
            "name": "Khao-Sō-i ข้าวโซอิ",
            "latitude": 18.80914056385872,
            "longitude": 99.00475884526325,
            "image_url": "https://media.readthecloud.co/wp-content/uploads/2021/11/29140911/khao-so-i-31-750x500.jpg",
            "description": "ร้าน Khao-Sō-i ข้าวโซอิ แม้จะพึ่งตั้งได้ไม่นานแต่ด้วยความร่อยหนึบนุ่มของเส้นข้าวซอยสดที่โชว์กระบวนวิธีการทำให้ดูต่อหน้า น้ำซุปเข้มข้นตามต้นตำรับ",
            "city": "Chiang Mai",
            "rating": 4.8,
            "distance": "~6.8km",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "12",
            "name": "Mae Sai Khao Soi Restaurant",
            "latitude": 18.7997,
            "longitude": 98.9751,
            "image_url": "https://www.mytravelbuzzg.com/wp-content/uploads/Khao-Soi-Mae-Sai-Restaurant-e1693473350860.jpg",
            "description": "The highlight is the rich, aromatic Khao Soi curry soup, well-rounded flavor, not too oily, and the noodles are just the right amount of soft.",
            "city": "Chiang Mai",
            "rating": 4.5,
            "distance": "~500m",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "13",
            "name": "Chang Kei Hong Kong-style breakfast",
            "latitude": 18.7903,
            "longitude": 98.9785,
            "image_url": "https://images.chiangmaicitylife.com/clg/wp-content/uploads/2018/09/BF-1.jpg?auto=format&crop=entropy&fit=crop&fm=jpg&h=597&q=45&w=1140&s=2adf2b2176387a5634a858503e82b6be",
            "description": "Historic walled city with ancient temples and culture",
            "city": "Chiang Mai",
            "rating": 4.8,
            "distance": "~2km",
            "tags": ["Street", "Culture"]
        }
    ]
    
    # Bangkok places (new additions)
    bangkok_places = [
        {
            "external_id": "bkk_1",
            "name": "Wat Arun",
            "latitude": 13.7437,
            "longitude": 100.4888,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wat_Arun_at_Sunrise.jpg/1200px-Wat_Arun_at_Sunrise.jpg",
            "description": "Wat Arun Ratchawararam, locally known as Wat Chaeng, is a Buddhist temple in Bangkok Yai district of Bangkok, Thailand, on the Thonburi west bank of the Chao Phraya River.",
            "city": "Bangkok",
            "rating": 4.8,
            "distance": "~5km",
            "tags": ["Culture", "Green"]
        },
        {
            "external_id": "bkk_2",
            "name": "Grand Palace",
            "latitude": 13.7500,
            "longitude": 100.4913,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Phra_Borom_Maha_Ratcha_Wang.jpg/1200px-Phra_Borom_Maha_Ratcha_Wang.jpg",
            "description": "The Grand Palace is a complex of buildings at the heart of Bangkok, Thailand. The palace has been the official residence of the Kings of Siam since 1782.",
            "city": "Bangkok",
            "rating": 4.7,
            "distance": "~4km",
            "tags": ["Culture"]
        },
        {
            "external_id": "bkk_3",
            "name": "Chatuchak Weekend Market",
            "latitude": 13.7999,
            "longitude": 100.5498,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Chatuchak_Weekend_Market_overview.jpg/1200px-Chatuchak_Weekend_Market_overview.jpg",
            "description": "Chatuchak Weekend Market is the largest market in Thailand, and one of the largest of the world, covering an area of 35 acres with more than 15,000 stalls.",
            "city": "Bangkok",
            "rating": 4.5,
            "distance": "~10km",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "bkk_4",
            "name": "Lumphini Park",
            "latitude": 13.7315,
            "longitude": 100.5418,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lumphini_Park.jpg/1200px-Lumphini_Park.jpg",
            "description": "Lumphini Park is a 142-acre park in central Bangkok, Thailand. The park offers a rare patch of greenery in the heart of the city.",
            "city": "Bangkok",
            "rating": 4.6,
            "distance": "~3km",
            "tags": ["Green", "PM2.5 free"]
        },
        {
            "external_id": "bkk_5",
            "name": "Asiatique The Riverfront",
            "latitude": 13.7033,
            "longitude": 100.5001,
            "image_url": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/1d/c4/0e/asiatique-the-riverfront.jpg?w=1200&h=-1&s=1",
            "description": "Asiatique The Riverfront is a large open-air mall in Bangkok. It combines two popular shopping experiences: a night bazaar with over 1,500 boutiques.",
            "city": "Bangkok",
            "rating": 4.4,
            "distance": "~7km",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "bkk_6",
            "name": "Khao San Road",
            "latitude": 13.7586,
            "longitude": 100.4974,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Khaosan_road_at_night_by_kevinpoh.jpg/1200px-Khaosan_road_at_night_by_kevinpoh.jpg",
            "description": "Khao San Road is a short street in central Bangkok, Thailand known for its cheap accommodations and as a hub for backpackers.",
            "city": "Bangkok",
            "rating": 4.3,
            "distance": "~4.5km",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "bkk_7",
            "name": "ICONSIAM",
            "latitude": 13.7262,
            "longitude": 100.5107,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Icon_Siam_Bangkok.jpg/1200px-Icon_Siam_Bangkok.jpg",
            "description": "ICONSIAM is a mixed-use development on the banks of the Chao Phraya River in Bangkok, Thailand. It features high-end shopping and dining.",
            "city": "Bangkok",
            "rating": 4.7,
            "distance": "~5km",
            "tags": ["Street", "Culture"]
        },
        {
            "external_id": "bkk_8",
            "name": "Wat Pho",
            "latitude": 13.7465,
            "longitude": 100.4930,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Wat_Pho%2C_Bangkok%2C_Thailand_2.jpg/1200px-Wat_Pho%2C_Bangkok%2C_Thailand_2.jpg",
            "description": "Wat Pho is a Buddhist temple complex in Bangkok. It is on Rattanakosin Island, directly south of the Grand Palace. Known for the giant reclining Buddha.",
            "city": "Bangkok",
            "rating": 4.7,
            "distance": "~4.2km",
            "tags": ["Culture", "Green"]
        }
    ]
    
    all_places = chiang_mai_places + bangkok_places
    
    for place_data in all_places:
        place = Place(**place_data)
        db.add(place)
    
    db.commit()
    print(f"Successfully seeded {len(all_places)} places ({len(chiang_mai_places)} Chiang Mai, {len(bangkok_places)} Bangkok)")
    db.close()


def seed_rewards():
    """Seed rewards from frontend data"""
    db = SessionLocal()
    
    # Check if rewards already exist
    existing = db.query(Reward).count()
    if existing > 0:
        print(f"Database already has {existing} rewards. Skipping seed.")
        db.close()
        return
    
    rewards_data = [
        {
            "name": "20% Off at Khao Soi Mae Sai",
            "description": "Enjoy authentic Northern Thai cuisine with 20% off your entire bill",
            "image_url": "https://www.mytravelbuzzg.com/wp-content/uploads/Khao-Soi-Mae-Sai-Restaurant-e1693473350860.jpg",
            "coin_cost": 50,
            "category": "food",
            "discount_code": "YEEP20KHAO",
            "valid_until": "2026-12-31",
            "location": "Nimman Road, Chiang Mai",
            "original_price": "150 THB"
        },
        {
            "name": "Free Coffee at One Nimman",
            "description": "Redeem a free specialty coffee at any participating café in One Nimman",
            "image_url": "https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg",
            "coin_cost": 30,
            "category": "food",
            "discount_code": "YEEPFREE",
            "valid_until": "2026-12-31",
            "location": "One Nimman, Chiang Mai"
        },
        {
            "name": "Ginger Farm Tour",
            "description": "Get 50% off organic farm tour including lunch and activities",
            "image_url": "https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg",
            "coin_cost": 100,
            "category": "experience",
            "discount_code": "YEEPFARM50",
            "valid_until": "2026-12-31",
            "location": "Ginger Farm, Mae Wang",
            "original_price": "800 THB"
        },
        {
            "name": "Wat Umong Meditation Session",
            "description": "Free guided meditation session at the ancient temple tunnels",
            "image_url": "https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg",
            "coin_cost": 80,
            "category": "experience",
            "discount_code": "YEEPZEN",
            "valid_until": "2026-12-31",
            "location": "Wat Umong, Suthep"
        },
        {
            "name": "Think Park Night Market Voucher",
            "description": "100 THB shopping voucher for handmade crafts and local goods",
            "image_url": "https://changpuakmagazine.com/images/article/182925ArticleThumpnai_September2018-07-07_resize.jpg",
            "coin_cost": 40,
            "category": "souvenir",
            "discount_code": "YEEPCRAFT",
            "valid_until": "2026-12-31",
            "location": "Think Park, Nimman"
        },
        {
            "name": "Royal Park Bike Rental",
            "description": "Free 2-hour bicycle rental at Hor Kham Luang Royal Park",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg",
            "coin_cost": 25,
            "category": "experience",
            "discount_code": "YEEPBIKE",
            "valid_until": "2026-12-31",
            "location": "Royal Agricultural Research Center"
        },
        {
            "name": "Suki Chang Phueak Special",
            "description": "Free extra meat topping with any suki order",
            "image_url": "https://d13q9rhbndrrl0.cloudfront.net/posts/none/2021/8/1640512803955-655157687290318600.jpeg",
            "coin_cost": 20,
            "category": "food",
            "discount_code": "YEEPSUKI",
            "valid_until": "2026-12-31",
            "location": "Chang Phueak Night Market"
        },
        {
            "name": "Ang Kaew Sunset Picnic Set",
            "description": "Picnic basket rental with local snacks for sunset viewing",
            "image_url": "https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg",
            "coin_cost": 60,
            "category": "experience",
            "discount_code": "YEEPPICNIC",
            "valid_until": "2026-12-31",
            "location": "Ang Kaew Reservoir, CMU"
        }
    ]
    
    for reward_data in rewards_data:
        reward = Reward(**reward_data)
        db.add(reward)
    
    db.commit()
    print(f"Successfully seeded {len(rewards_data)} rewards")
    db.close()


if __name__ == "__main__":
    print("Seeding database...")
    seed_places()
    seed_rewards()
    print("Done!")
