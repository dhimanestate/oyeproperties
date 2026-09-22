/**
 * Comprehensive Geographic & Indian Market Directory
 * Includes all Indian States & Union Territories, major Tier-1, Tier-2 & Tier-3 cities,
 * with exhaustive coverage of NCR & Faridabad sectors.
 */

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

// All major Indian cities categorized by popularity and state
export const ALL_INDIAN_CITIES = [
  'Faridabad',
  'Delhi NCR',
  'Gurgaon (Gurugram)',
  'Noida',
  'Greater Noida',
  'Ghaziabad',
  'Mumbai',
  'Navi Mumbai',
  'Thane',
  'Pune',
  'Bangalore (Bengaluru)',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Chandigarh',
  'Panchkula',
  'Mohali',
  'Jaipur',
  'Udaipur',
  'Jodhpur',
  'Lucknow',
  'Kanpur',
  'Agra',
  'Varanasi',
  'Prayagraj',
  'Dehradun',
  'Haridwar',
  'Rishikesh',
  'Shimla',
  'Bhopal',
  'Indore',
  'Gwalior',
  'Patna',
  'Ranchi',
  'Jamshedpur',
  'Bhubaneswar',
  'Cuttack',
  'Kochi (Cochin)',
  'Thiruvananthapuram',
  'Kozhikode',
  'Coimbatore',
  'Madurai',
  'Mysore (Mysuru)',
  'Mangalore',
  'Visakhapatnam',
  'Vijayawada',
  'Guntur',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Goa',
  'Panaji',
  'Amritsar',
  'Ludhiana',
  'Jalandhar',
  'Rohtak',
  'Panipat',
  'Karnal',
  'Sonipat',
  'Hisar',
  'Ambala',
  'Meerut',
  'Mathura',
  'Aligarh',
  'Bareilly',
  'Moradabad',
  'Raipur',
  'Bilaspur',
  'Jabalpur',
  'Kota',
  'Ajmer',
  'Bikaner',
  'Guwahati',
  'Shillong',
  'Dubai',
  'London'
];

// Comprehensive sector and locality list for Faridabad (Sectors 1 to 150+ and prime hubs)
export const FARIDABAD_SECTORS_AND_AREAS = [
  'Neharpar (Greater Faridabad)',
  'Surajkund Road',
  'Mathura Road (NH-19)',
  'Greenfield Colony',
  'Charmwood Village',
  'Sainik Colony',
  'Ashoka Enclave',
  'NIT Faridabad (NIT 1 to 5)',
  'Old Faridabad',
  'Ballabhgarh',
  'Badkhal Lake Road',
  'Dayal Bagh',
  'Pali Hills / Crusher Zone Road',
  'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5',
  'Sector 6', 'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10',
  'Sector 11', 'Sector 12', 'Sector 13', 'Sector 14', 'Sector 15', 'Sector 15A',
  'Sector 16', 'Sector 16A', 'Sector 17', 'Sector 18', 'Sector 19', 'Sector 20',
  'Sector 21A', 'Sector 21B', 'Sector 21C', 'Sector 21D',
  'Sector 22', 'Sector 23', 'Sector 24', 'Sector 25', 'Sector 26', 'Sector 27A', 'Sector 27B', 'Sector 27C', 'Sector 27D',
  'Sector 28', 'Sector 29', 'Sector 30', 'Sector 31', 'Sector 32', 'Sector 33',
  'Sector 34', 'Sector 35', 'Sector 36', 'Sector 37', 'Sector 38', 'Sector 39',
  'Sector 41', 'Sector 42', 'Sector 43', 'Sector 44', 'Sector 45', 'Sector 46',
  'Sector 47', 'Sector 48', 'Sector 49', 'Sector 50', 'Sector 51', 'Sector 52',
  'Sector 53', 'Sector 54', 'Sector 55', 'Sector 56', 'Sector 56A', 'Sector 57',
  'Sector 58', 'Sector 59', 'Sector 62', 'Sector 63', 'Sector 64', 'Sector 65',
  'Sector 70', 'Sector 75', 'Sector 76', 'Sector 77', 'Sector 78', 'Sector 79',
  'Sector 80', 'Sector 81', 'Sector 82', 'Sector 83', 'Sector 84', 'Sector 85',
  'Sector 86', 'Sector 87', 'Sector 88', 'Sector 89', 'Sector 90', 'Sector 91',
  'Sector 97', 'Sector 98', 'Sector 143', 'Sector 144'
];

