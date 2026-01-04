/**
 * Seed Data - Complete travel places and rewards for the LIFF app
 * Converted from backend/seed_data.py for frontend-only deployment
 */

import type { TravelPlace } from '../types/TravelPlace';

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  coinCost: number;
  category: 'food' | 'experience' | 'souvenir';
  discountCode: string;
  validUntil: string;
  location: string;
  originalPrice?: string;
}

// ============================================
// CHIANG MAI PLACES - Including Hidden Gems
// ============================================
export const chiangMaiPlaces: TravelPlace[] = [
  {
    id: 'cm_1',
    name: 'Wat Umong',
    lat: 18.783636,
    long: 98.953588,
    image: 'https://www.pattayafans.de/chiangmai/bilder/wat-umong-4.jpg',
    description: 'A peaceful forest temple famous for its ancient tunnels filled with Buddha images. Walk through moss-covered passages, meditate in serene gardens, and experience authentic Buddhist spirituality away from tourist crowds.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3.2km',
    tags: ['Culture', 'Green', 'PM2.5 free']
  },
  {
    id: 'cm_2',
    name: 'Ang Kaew Reservoir',
    lat: 18.8020,
    long: 98.9446,
    image: 'https://img.wongnai.com/p/400x0/2018/10/20/05895251d10049ffb2af523f5ac289f9.jpg',
    description: 'A picturesque reservoir within Chiang Mai University featuring walking trails, scenic mountain views, and peaceful lawns perfect for sunset picnics. Popular with locals for jogging and relaxation.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~3.4km',
    tags: ['Green', 'PM2.5 free']
  },
  {
    id: 'cm_3',
    name: 'Hor Kham Luang',
    lat: 18.752879,
    long: 98.922341,
    image: 'https://img.freepik.com/free-photo/ho-kham-luang-northern-thai-style-building-thailand_100801-487.jpg?size=626&ext=jpg',
    description: 'An elegant Lanna-style royal pavilion set amidst 470 rai of beautifully landscaped gardens at the Royal Agricultural Research Center. Features traditional northern Thai architecture and seasonal flower displays.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~10.7km',
    tags: ['Culture', 'Green', 'PM2.5 free']
  },
  {
    id: 'cm_4',
    name: 'Wat Lok Molee',
    lat: 18.7962,
    long: 98.9826,
    image: 'https://ik.imagekit.io/tvlk/blog/2020/07/shutterstock_1219520572.jpg?tr=dpr-2,w-675',
    description: 'A hidden gem temple dating back to 1367 with stunning Lanna architecture. Features beautifully sculptured nagas, an ancient bare-brick chedi, and peaceful grounds away from tourist crowds. One of Chiang Mai\'s best-kept secrets.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.8,
    distance: '~1.5km',
    tags: ['Culture', 'Green']
  },
  {
    id: 'cm_5',
    name: 'Wat Chedi Luang',
    lat: 18.7869,
    long: 98.9864,
    image: 'https://tse3.mm.bing.net/th/id/OIP.-atZV5v5UMNfkgyfz6N8ZAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'A magnificent 14th-century temple with a massive ruined chedi that once stood 82 meters tall. The Emerald Buddha was housed here before being moved to Bangkok. Features daily monk chats with visitors.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.8,
    distance: '~800m',
    tags: ['Culture']
  },
  {
    id: 'cm_6',
    name: 'Wiang Kum Kam',
    lat: 18.7536,
    long: 98.9955,
    image: 'https://media.tacdn.com/media/attractions-content--1x-1/0b/27/b0/4d.jpg',
    description: 'An ancient buried city built by King Mangrai in the 13th century before Chiang Mai was founded. Explore over 20 archaeological temple ruins by horse cart or bicycle. A fascinating journey through forgotten history.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.5,
    distance: '~5km',
    tags: ['Culture', 'Green']
  },
  {
    id: 'cm_7',
    name: 'Doi Inthanon National Park',
    lat: 18.5875,
    long: 98.4867,
    image: 'https://www.thailandtravel.or.jp/wp-content/uploads/2020/05/Chiang-Mai-001683re.jpg',
    description: 'Thailand\'s highest peak at 2,565 meters featuring twin royal pagodas, stunning waterfalls, and cloud forests. Experience cool temperatures, rare birds, and breathtaking sunrise views above the clouds.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.9,
    distance: '~90km',
    tags: ['Green', 'PM2.5 free', 'Culture']
  },
  {
    id: 'cm_8',
    name: 'Mae Kampong Village',
    lat: 18.8655,
    long: 99.3510,
    image: 'https://royalvacationdmc.com/wp-content/uploads/2023/11/Mae-kampong.jpg',
    description: 'A charming mountain village at 1,300m elevation offering authentic homestay experiences. Known for traditional tea leaf fermentation, coffee cultivation, and a beautiful temple built over a pond. Perfect for eco-tourism.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~50km',
    tags: ['Green', 'Culture', 'PM2.5 free']
  },
  {
    id: 'cm_9',
    name: 'Bua Thong Sticky Waterfalls',
    lat: 19.1169,
    long: 99.1136,
    image: 'https://thethaiger.com/wp-content/uploads/2024/08/sticky-waterfall-1.jpg',
    description: 'Unique limestone waterfalls where you can actually climb UP the cascading water! The mineral deposits create a non-slip surface. A hidden adventure spot perfect for families and thrill-seekers alike.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.6,
    distance: '~60km',
    tags: ['Green', 'PM2.5 free']
  },
  {
    id: 'cm_10',
    name: 'Baan Kang Wat',
    lat: 18.7892,
    long: 98.9538,
    image: 'https://tluxe-aws.hmgcdn.com/public/article/2017/atl_20230621172059_166.jpg',
    description: 'A charming artist village with handcrafted studios, artisan cafes, and creative workshops. Browse unique handmade goods, enjoy specialty coffee, and meet local artists in this peaceful creative community.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.5,
    distance: '~4km',
    tags: ['Culture', 'Street']
  },
  {
    id: 'cm_11',
    name: 'Khao Soi Mae Sai',
    lat: 18.7997,
    long: 98.9751,
    image: 'https://img.wongnai.com/p/1600x0/2024/05/08/a9983bc62f9646038b1d434f671ea67f.jpg',
    description: 'Legendary Khao Soi restaurant serving the iconic Northern Thai curry noodle soup for decades. Rich coconut curry broth, tender chicken, and crispy egg noodles - authentic Lanna cuisine at its finest.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~500m',
    tags: ['Street', 'Culture']
  },
  {
    id: 'cm_12',
    name: 'One Nimman',
    lat: 18.8002,
    long: 98.9676,
    image: 'https://chiangmaijourney.com/wp-content/uploads/2023/10/One-Nimman-2.jpeg',
    description: 'A vibrant lifestyle complex in the trendy Nimman area featuring Thai designer boutiques, artisan cafes, and local craft shops. Perfect for unique souvenirs and experiencing modern Chiang Mai culture.',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.5,
    distance: '~750m',
    tags: ['Street', 'Culture']
  }
];

