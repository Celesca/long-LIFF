/**
 * Seed Data - Complete travel places and rewards for the LIFF app
 * Converted from backend/seed_data.py for frontend-only deployment
 * Updated: Thai language translations for all travel places
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
// CHIANG MAI PLACES - รวมสถานที่ลับ
// ============================================
export const chiangMaiPlaces: TravelPlace[] = [
  {
    id: 'cm_1',
    name: 'วัดอุโมงค์',
    lat: 18.783636,
    long: 98.953588,
    image: 'https://www.pattayafans.de/chiangmai/bilder/wat-umong-4.jpg',
    description: 'วัดป่าที่สงบเงียบ มีชื่อเสียงเรื่องอุโมงค์โบราณที่เต็มไปด้วยพระพุทธรูป เดินผ่านทางเดินที่ปกคลุมด้วยมอส นั่งสมาธิในสวนอันสงบ และสัมผัสความศรัทธาทางพุทธศาสนาอย่างแท้จริง ห่างไกลจากฝูงชนนักท่องเที่ยว',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3.2 กม.',
    tags: ['วัฒนธรรม', 'ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'cm_2',
    name: 'อ่างแก้ว',
    lat: 18.8020,
    long: 98.9446,
    image: 'https://img.wongnai.com/p/400x0/2018/10/20/05895251d10049ffb2af523f5ac289f9.jpg',
    description: 'อ่างเก็บน้ำสวยงามภายในมหาวิทยาลัยเชียงใหม่ มีทางเดินเลียบริมน้ำ วิวภูเขาสวยงาม และสนามหญ้ากว้างเหมาะสำหรับปิกนิกยามเย็น เป็นที่นิยมของคนท้องถิ่นสำหรับวิ่งจ็อกกิ้งและพักผ่อน',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~3.4 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'cm_3',
    name: 'หอคำหลวง',
    lat: 18.752879,
    long: 98.922341,
    image: 'https://img.freepik.com/free-photo/ho-kham-luang-northern-thai-style-building-thailand_100801-487.jpg?size=626&ext=jpg',
    description: 'หอพระราชพิธีสไตล์ล้านนาอันงดงาม ตั้งอยู่ท่ามกลางสวนภูมิทัศน์ 470 ไร่ ณ ศูนย์วิจัยเกษตรหลวง มีสถาปัตยกรรมไทยเหนือแบบดั้งเดิม และการจัดแสดงดอกไม้ตามฤดูกาล',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~10.7 กม.',
    tags: ['วัฒนธรรม', 'ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'cm_4',
    name: 'วัดโลกโมฬี',
    lat: 18.7962,
    long: 98.9826,
    image: 'https://ik.imagekit.io/tvlk/blog/2020/07/shutterstock_1219520572.jpg?tr=dpr-2,w-675',
    description: 'วัดซ่อนเร้นที่มีประวัติย้อนไปถึง พ.ศ. 1910 มีสถาปัตยกรรมล้านนาอันงดงาม พญานาคแกะสลักอย่างวิจิตร เจดีย์อิฐเก่าแก่ และลานวัดอันสงบ ห่างไกลจากนักท่องเที่ยว หนึ่งในความลับที่ดีที่สุดของเชียงใหม่',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.8,
    distance: '~1.5 กม.',
    tags: ['วัฒนธรรม', 'ธรรมชาติ']
  },
  {
    id: 'cm_5',
    name: 'วัดเจดีย์หลวง',
    lat: 18.7869,
    long: 98.9864,
    image: 'https://tse3.mm.bing.net/th/id/OIP.-atZV5v5UMNfkgyfz6N8ZAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'วัดมหัศจรรย์จากศตวรรษที่ 14 มีเจดีย์ขนาดใหญ่ที่เคยสูงถึง 82 เมตร พระแก้วมรกตเคยประดิษฐานที่นี่ก่อนย้ายไปกรุงเทพฯ มีกิจกรรม Monk Chat ให้พูดคุยกับพระภิกษุทุกวัน',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.8,
    distance: '~800 ม.',
    tags: ['วัฒนธรรม']
  },
  {
    id: 'cm_6',
    name: 'เวียงกุมกาม',
    lat: 18.7536,
    long: 98.9955,
    image: 'https://media.tacdn.com/media/attractions-content--1x-1/0b/27/b0/4d.jpg',
    description: 'เมืองโบราณที่ถูกฝังอยู่ใต้ดิน สร้างโดยพญามังรายในศตวรรษที่ 13 ก่อนสร้างเชียงใหม่ สำรวจซากวัดโบราณกว่า 20 แห่งโดยรถม้าหรือจักรยาน การเดินทางผ่านประวัติศาสตร์ที่ถูกลืม',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.5,
    distance: '~5 กม.',
    tags: ['วัฒนธรรม', 'ธรรมชาติ']
  },
  {
    id: 'cm_7',
    name: 'อุทยานแห่งชาติดอยอินทนนท์',
    lat: 18.5875,
    long: 98.4867,
    image: 'https://www.thailandtravel.or.jp/wp-content/uploads/2020/05/Chiang-Mai-001683re.jpg',
    description: 'ยอดเขาที่สูงที่สุดในประเทศไทย 2,565 เมตร มีพระมหาธาตุนภเมทนีดลและนภพลภูมิสิริ น้ำตกสวยงาม และป่าเมฆ สัมผัสอากาศเย็นสบาย นกหายาก และวิวพระอาทิตย์ขึ้นเหนือทะเลหมอก',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.9,
    distance: '~90 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี', 'วัฒนธรรม']
  },
  {
    id: 'cm_8',
    name: 'หมู่บ้านแม่กำปอง',
    lat: 18.8655,
    long: 99.3510,
    image: 'https://royalvacationdmc.com/wp-content/uploads/2023/11/Mae-kampong.jpg',
    description: 'หมู่บ้านบนภูเขาที่สูง 1,300 เมตร มีประสบการณ์โฮมสเตย์แท้จริง มีชื่อเสียงเรื่องการหมักใบชา การปลูกกาแฟ และวัดสวยงามสร้างเหนือสระน้ำ เหมาะสำหรับท่องเที่ยวเชิงนิเวศ',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~50 กม.',
    tags: ['ธรรมชาติ', 'วัฒนธรรม', 'อากาศดี']
  },
  {
    id: 'cm_9',
    name: 'น้ำตกบัวตอง (น้ำตกเหนียว)',
    lat: 19.1169,
    long: 99.1136,
    image: 'https://thethaiger.com/wp-content/uploads/2024/08/sticky-waterfall-1.jpg',
    description: 'น้ำตกหินปูนพิเศษที่สามารถเดินขึ้นไปบนน้ำตกได้! แร่ธาตุที่สะสมทำให้พื้นผิวไม่ลื่น สถานที่ผจญภัยลับเหมาะสำหรับครอบครัวและผู้ชื่นชอบความตื่นเต้น',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.6,
    distance: '~60 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'cm_10',
    name: 'บ้านข้างวัด',
    lat: 18.7892,
    long: 98.9538,
    image: 'https://tluxe-aws.hmgcdn.com/public/article/2017/atl_20230621172059_166.jpg',
    description: 'หมู่บ้านศิลปินมีเสน่ห์ มีสตูดิโอทำมือ คาเฟ่ช่างฝีมือ และเวิร์กช็อปสร้างสรรค์ เลือกซื้อสินค้าทำมือ ดื่มกาแฟพิเศษ และพบปะศิลปินท้องถิ่นในชุมชนสร้างสรรค์ที่สงบ',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.5,
    distance: '~4 กม.',
    tags: ['วัฒนธรรม', 'ตลาด']
  },
  {
    id: 'cm_11',
    name: 'ข้าวซอยแม่ไสย',
    lat: 18.7997,
    long: 98.9751,
    image: 'https://img.wongnai.com/p/1600x0/2024/05/08/a9983bc62f9646038b1d434f671ea67f.jpg',
    description: 'ร้านข้าวซอยตำนานที่เสิร์ฟก๋วยเตี๋ยวแกงกะทิเหนือมาหลายสิบปี น้ำแกงกะทิเข้มข้น ไก่นุ่ม และบะหมี่ไข่กรอบ อาหารล้านนาแท้ที่ดีที่สุด',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.7,
    distance: '~500 ม.',
    tags: ['ตลาด', 'วัฒนธรรม']
  },
  {
    id: 'cm_12',
    name: 'วัน นิมมาน',
    lat: 18.8002,
    long: 98.9676,
    image: 'https://chiangmaijourney.com/wp-content/uploads/2023/10/One-Nimman-2.jpeg',
    description: 'คอมเพล็กซ์ไลฟ์สไตล์ในย่านนิมมานแสนเก๋ มีบูติกดีไซเนอร์ไทย คาเฟ่ช่างฝีมือ และร้านงานฝีมือท้องถิ่น เหมาะสำหรับของฝากเก๋ๆ และสัมผัสวัฒนธรรมเชียงใหม่ยุคใหม่',
    city: 'Chiang Mai',
    country: 'Thailand',
    rating: 4.5,
    distance: '~750 ม.',
    tags: ['ตลาด', 'วัฒนธรรม']
  }
];

// ============================================
// BANGKOK PLACES - รวมสถานที่ลับ
// ============================================
export const bangkokPlaces: TravelPlace[] = [
  {
    id: 'bkk_1',
    name: 'วัดอรุณราชวราราม',
    lat: 13.7437,
    long: 100.4888,
    image: 'https://lp-cms-production.s3.amazonaws.com/public/2021-06/shutterstockRF_517093306.jpg',
    description: 'วัดแจ้ง มียอดปรางค์สูง 82 เมตร ประดับด้วยเครื่องกระเบื้องสีสันสดใส ปีนขั้นบันไดชันเพื่อชมวิวแม่น้ำ งดงามเป็นพิเศษยามพระอาทิตย์ตกเมื่อยอดปรางค์เปล่งประกายสีทอง',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.8,
    distance: '~5 กม.',
    tags: ['วัฒนธรรม']
  },
  {
    id: 'bkk_2',
    name: 'พระบรมมหาราชวัง',
    lat: 13.7500,
    long: 100.4913,
    image: 'https://www.agoda.com/wp-content/uploads/2024/03/Featured-image-Wat-Arun-Bangkok-Thailand.jpg',
    description: 'ที่ประทับอย่างเป็นทางการของพระมหากษัตริย์ไทยตั้งแต่ พ.ศ. 2325 มีสถาปัตยกรรมวิจิตร พระแก้วมรกตศักดิ์สิทธิ์ และอาคารกว่า 100 หลังที่ครอบคลุมประวัติศาสตร์ราชวงศ์กว่า 200 ปี',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~4 กม.',
    tags: ['วัฒนธรรม']
  },
  {
    id: 'bkk_3',
    name: 'วัดพระเชตุพนวิมลมังคลาราม (วัดโพธิ์)',
    lat: 13.7465,
    long: 100.4930,
    image: 'https://cdn.forevervacation.com/uploads/attraction/wat-pho-3743.jpg',
    description: 'ประดิษฐานพระพุทธไสยาสน์ยาว 46 เมตร ปิดทองคำเปลว เป็นต้นกำเนิดของนวดแผนไทย รับบริการนวดแท้จากโรงเรียนนวดแผนไทยที่มีชื่อเสียง',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~4.2 กม.',
    tags: ['วัฒนธรรม', 'ธรรมชาติ']
  },
  {
    id: 'bkk_4',
    name: 'วัดปากน้ำภาษีเจริญ',
    lat: 13.7217,
    long: 100.4703,
    image: 'https://www.thailandee.com/img/villes/bangkok/wat-paknam-phasi-charoen-buddha-bangkok.jpg',
    description: 'วัดซ่อนเร้นอันงดงาม มีพระมหาเจดีย์สูง 80 เมตร เพดานกระจกสีเขียวมรกตวาดภาพจักรวาลในพุทธศาสนา พระพุทธรูปสำริดขนาดใหญ่เห็นได้จากทั่วเมือง ผู้คนน้อยกว่าวัดหลักๆ',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.8,
    distance: '~10 กม.',
    tags: ['วัฒนธรรม', 'ธรรมชาติ']
  },
  {
    id: 'bkk_5',
    name: 'ตลาดน้อย',
    lat: 13.7333,
    long: 100.5139,
    image: 'https://d1ef7ke0x2i9g8.cloudfront.net/hong-kong/_1200x630_fit_center-center_82_none/20230111-Talat-Noi-PIC02.png?mtime=1724145861',
    description: 'ย่านสร้างสรรค์ซ่อนเร้นของกรุงเทพฯ มีสตรีทอาร์ตสวยงาม สถาปัตยกรรมชิโน-โปรตุกีสเก่าแก่ และวัฒนธรรมจีน-ไทยแท้จริง สำรวจคาเฟ่วินเทจ ร้านของเก่า และโบสถ์กาลหว่าร์อันงดงาม',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3 กม.',
    tags: ['วัฒนธรรม', 'ตลาด']
  },
  {
    id: 'bkk_6',
    name: 'บางกะเจ้า',
    lat: 13.6850,
    long: 100.5550,
    image: 'https://www.thelostpassport.com/wp-content/uploads/2016/06/Bangkok-treehouse-Bang-Krachao.jpg',
    description: '"ปอดของกรุงเทพฯ" เกาะป่าไร้รถยนต์กลางเมือง! เช่าจักรยาน ปั่นผ่านป่าชายเลน เที่ยวตลาดน้ำ และหนีความวุ่นวายในเมือง สวรรค์ลับของคนท้องถิ่น',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~12 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี', 'วัฒนธรรม']
  },
  {
    id: 'bkk_7',
    name: 'วัดสระเกศ (ภูเขาทอง)',
    lat: 13.7536,
    long: 100.5069,
    image: 'https://images.squarespace-cdn.com/content/v1/62f1cb15a2cb083186ccd6d1/ab21e971-78a1-4bbd-82cc-f2df2403b6d0/Untitled+design.png',
    description: 'ปีนบันได 318 ขั้นสู่วัดบนยอดเขา ชมวิว 360 องศาของกรุงเทพฯ เก่า เจดีย์ทองมีอายุกว่า 200 ปี เป็นที่พักผ่อนสงบ นักท่องเที่ยวน้อยกว่าวัดหลักอื่นๆ',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3.5 กม.',
    tags: ['วัฒนธรรม']
  },
  {
    id: 'bkk_8',
    name: 'สวนลุมพินี',
    lat: 13.7315,
    long: 100.5418,
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Aerial_view_of_Lumphini_Park.jpg',
    description: 'สวนสาธารณะที่ใหญ่ที่สุดใจกลางกรุงเทพฯ โอเอซิสสีเขียวมีทะเลสาบ เรือถีบ และตัวเหี้ย! เหมาะสำหรับไทเก็กตอนเช้า วิ่งจ๊อกกิ้งตอนเย็น หรือปิกนิกสงบห่างจากความร้อนในเมือง',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~3 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'bkk_9',
    name: 'ตลาดนัดจตุจักร',
    lat: 13.7999,
    long: 100.5498,
    image: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/chatuchak-w1800h1360.jpg',
    description: 'ตลาดกลางแจ้งที่ใหญ่ที่สุดในโลก มีร้านค้ากว่า 15,000 ร้านบนพื้นที่ 35 เอเคอร์ ตั้งแต่เสื้อผ้าวินเทจถึงสัตว์เลี้ยง ของเก่าถึงอาหารริมทาง หลงทางในเขาวงกตช้อปปิ้งตำนาน',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.5,
    distance: '~10 กม.',
    tags: ['ตลาด', 'วัฒนธรรม']
  },
  {
    id: 'bkk_10',
    name: 'ไอคอนสยาม',
    lat: 13.7262,
    long: 100.5107,
    image: 'https://www.airportels.asia/wp-content/uploads/2023/08/shutterstock_1416988205-edited.jpg',
    description: 'ห้างสรรพสินค้าริมแม่น้ำอันงดงาม มีตลาดน้ำในร่ม แบรนด์หรู และวิวแม่น้ำสุดประทับใจ สัมผัสมรดกไทยและความหรูหราทันสมัยในจุดหมายเดียว',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.7,
    distance: '~5 กม.',
    tags: ['ตลาด', 'วัฒนธรรม']
  },
  {
    id: 'bkk_11',
    name: 'ล้ง 1919',
    lat: 13.7267,
    long: 100.5033,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/6d/55/86/lhong-1919.jpg?w=1200&h=-1&s=1',
    description: 'คฤหาสน์และท่าเรือจีนศตวรรษที่ 19 ที่ได้รับการบูรณะอย่างสวยงาม มีจิตรกรรมฝาผนัง ร้านงานฝีมือ และร้านอาหารริมแม่น้ำ แหล่งมรดกซ่อนเร้นที่ให้เห็นอดีตการค้าของกรุงเทพฯ',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.5,
    distance: '~5.5 กม.',
    tags: ['วัฒนธรรม', 'ตลาด']
  },
  {
    id: 'bkk_12',
    name: 'เยาวราช (ไชน่าทาวน์)',
    lat: 13.7407,
    long: 100.5100,
    image: 'https://www.siamguides.com/wp-content/uploads/2024/05/yaowarat-road-chinatown-bangkok-thailand-2.jpg',
    description: 'ไชน่าทาวน์กรุงเทพฯ มีชีวิตชีวายามค่ำด้วยร้านอาหารริมทางตำนาน ลองซุปรังนก เป็ดย่าง และอาหารทะเลสด สำรวจประตูมังกรทองและตึกแถวเก่าแก่',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.6,
    distance: '~4 กม.',
    tags: ['ตลาด', 'วัฒนธรรม']
  }
];

// ============================================
// PHUKET PLACES - สถานที่ลับ & ชายหาด
// ============================================
export const phuketPlaces: TravelPlace[] = [
  {
    id: 'pkt_1',
    name: 'เมืองเก่าภูเก็ต',
    lat: 7.8857,
    long: 98.3876,
    image: 'https://phuket.intercontinental.com/sites/phuket/files/styles/hero_banner_1920_810/public/2025-05/shutterstock_1283102005%20%281%29.jpg.webp?itok=thnxpXhU',
    description: 'ย่านมรดกชิโน-โปรตุกีสมีเสน่ห์ มีตึกแถวสีสันสดใส คาเฟ่เก๋ สตรีทอาร์ต และโรงแรมบูติก สำรวจสถาปัตยกรรมถนนถลางที่ย้อนไปถึงยุคเหมืองแร่ดีบุก',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.7,
    distance: '~3 กม.',
    tags: ['วัฒนธรรม', 'ตลาด']
  },
  {
    id: 'pkt_2',
    name: 'วัดไชยธาราราม (วัดฉลอง)',
    lat: 7.8467,
    long: 98.3367,
    image: 'https://blog.bangkokair.com/wp-content/uploads/2025/05/Cover_wat-chalong-temple-phuket.jpg',
    description: 'วัดพุทธที่สำคัญที่สุดของภูเก็ต มีพระมหาธาตุสามชั้นประดิษฐานพระบรมสารีริกธาตุ วิหารตกแต่งสวยงามด้วยจิตรกรรมฝาผนังเล่าเรื่องพระพุทธประวัติ',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~8 กม.',
    tags: ['วัฒนธรรม']
  },
  {
    id: 'pkt_3',
    name: 'พระใหญ่ภูเก็ต',
    lat: 7.8275,
    long: 98.3131,
    image: 'https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/292/2025/04/17025402/Big-Buddha-Phuket.jpg',
    description: 'พระพุทธรูปหินอ่อนขาวสูง 45 เมตรบนยอดเขานาคเกิด ชมวิวพาโนรามา 360 องศาของเกาะ กระดิ่งลมสร้างบรรยากาศสงบที่สถานที่สำคัญนี้',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.8,
    distance: '~12 กม.',
    tags: ['วัฒนธรรม', 'ธรรมชาติ']
  },
  {
    id: 'pkt_4',
    name: 'แหลมพรหมเทพ',
    lat: 7.7589,
    long: 98.3035,
    image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/ce4d3310ef916e2be7cdf0884f4d81e58619fc9f-1600x1066.jpg',
    description: 'จุดชมพระอาทิตย์ตกที่โด่งดังที่สุดของภูเก็ตที่ปลายเกาะทางใต้ ชมดวงอาทิตย์จมลงสู่ทะเลอันดามันจากหน้าผาสูงชัน มีประภาคารและศาลเจ้า',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.7,
    distance: '~20 กม.',
    tags: ['ธรรมชาติ', 'วัฒนธรรม']
  },
  {
    id: 'pkt_5',
    name: 'หาดในหาน',
    lat: 7.7700,
    long: 98.3033,
    image: 'https://cdn.prod.website-files.com/650bafc1a2425df702884d05/65e6cea3a13348b5f81718d4_nai-harn-beach.png',
    description: 'หาดโปรดของคนท้องถิ่น น้ำใสแจ๋ว นักท่องเที่ยวน้อยกว่า ล้อมรอบด้วยเนินเขา มีลากูนเงียบสงบด้านหลัง เหมาะสำหรับว่ายน้ำและบรรยากาศชายหาดไทยแท้',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~18 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'pkt_6',
    name: 'หาดฟรีดอม',
    lat: 7.8958,
    long: 98.2722,
    image: 'https://content.phuket101.net/wp-content/uploads/20250121213902/freedom-beach-Phuket-1.jpg',
    description: 'สวรรค์ซ่อนเร้นไปได้โดยเรือหางยาวหรือเดินป่าเท่านั้น หาดทรายขาวบริสุทธิ์ น้ำสีฟ้าเทอควอยซ์ และหน้าผาปกคลุมด้วยป่า สร้างการหลบหนีสู่เขตร้อนที่ไม่ถูกแตะต้อง',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.8,
    distance: '~15 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'pkt_7',
    name: 'หาดบานาน่า',
    lat: 7.9803,
    long: 98.2847,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/c0/a3/79/banana-beach.jpg?w=1200&h=-1&s=1',
    description: 'อ่าวลับไปถึงโดยทางเดินป่าชัน ตอบแทนนักผจญภัยด้วยหาดทรายบริสุทธิ์ น้ำดำน้ำดูปะการังใส และร้านอาหารริมหาดเสิร์ฟอาหารทะเลสด',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.5,
    distance: '~22 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'pkt_8',
    name: 'จุดชมวิวกะรน',
    lat: 7.8167,
    long: 98.3000,
    image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/72fe06a765513c2d68642a38ff72aafb2488092c-1600x1066.jpg',
    description: 'จุดชมวิวสวยงามมองเห็นสามอ่าว - กะตะน้อย กะตะ และกะรน หนึ่งในสถานที่ถ่ายรูปมากที่สุดของภูเก็ต มีทิวทัศน์ชายฝั่งดราม่า',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~16 กม.',
    tags: ['ธรรมชาติ']
  },
  {
    id: 'pkt_9',
    name: 'อ่าวพังงา',
    lat: 8.2750,
    long: 98.5000,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ko_Tapu_Phang_Nga_Bay.jpg/1280px-Ko_Tapu_Phang_Nga_Bay.jpg',
    description: 'อ่าวสุดอลังการ มีชื่อเสียงจากเขาหินปูนดราม่าที่โผล่จากน้ำสีมรกต สำรวจถ้ำทะเลด้วยเรือคายัค เยือนเกาะเจมส์ บอนด์ และค้นพบลากูนซ่อนเร้น',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.9,
    distance: '~25 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
  },
  {
    id: 'pkt_10',
    name: 'ตลาดนัดภูเก็ต',
    lat: 7.8842,
    long: 98.3917,
    image: 'https://www.aleenta.com/wp-content/uploads/2022/03/Why_is_Phang_Nga_Bay_Famous.jpg',
    description: 'ตลาดกลางคืนท้องถิ่นแท้จริง มีอาหารริมทางไทย ดนตรีสด และช้อปปิ้งราคาถูก สัมผัสวัฒนธรรมภูเก็ตจริงๆ ห่างจากพื้นที่นักท่องเที่ยว ทุกวันเสาร์และอาทิตย์',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.4,
    distance: '~5 กม.',
    tags: ['ตลาด', 'วัฒนธรรม']
  },
  {
    id: 'pkt_11',
    name: 'ตลาดอาหารทะเลราไวย์',
    lat: 7.7767,
    long: 98.3278,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/60/7c/0e/caption.jpg?w=900&h=500&s=1',
    description: 'ตลาดอาหารทะเลสดจากเรือ ที่คนท้องถิ่นซื้อปลา เลือกปลา กุ้ง หรือกุ้งมังกร แล้วให้ร้านอาหารข้างๆ ทำให้ แท้จริงและราคาย่อมเยา!',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.5,
    distance: '~17 กม.',
    tags: ['ตลาด', 'วัฒนธรรม']
  },
  {
    id: 'pkt_12',
    name: 'อุทยานแห่งชาติสิรินาถ',
    lat: 8.1167,
    long: 98.3000,
    image: 'https://www.thainationalparks.com/img/poi/2019/10/04/384098/sirinat-national-park-beach-w-900.jpg',
    description: 'อุทยานทางทะเลที่มีชายหาดบริสุทธิ์ ป่าชายเลน และแหล่งวางไข่เต่าทะเล ดูเครื่องบินลงจอดใกล้มากที่หาดไม้ขาว สวรรค์ของคนรักธรรมชาติ',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.6,
    distance: '~30 กม.',
    tags: ['ธรรมชาติ', 'อากาศดี']
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
// REWARDS (keeping in Thai context)
// ============================================
export const rewards: Reward[] = [
  // Chiang Mai Rewards
  {
    id: 'rw_1',
    name: 'ลด 20% ที่ข้าวซอยแม่ไสย',
    description: 'ลิ้มรสอาหารเหนือแท้ๆ พร้อมส่วนลด 20% ทั้งบิล',
    image: 'https://www.mytravelbuzzg.com/wp-content/uploads/Khao-Soi-Mae-Sai-Restaurant-e1693473350860.jpg',
    coinCost: 50,
    category: 'food',
    discountCode: 'YEEP20KHAO',
    validUntil: '2026-12-31',
    location: 'ถนนนิมมานเหมินท์, เชียงใหม่',
    originalPrice: '150 บาท'
  },
  {
    id: 'rw_2',
    name: 'กาแฟฟรีที่วัน นิมมาน',
    description: 'แลกรับกาแฟพิเศษฟรีที่คาเฟ่ที่ร่วมรายการใน One Nimman',
    image: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg',
    coinCost: 30,
    category: 'food',
    discountCode: 'YEEPFREE',
    validUntil: '2026-12-31',
    location: 'วัน นิมมาน, เชียงใหม่'
  },
  {
    id: 'rw_3',
    name: 'ทัวร์ฟาร์มจินเจอร์',
    description: 'ลด 50% ทัวร์ฟาร์มออร์แกนิก รวมอาหารกลางวันและกิจกรรม',
    image: 'https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg',
    coinCost: 100,
    category: 'experience',
    discountCode: 'YEEPFARM50',
    validUntil: '2026-12-31',
    location: 'Ginger Farm, แม่วาง',
    originalPrice: '800 บาท'
  },
  {
    id: 'rw_4',
    name: 'คลาสนั่งสมาธิวัดอุโมงค์',
    description: 'คลาสนั่งสมาธิพร้อมผู้นำฟรีที่อุโมงค์วัดโบราณ',
    image: 'https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg',
    coinCost: 80,
    category: 'experience',
    discountCode: 'YEEPZEN',
    validUntil: '2026-12-31',
    location: 'วัดอุโมงค์, สุเทพ'
  },
  {
    id: 'rw_5',
    name: 'คูปองตลาดกลางคืน Think Park',
    description: 'บัตรกำนัลช้อปปิ้ง 100 บาท สำหรับงานฝีมือและสินค้าท้องถิ่น',
    image: 'https://changpuakmagazine.com/images/article/182925ArticleThumpnai_September2018-07-07_resize.jpg',
    coinCost: 40,
    category: 'souvenir',
    discountCode: 'YEEPCRAFT',
    validUntil: '2026-12-31',
    location: 'Think Park, นิมมาน'
  },
  {
    id: 'rw_6',
    name: 'เช่าจักรยานราชพฤกษ์',
    description: 'เช่าจักรยานฟรี 2 ชั่วโมงที่อุทยานหลวงราชพฤกษ์',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg',
    coinCost: 25,
    category: 'experience',
    discountCode: 'YEEPBIKE',
    validUntil: '2026-12-31',
    location: 'ศูนย์วิจัยเกษตรหลวง'
  },
  {
    id: 'rw_7',
    name: 'สุกี้ช้างเผือกพิเศษ',
    description: 'ท็อปปิ้งเนื้อฟรีเมื่อสั่งสุกี้',
    image: 'https://d13q9rhbndrrl0.cloudfront.net/posts/none/2021/8/1640512803955-655157687290318600.jpeg',
    coinCost: 20,
    category: 'food',
    discountCode: 'YEEPSUKI',
    validUntil: '2026-12-31',
    location: 'ตลาดช้างเผือก'
  },
  {
    id: 'rw_8',
    name: 'เซ็ตปิกนิกอ่างแก้วยามเย็น',
    description: 'เช่าตะกร้าปิกนิกพร้อมขนมท้องถิ่นสำหรับชมพระอาทิตย์ตก',
    image: 'https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg',
    coinCost: 60,
    category: 'experience',
    discountCode: 'YEEPPICNIC',
    validUntil: '2026-12-31',
    location: 'อ่างแก้ว, มช.'
  },
  // Bangkok Rewards
  {
    id: 'rw_9',
    name: 'ล่องเรือชมพระอาทิตย์ตกวัดอรุณ',
    description: 'ลด 50% ล่องเรือดินเนอร์ริมแม่น้ำชมวิววัดอรุณสวยงาม',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Wat_Arun%2C_Bangkok%2C_Thailand_%28I%29.jpg/1280px-Wat_Arun%2C_Bangkok%2C_Thailand_%28I%29.jpg',
    coinCost: 120,
    category: 'experience',
    discountCode: 'YEEPSUNSET',
    validUntil: '2026-12-31',
    location: 'แม่น้ำเจ้าพระยา, กรุงเทพฯ',
    originalPrice: '1,500 บาท'
  },
  {
    id: 'rw_10',
    name: 'ทัวร์ตลาดจตุจักร',
    description: 'ทัวร์เดินชมตลาดสุดสัปดาห์ตำนานกรุงเทพฯ ฟรี',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Chatuchak_Weekend_Market_overview.jpg/1280px-Chatuchak_Weekend_Market_overview.jpg',
    coinCost: 75,
    category: 'experience',
    discountCode: 'YEEPJJ',
    validUntil: '2026-12-31',
    location: 'ตลาดนัดจตุจักร, กรุงเทพฯ'
  },
  {
    id: 'rw_11',
    name: 'ทริปอาหารริมทางเยาวราช',
    description: 'บัตรกำนัล 100 บาท สำหรับร้านอาหารริมทางที่ดีที่สุดในไชน่าทาวน์',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bangkok_Yaowarat_Road.jpg/1280px-Bangkok_Yaowarat_Road.jpg',
    coinCost: 45,
    category: 'food',
    discountCode: 'YEEPCHINATOWN',
    validUntil: '2026-12-31',
    location: 'ถนนเยาวราช, กรุงเทพฯ'
  },
  {
    id: 'rw_12',
    name: 'เรือถีบสวนลุมพินี',
    description: 'เช่าเรือถีบหงส์ฟรี 1 ชั่วโมงที่สวนลุมพินี',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lumpini_Park_Bangkok.jpg/1280px-Lumpini_Park_Bangkok.jpg',
    coinCost: 35,
    category: 'experience',
    discountCode: 'YEEPPEDAL',
    validUntil: '2026-12-31',
    location: 'สวนลุมพินี, กรุงเทพฯ'
  },
  {
    id: 'rw_13',
    name: 'ผจญภัยจักรยานบางกะเจ้า',
    description: 'เช่าจักรยานครึ่งวันพร้อมแผนที่นำทางปอดกรุงเทพฯ',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bang_Krachao_aerial_view.jpg/1280px-Bang_Krachao_aerial_view.jpg',
    coinCost: 50,
    category: 'experience',
    discountCode: 'YEEPGREEN',
    validUntil: '2026-12-31',
    location: 'บางกะเจ้า, กรุงเทพฯ'
  },
  // Phuket Rewards
  {
    id: 'rw_14',
    name: 'ทัวร์เดินเมืองเก่าภูเก็ต',
    description: 'ทัวร์เดินมรดก 2 ชั่วโมงพร้อมไกด์ท้องถิ่น ฟรี',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Soi_Rommanee%2C_Phuket_Town.jpg/1280px-Soi_Rommanee%2C_Phuket_Town.jpg',
    coinCost: 65,
    category: 'experience',
    discountCode: 'YEEPOLDTOWN',
    validUntil: '2026-12-31',
    location: 'ถนนถลาง, เมืองเก่าภูเก็ต'
  },
  {
    id: 'rw_15',
    name: 'ดินเนอร์พระอาทิตย์ตกแหลมพรหมเทพ',
    description: 'ลด 20% ดินเนอร์อาหารทะเลที่ร้านบนหน้าผา',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Promthep_Cape.jpg/1280px-Promthep_Cape.jpg',
    coinCost: 80,
    category: 'food',
    discountCode: 'YEEPCLIFF',
    validUntil: '2026-12-31',
    location: 'แหลมพรหมเทพ, ภูเก็ต',
    originalPrice: '800 บาท'
  },
  {
    id: 'rw_16',
    name: 'ทัวร์พายเรืออ่าวพังงา',
    description: 'ลด 25% ทัวร์พายเรือคายัคเต็มวันผ่านถ้ำหินปูน',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ko_Tapu_Phang_Nga_Bay.jpg/1280px-Ko_Tapu_Phang_Nga_Bay.jpg',
    coinCost: 150,
    category: 'experience',
    discountCode: 'YEEPKAYAK',
    validUntil: '2026-12-31',
    location: 'อ่าวพังงา',
    originalPrice: '2,500 บาท'
  },
  {
    id: 'rw_17',
    name: 'ปาร์ตี้อาหารทะเลราไวย์',
    description: 'อัพเกรดกุ้งมังกรฟรีเมื่อสั่งเซ็ตอาหารทะเล',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Rawai_Beach.jpg/1280px-Rawai_Beach.jpg',
    coinCost: 70,
    category: 'food',
    discountCode: 'YEEPLOBSTER',
    validUntil: '2026-12-31',
    location: 'ตลาดอาหารทะเลราไวย์, ภูเก็ต'
  },
  {
    id: 'rw_18',
    name: 'คลาสนั่งสมาธิพระใหญ่',
    description: 'คลาสนั่งสมาธิตอนเช้าฟรี พร้อมวิวพาโนรามา',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Big_Buddha_Phuket.jpg/1280px-Big_Buddha_Phuket.jpg',
    coinCost: 55,
    category: 'experience',
    discountCode: 'YEEPBUDDHA',
    validUntil: '2026-12-31',
    location: 'พระใหญ่, เขานาคเกิด, ภูเก็ต'
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