// Major prominent localities for top cities
export const POPULAR_CITY_AREAS = {
  'Faridabad': FARIDABAD_SECTORS_AND_AREAS,
  'Delhi NCR': [
    'Golf Course Road, Gurgaon', 'DLF Phase 1-5, Gurgaon', 'Golf Course Extn Road', 'Sohna Road', 'Cyber City', 'Dwarka Expressway',
    'South Delhi (Greater Kailash, Vasant Vihar, Defence Colony)', 'Chanakyapuri', 'Jor Bagh', 'Golf Links', 'Sundar Nagar',
    'Noida Expressway', 'Sector 150 Noida', 'Sector 44 Noida', 'Greater Noida West', 'Indirapuram Ghaziabad'
  ],
  'Gurgaon (Gurugram)': [
    'DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4', 'DLF Phase 5',
    'Golf Course Road (The Camellias, Magnolias, Aralias)', 'Golf Course Extension Road',
    'Sohna Road', 'Dwarka Expressway (Sector 102-113)', 'Southern Peripheral Road (SPR)',
    'Sector 48', 'Sector 54', 'Sector 56', 'Sector 57', 'Sector 65', 'Sector 67', 'Nirvana Country'
  ],
  'Noida': [
    'Sector 15A', 'Sector 44', 'Sector 50', 'Sector 93A', 'Sector 128 (Jaypee Wish Town)',
    'Sector 137', 'Sector 143', 'Sector 150 (Sports City)', 'Noida Expressway'
  ],
  'Mumbai': [
    'Worli Sea Face', 'Bandra West (Pali Hill, Carter Road)', 'Juhu Beach', 'Cuffe Parade', 'Nariman Point', 'Malabar Hill',
    'Altamount Road', 'Lower Parel', 'Prabhadevi', 'Powai', 'Versova', 'BKC (Bandra Kurla Complex)', 'Khar West', 'Santacruz West'
  ],
  'Dubai': [
    'Palm Jumeirah', 'Downtown Dubai (Burj Khalifa)', 'Dubai Marina', 'Emirates Hills', 'Dubai Hills Estate', 'Business Bay', 'Jumeirah Bay Island', 'Bluewaters'
  ],
  'Goa': [
    'Assagao', 'Anjuna', 'Candolim', 'Calangute', 'Siolim', 'Vagator', 'Morjim', 'Dona Paula', 'Reis Magos', 'Aldona'
  ],
  'Bangalore (Bengaluru)': [
    'Indiranagar', 'Koramangala', 'Sadashivanagar', 'Lavelle Road', 'Whitefield', 'Prestige Golfshire (Nandi Hills)', 'HSR Layout', 'Sarjapur Road'
  ],
  'Hyderabad': [
    'Jubilee Hills', 'Banjara Hills', 'Hitec City', 'Gachibowli', 'Financial District', 'Madhapur', 'Kokapet'
  ],
  'Pune': [
    'Koregaon Park', 'Kalyani Nagar', 'Boat Club Road', 'Baner', 'Aundh', 'Viman Nagar', 'Senapati Bapat Road'
  ]
};

// Standard property types with Builder Floor
export const PROPERTY_TYPES_CATALOGUE = [
  'Apartment',
  'Builder Floor',
  'Penthouse',
  'Luxury Villa',
  'Duplex',
  'Row House',
  'Studio',
  'Commercial Space',
  'Plot / Land'
];

// Builder floor specific levels
export const BUILDER_FLOOR_LEVELS = [
  { id: 'ground', label: 'Ground Floor (with Lawn / Garden)', defaultPriceFactor: 1.05 },
  { id: 'first', label: '1st Floor', defaultPriceFactor: 1.0 },
  { id: 'second', label: '2nd Floor', defaultPriceFactor: 0.98 },
  { id: 'third', label: '3rd Floor', defaultPriceFactor: 0.95 },
  { id: 'fourth_terrace', label: '4th Floor (with Private Roof Terrace)', defaultPriceFactor: 1.15 },
  { id: 'stilt', label: 'Stilt Parking + Service Floor', defaultPriceFactor: 0.8 }
];