// ============================================
// BANGKOK PLACES - Including Hidden Gems
// ============================================
export const bangkokPlaces: TravelPlace[] = [
  {
    id: 'bkk_1',
    name: 'Wat Arun',
    lat: 13.7437,
    long: 100.4888,
    image: 'https://static.wixstatic.com/media/2cc94a_07e55de318fe41538e17cb9de596cb45~mv2.jpg/v1/fill/w_317,h_178,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/shutterstock_2183013411.jpg',
    description: 'The Temple of Dawn with its iconic 82-meter spire decorated with colorful porcelain. Climb the steep steps for panoramic river views, especially magical at sunset when the spire glows golden.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.8,
    distance: '~5km',
    tags: ['Culture']
  },
  {
    id: 'bkk_2',
    name: 'Grand Palace',
    lat: 13.7500,
    long: 100.4913,
    image: 'https://www.agoda.com/wp-content/uploads/2024/03/Featured-image-Wat-Arun-Bangkok-Thailand.jpg',
    description: 'The official residence of Thai Kings since 1782, featuring intricate architecture, the sacred Emerald Buddha, and over 100 buildings spanning 200 years of royal history.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~4km',
    tags: ['Culture']
  },
  {
    id: 'bkk_3',
    name: 'Wat Pho',
    lat: 13.7465,
    long: 100.4930,
    image: 'https://cdn.forevervacation.com/uploads/attraction/wat-pho-3743.jpg',
    description: 'Home to the spectacular 46-meter Reclining Buddha covered in gold leaf. Also the birthplace of traditional Thai massage - get an authentic massage at the temple\'s famous school.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~4.2km',
    tags: ['Culture', 'Green']
  },
  {
    id: 'bkk_4',
    name: 'Wat Paknam Bhasicharoen',
    lat: 13.7217,
    long: 100.4703,
    image: 'https://www.thailandee.com/img/villes/bangkok/wat-paknam-phasi-charoen-buddha-bangkok.jpg',
    description: 'A stunning hidden temple featuring an 80-meter stupa with a mesmerizing emerald glass ceiling depicting Buddhist cosmology. The giant bronze Buddha statue is visible from across the city. Less crowded than major temples.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.8,
    distance: '~10km',
    tags: ['Culture', 'Green']
  },
  {
    id: 'bkk_5',
    name: 'Talat Noi',
    lat: 13.7333,
    long: 100.5139,
    image: 'https://d1ef7ke0x2i9g8.cloudfront.net/hong-kong/_1200x630_fit_center-center_82_none/20230111-Talat-Noi-PIC02.png?mtime=1724145861',
    description: 'Bangkok\'s hidden creative quarter with stunning street art, historic Sino-Portuguese architecture, and authentic Chinese-Thai culture. Explore vintage cafes, antique shops, and the beautiful Holy Rosary Church.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3km',
    tags: ['Culture', 'Street']
  },
  {
    id: 'bkk_6',
    name: 'Bang Krachao',
    lat: 13.6850,
    long: 100.5550,
    image: 'https://www.thelostpassport.com/wp-content/uploads/2016/06/Bangkok-treehouse-Bang-Krachao.jpg',
    description: 'The \'Green Lung of Bangkok\' - a car-free island jungle in the middle of the city! Rent a bike, cycle through mangrove forests, visit floating markets, and escape the urban chaos. A local secret paradise.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~12km',
    tags: ['Green', 'PM2.5 free', 'Culture']
  },
  {
    id: 'bkk_7',
    name: 'Wat Saket (Golden Mount)',
    lat: 13.7536,
    long: 100.5069,
    image: 'https://images.squarespace-cdn.com/content/v1/62f1cb15a2cb083186ccd6d1/ab21e971-78a1-4bbd-82cc-f2df2403b6d0/Untitled+design.png',
    description: 'Climb 318 steps to this hilltop temple for 360-degree views of old Bangkok. The golden chedi dates back 200 years and offers a peaceful escape with fewer tourists than other major temples.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3.5km',
    tags: ['Culture']
  },
  {
    id: 'bkk_8',
    name: 'Lumphini Park',
    lat: 13.7315,
    long: 100.5418,
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Aerial_view_of_Lumphini_Park.jpg',
    description: 'Bangkok\'s largest central park offering a green oasis with lakes, paddle boats, and resident monitor lizards! Perfect for morning tai chi, evening jogs, or peaceful picnics away from the urban heat.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3km',
    tags: ['Green', 'PM2.5 free']
  },
  {
    id: 'bkk_9',
    name: 'Chatuchak Weekend Market',
    lat: 13.7999,
    long: 100.5498,
    image: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/chatuchak-w1800h1360.jpg',
    description: 'The world\'s largest outdoor market with over 15,000 stalls across 35 acres. From vintage clothes to exotic pets, antiques to street food - get lost in this legendary shopping maze.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.5,
    distance: '~10km',
    tags: ['Street', 'Culture']
  },
  {
    id: 'bkk_10',
    name: 'ICONSIAM',
    lat: 13.7262,
    long: 100.5107,
    image: 'https://www.airportels.asia/wp-content/uploads/2023/08/shutterstock_1416988205-edited.jpg',
    description: 'A stunning riverside mega-mall featuring an indoor floating market, luxury brands, and incredible river views. Experience Thai heritage and modern luxury in one spectacular destination.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~5km',
    tags: ['Street', 'Culture']
  },
  {
    id: 'bkk_11',
    name: 'Lhong 1919',
    lat: 13.7267,
    long: 100.5033,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/6d/55/86/lhong-1919.jpg?w=1200&h=-1&s=1',
    description: 'A beautifully restored 19th-century Chinese mansion and pier with stunning murals, artisan shops, and riverside dining. This hidden heritage site offers a glimpse into Bangkok\'s trading past.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.5,
    distance: '~5.5km',
    tags: ['Culture', 'Street']
  },
  {
    id: 'bkk_12',
    name: 'Yaowarat (Chinatown)',
    lat: 13.7407,
    long: 100.5100,
    image: 'https://www.siamguides.com/wp-content/uploads/2024/05/yaowarat-road-chinatown-bangkok-thailand-2.jpg',
    description: 'Bangkok\'s vibrant Chinatown comes alive at night with legendary street food stalls. Sample bird\'s nest soup, roasted duck, and fresh seafood while exploring golden dragon gates and historic shophouses.',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~4km',
    tags: ['Street', 'Culture']
  }
];

// ============================================
// PHUKET PLACES - Hidden Gems & Beaches
// ============================================
export const phuketPlaces: TravelPlace[] = [
  {
    id: 'pkt_1',
    name: 'Phuket Old Town',
    lat: 7.8857,
    long: 98.3876,
    image: 'https://phuket.intercontinental.com/sites/phuket/files/styles/hero_banner_1920_810/public/2025-05/shutterstock_1283102005%20%281%29.jpg.webp?itok=thnxpXhU',
    description: 'Charming Sino-Portuguese heritage district with colorful shophouses, hip cafes, street art, and boutique hotels. Explore Thalang Road\'s architecture dating back to the tin mining era.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.7,
    distance: '~3km',
    tags: ['Culture', 'Street']
  },
  {
    id: 'pkt_2',
    name: 'Wat Chalong',
    lat: 7.8467,
    long: 98.3367,
    image: 'https://blog.bangkokair.com/wp-content/uploads/2025/05/Cover_wat-chalong-temple-phuket.jpg',
    description: 'Phuket\'s most important Buddhist temple featuring a three-story grand pagoda housing Buddha relics. Beautifully decorated halls with intricate murals depicting Buddha\'s life.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~8km',
    tags: ['Culture']
  },
  {
    id: 'pkt_3',
    name: 'Big Buddha Phuket',
    lat: 7.8275,
    long: 98.3131,
    image: 'https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/292/2025/04/17025402/Big-Buddha-Phuket.jpg',
    description: 'A 45-meter white marble Buddha statue atop Nakkerd Hill offering 360-degree panoramic views of the island. Wind chimes create a peaceful atmosphere at this iconic landmark.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.8,
    distance: '~12km',
    tags: ['Culture', 'Green']
  },
  {
    id: 'pkt_4',
    name: 'Promthep Cape',
    lat: 7.7589,
    long: 98.3035,
    image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/ce4d3310ef916e2be7cdf0884f4d81e58619fc9f-1600x1066.jpg',
    description: 'Phuket\'s most famous sunset viewpoint at the island\'s southern tip. Watch the sun sink into the Andaman Sea from dramatic cliffs with lighthouse and shrine.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.7,
    distance: '~20km',
    tags: ['Green', 'Culture']
  },
  {
    id: 'pkt_5',
    name: 'Nai Harn Beach',
    lat: 7.7700,
    long: 98.3033,
    image: 'https://cdn.prod.website-files.com/650bafc1a2425df702884d05/65e6cea3a13348b5f81718d4_nai-harn-beach.png',
    description: 'A local favorite beach with crystal-clear water and fewer tourists. Surrounded by hills with a tranquil lagoon behind. Perfect for swimming and authentic Thai beach vibes.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~18km',
    tags: ['Green', 'PM2.5 free']
  },
  {
    id: 'pkt_6',
    name: 'Freedom Beach',
    lat: 7.8958,
    long: 98.2722,
    image: 'https://content.phuket101.net/wp-content/uploads/20250121213902/freedom-beach-Phuket-1.jpg',
    description: 'A hidden paradise accessible only by longtail boat or jungle trek. Pristine white sand, turquoise water, and jungle-covered cliffs create an unspoiled tropical escape.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.8,
    distance: '~15km',
    tags: ['Green', 'PM2.5 free']
  },
  {
    id: 'pkt_7',
    name: 'Banana Beach',
    lat: 7.9803,
    long: 98.2847,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/c0/a3/79/banana-beach.jpg?w=1200&h=-1&s=1',
    description: 'A secret cove reached by steep jungle path. Rewards adventurous visitors with untouched sand, clear snorkeling waters, and beach restaurants serving fresh seafood.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.5,
    distance: '~22km',
    tags: ['Green', 'PM2.5 free']
  },
  {
    id: 'pkt_8',
    name: 'Karon Viewpoint',
    lat: 7.8167,
    long: 98.3000,
    image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/72fe06a765513c2d68642a38ff72aafb2488092c-1600x1066.jpg',
    description: 'Stunning viewpoint overlooking three bays - Kata Noi, Kata, and Karon beaches. One of Phuket\'s most photographed locations with dramatic coastal scenery.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~16km',
    tags: ['Green']
  },
  {
    id: 'pkt_9',
    name: 'Phang Nga Bay',
    lat: 8.2750,
    long: 98.5000,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ko_Tapu_Phang_Nga_Bay.jpg/1280px-Ko_Tapu_Phang_Nga_Bay.jpg',
    description: 'Spectacular bay famous for dramatic limestone karsts rising from emerald waters. Explore sea caves by kayak, visit James Bond Island, and discover hidden lagoons.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.9,
    distance: '~25km',
    tags: ['Green', 'PM2.5 free']
  },
  {
    id: 'pkt_10',
    name: 'Phuket Weekend Market',
    lat: 7.8842,
    long: 98.3917,
    image: 'https://www.aleenta.com/wp-content/uploads/2022/03/Why_is_Phang_Nga_Bay_Famous.jpg',
    description: 'Authentic local night market with Thai street food, live music, and bargain shopping. Experience real Phuket culture away from tourist areas every Saturday and Sunday.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.4,
    distance: '~5km',
    tags: ['Street', 'Culture']
  },
  {
    id: 'pkt_11',
    name: 'Rawai Seafood Market',
    lat: 7.7767,
    long: 98.3278,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/60/7c/0e/caption.jpg?w=900&h=500&s=1',
    description: 'Fresh-from-the-boat seafood market where locals buy their catch. Select your fish, prawns, or lobster and have it cooked at adjacent restaurants. Authentic and affordable!',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.5,
    distance: '~17km',
    tags: ['Street', 'Culture']
  },
  {
    id: 'pkt_12',
    name: 'Sirinat National Park',
    lat: 8.1167,
    long: 98.3000,
    image: 'https://www.thainationalparks.com/img/poi/2019/10/04/384098/sirinat-national-park-beach-w-900.jpg',
    description: 'Protected marine park with pristine beaches, mangrove forests, and sea turtle nesting sites. Watch planes land dramatically close at Mai Khao Beach. A nature lover\'s paradise.',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~30km',
    tags: ['Green', 'PM2.5 free']
  }
];

// ============================================
// ALL PLACES COMBINED
// ============================================
export const allPlaces: TravelPlace[] = [
  ...chiangMaiPlaces,
  ...bangkokPlaces,
  ...phuketPlaces
];

// ============================================
// REWARDS
// ============================================
export const rewards: Reward[] = [
  // Chiang Mai Rewards
  {
    id: 'rw_1',
    name: '20% Off at Khao Soi Mae Sai',
    description: 'Enjoy authentic Northern Thai cuisine with 20% off your entire bill',
    image: 'https://www.mytravelbuzzg.com/wp-content/uploads/Khao-Soi-Mae-Sai-Restaurant-e1693473350860.jpg',
    coinCost: 50,
    category: 'food',
    discountCode: 'YEEP20KHAO',
    validUntil: '2026-12-31',
    location: 'Nimman Road, Chiang Mai',
    originalPrice: '150 THB'
  },
  {
    id: 'rw_2',
    name: 'Free Coffee at One Nimman',
    description: 'Redeem a free specialty coffee at any participating café in One Nimman',
    image: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg',
    coinCost: 30,
    category: 'food',
    discountCode: 'YEEPFREE',
    validUntil: '2026-12-31',
    location: 'One Nimman, Chiang Mai'
  },
  {
    id: 'rw_3',
    name: 'Ginger Farm Tour',
    description: 'Get 50% off organic farm tour including lunch and activities',
    image: 'https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg',
    coinCost: 100,
    category: 'experience',
    discountCode: 'YEEPFARM50',
    validUntil: '2026-12-31',
    location: 'Ginger Farm, Mae Wang',
    originalPrice: '800 THB'
  },
  {
    id: 'rw_4',
    name: 'Wat Umong Meditation Session',
    description: 'Free guided meditation session at the ancient temple tunnels',
    image: 'https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg',
    coinCost: 80,
    category: 'experience',
    discountCode: 'YEEPZEN',
    validUntil: '2026-12-31',
    location: 'Wat Umong, Suthep'
  },
  {
    id: 'rw_5',
    name: 'Think Park Night Market Voucher',
    description: '100 THB shopping voucher for handmade crafts and local goods',
    image: 'https://changpuakmagazine.com/images/article/182925ArticleThumpnai_September2018-07-07_resize.jpg',
    coinCost: 40,
    category: 'souvenir',
    discountCode: 'YEEPCRAFT',
    validUntil: '2026-12-31',
    location: 'Think Park, Nimman'
  },
  {
    id: 'rw_6',
    name: 'Royal Park Bike Rental',
    description: 'Free 2-hour bicycle rental at Hor Kham Luang Royal Park',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg',
    coinCost: 25,
    category: 'experience',
    discountCode: 'YEEPBIKE',
    validUntil: '2026-12-31',
    location: 'Royal Agricultural Research Center'
  },
  {
    id: 'rw_7',
    name: 'Suki Chang Phueak Special',
    description: 'Free extra meat topping with any suki order',
    image: 'https://d13q9rhbndrrl0.cloudfront.net/posts/none/2021/8/1640512803955-655157687290318600.jpeg',
    coinCost: 20,
    category: 'food',
    discountCode: 'YEEPSUKI',
    validUntil: '2026-12-31',
    location: 'Chang Phueak Night Market'
  },
  {
    id: 'rw_8',
    name: 'Ang Kaew Sunset Picnic Set',
    description: 'Picnic basket rental with local snacks for sunset viewing',
    image: 'https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg',
    coinCost: 60,
    category: 'experience',
    discountCode: 'YEEPPICNIC',
    validUntil: '2026-12-31',
    location: 'Ang Kaew Reservoir, CMU'
  },
  // Bangkok Rewards
  {
    id: 'rw_9',
    name: 'Wat Arun Sunset Cruise',
    description: '50% off riverside dinner cruise with stunning Temple of Dawn views',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Wat_Arun%2C_Bangkok%2C_Thailand_%28I%29.jpg/1280px-Wat_Arun%2C_Bangkok%2C_Thailand_%28I%29.jpg',
    coinCost: 120,
    category: 'experience',
    discountCode: 'YEEPSUNSET',
    validUntil: '2026-12-31',
    location: 'Chao Phraya River, Bangkok',
    originalPrice: '1,500 THB'
  },
  {
    id: 'rw_10',
    name: 'Chatuchak Market Tour',
    description: 'Free guided walking tour of Bangkok\'s legendary weekend market',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Chatuchak_Weekend_Market_overview.jpg/1280px-Chatuchak_Weekend_Market_overview.jpg',
    coinCost: 75,
    category: 'experience',
    discountCode: 'YEEPJJ',
    validUntil: '2026-12-31',
    location: 'Chatuchak Weekend Market, Bangkok'
  },
  {
    id: 'rw_11',
    name: 'Yaowarat Street Food Trail',
    description: '100 THB voucher for Chinatown\'s best street food stalls',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bangkok_Yaowarat_Road.jpg/1280px-Bangkok_Yaowarat_Road.jpg',
    coinCost: 45,
    category: 'food',
    discountCode: 'YEEPCHINATOWN',
    validUntil: '2026-12-31',
    location: 'Yaowarat Road, Bangkok'
  },
  {
    id: 'rw_12',
    name: 'Lumphini Park Pedal Boat',
    description: 'Free 1-hour swan pedal boat rental at Lumphini Park',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lumpini_Park_Bangkok.jpg/1280px-Lumpini_Park_Bangkok.jpg',
    coinCost: 35,
    category: 'experience',
    discountCode: 'YEEPPEDAL',
    validUntil: '2026-12-31',
    location: 'Lumphini Park, Bangkok'
  },
  {
    id: 'rw_13',
    name: 'Bang Krachao Bike Adventure',
    description: 'Half-day bike rental with guided map of the Green Lung',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bang_Krachao_aerial_view.jpg/1280px-Bang_Krachao_aerial_view.jpg',
    coinCost: 50,
    category: 'experience',
    discountCode: 'YEEPGREEN',
    validUntil: '2026-12-31',
    location: 'Bang Krachao, Bangkok'
  },
  // Phuket Rewards
  {
    id: 'rw_14',
    name: 'Phuket Old Town Walking Tour',
    description: 'Free 2-hour heritage walking tour with local guide',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Soi_Rommanee%2C_Phuket_Town.jpg/1280px-Soi_Rommanee%2C_Phuket_Town.jpg',
    coinCost: 65,
    category: 'experience',
    discountCode: 'YEEPOLDTOWN',
    validUntil: '2026-12-31',
    location: 'Thalang Road, Phuket Old Town'
  },
  {
    id: 'rw_15',
    name: 'Promthep Cape Sunset Dinner',
    description: '20% off seafood dinner at cliff-top restaurant',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Promthep_Cape.jpg/1280px-Promthep_Cape.jpg',
    coinCost: 80,
    category: 'food',
    discountCode: 'YEEPCLIFF',
    validUntil: '2026-12-31',
    location: 'Promthep Cape, Phuket',
    originalPrice: '800 THB'
  },
  {
    id: 'rw_16',
    name: 'Phang Nga Bay Kayak Tour',
    description: '25% off full-day kayaking adventure through limestone caves',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ko_Tapu_Phang_Nga_Bay.jpg/1280px-Ko_Tapu_Phang_Nga_Bay.jpg',
    coinCost: 150,
    category: 'experience',
    discountCode: 'YEEPKAYAK',
    validUntil: '2026-12-31',
    location: 'Phang Nga Bay',
    originalPrice: '2,500 THB'
  },
  {
    id: 'rw_17',
    name: 'Rawai Seafood Feast',
    description: 'Free lobster upgrade with any seafood platter order',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Rawai_Beach.jpg/1280px-Rawai_Beach.jpg',
    coinCost: 70,
    category: 'food',
    discountCode: 'YEEPLOBSTER',
    validUntil: '2026-12-31',
    location: 'Rawai Seafood Market, Phuket'
  },
  {
    id: 'rw_18',
    name: 'Big Buddha Meditation Class',
    description: 'Free morning meditation session with panoramic views',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Big_Buddha_Phuket.jpg/1280px-Big_Buddha_Phuket.jpg',
    coinCost: 55,
    category: 'experience',
    discountCode: 'YEEPBUDDHA',
    validUntil: '2026-12-31',
    location: 'Big Buddha, Nakkerd Hill, Phuket'
  }
];

// Helper functions
export const getPlacesByCity = (city: string): TravelPlace[] => {
  if (city === 'all') return allPlaces;
  return allPlaces.filter(p => p.city === city);
};

export const getPlaceById = (id: string): TravelPlace | undefined => {
  return allPlaces.find(p => p.id === id);
};

export const getRewardsByCategory = (category: string): Reward[] => {
  if (category === 'all') return rewards;
  return rewards.filter(r => r.category === category);
};

export const getRewardById = (id: string): Reward | undefined => {
  return rewards.find(r => r.id === id);
};

export const getAvailableCities = (): string[] => {
  return ['Bangkok', 'Chiang Mai', 'Phuket'];
};
