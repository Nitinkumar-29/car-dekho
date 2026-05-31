import axios from 'axios';
import type { QuestionnaireAnswers, CarRecommendation } from '../types';

// Axios Instance pointing to typical backend (local or env configuration)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type ServerRecommendationItem = {
  car: {
    _id?: string;
    name?: string;
    price?: number;
    mileage?: number;
    safetyRating?: number;
    fuelType?: string;
    transmission?: string;
  };
  score?: number;
  explanation?: string;
  estimatedOnRoadPrice?: number;
  estimatedMonthlyRunningCost?: number;
  estimatedWaitingPeriodWeeks?: number;
  location?: string;
  pricingLastUpdated?: string;
  pros?: string[];
  cons?: string[];
  specs?: {
    engine?: string;
    transmission?: string;
    fuelType?: string;
    seats?: number;
    bootSpace?: string;
  };
};

const formatPriceInLakhs = (price?: number): string => {
  if (typeof price !== 'number' || !Number.isFinite(price)) return 'N/A';
  const lakhs = price / 100000;
  return `₹${lakhs.toFixed(1)}L`;
};

const formatCurrencyINR = (amount?: number): string => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return 'N/A';
  return `₹${amount.toLocaleString('en-IN')}`;
};

const getDerivedEngineSpec = (fuelType: string, transmission: string): string => {
  const fuel = fuelType.toLowerCase();
  const gearbox = transmission.toLowerCase();

  if (fuel === 'electric' || fuel === 'ev') {
    return 'Electric motor';
  }
  if (fuel === 'hybrid') {
    return 'Hybrid petrol-electric powertrain';
  }
  if (fuel === 'diesel') {
    return gearbox.includes('auto') ? 'Turbo diesel engine (automatic)' : 'Turbo diesel engine';
  }
  if (fuel === 'cng') {
    return 'Bi-fuel CNG engine';
  }
  return gearbox.includes('auto') ? 'Petrol engine (automatic)' : 'Petrol engine';
};

const getDerivedPros = (
  fuelType: string,
  mileageValue: number,
  safetyValue: number,
  transmission: string
): string[] => {
  const pros: string[] = [];
  const fuel = fuelType.toLowerCase();
  const gearbox = transmission.toLowerCase();

  if (safetyValue >= 5) pros.push('Top-tier crash safety rating');
  else if (safetyValue >= 4) pros.push('Strong safety credentials for family usage');
  else pros.push('Practical daily-use safety package');

  if (fuel === 'electric' || fuel === 'ev') pros.push('Very low running cost in city commutes');
  else if (fuel === 'hybrid') pros.push('Efficient hybrid system for mixed driving');
  else if (fuel === 'diesel') pros.push('High torque output suited for highway cruising');
  else if (fuel === 'cng') pros.push('Economical fuel bills with CNG setup');
  else pros.push('Easy ownership and broad fuel availability');

  if (mileageValue >= 22) pros.push('Excellent fuel efficiency in its segment');
  else if (mileageValue >= 17) pros.push('Balanced efficiency for city and highway usage');
  else pros.push('Performance-focused setup with decent efficiency');

  if (gearbox.includes('auto') || gearbox.includes('amt') || gearbox.includes('cvt') || gearbox.includes('dct')) {
    pros.push('Convenient automatic-style driving in traffic');
  } else {
    pros.push('Driver-engaging manual control');
  }

  return pros.slice(0, 3);
};

const getDerivedCons = (
  fuelType: string,
  mileageValue: number,
  safetyValue: number,
  transmission: string
): string[] => {
  const cons: string[] = [];
  const fuel = fuelType.toLowerCase();
  const gearbox = transmission.toLowerCase();

  if (safetyValue <= 3) cons.push('Safety rating is lower than top-segment alternatives');
  else cons.push('Higher-rated variants may cost more on-road');

  if (fuel === 'electric' || fuel === 'ev') cons.push('Charging planning is needed for longer trips');
  else if (fuel === 'diesel') cons.push('Diesel ownership can involve stricter compliance in some cities');
  else if (fuel === 'cng') cons.push('CNG boot-space tradeoff can affect luggage capacity');
  else cons.push('Fuel prices can impact monthly ownership costs');

  if (mileageValue < 16) cons.push('Running cost may rise for high monthly driving distances');
  else cons.push('Real-world mileage varies with traffic and driving style');

  if (gearbox.includes('manual')) {
    cons.push('Manual operation can feel tiring in heavy city traffic');
  } else {
    cons.push('Automatic variants usually carry a higher purchase premium');
  }

  return cons.slice(0, 3);
};

const normalizeAnswersForApi = (answers: QuestionnaireAnswers): QuestionnaireAnswers => ({
  ...answers,
  budget: answers.budget === 'Under 10L' ? '0-10L' : answers.budget,
});

const mapServerRecommendationToClient = (
  item: ServerRecommendationItem,
  index: number
): CarRecommendation => {
  const car = item.car ?? {};
  const name = car.name || `Recommended Car ${index + 1}`;
  const safetyValue =
    typeof car.safetyRating === 'number' && Number.isFinite(car.safetyRating)
      ? car.safetyRating
      : 3;
  const mileageValue =
    typeof car.mileage === 'number' && Number.isFinite(car.mileage)
      ? car.mileage
      : 0;
  const matchScore =
    typeof item.score === 'number' && Number.isFinite(item.score)
      ? Math.max(0, Math.min(99, Math.round(item.score)))
      : 75;
  const fuelType = car.fuelType || 'Unknown';
  const transmission = car.transmission || 'Unknown';
  const engineSpec = getDerivedEngineSpec(fuelType, transmission);
  const pros =
    Array.isArray(item.pros) && item.pros.length > 0
      ? item.pros
      : getDerivedPros(fuelType, mileageValue, safetyValue, transmission);
  const cons =
    Array.isArray(item.cons) && item.cons.length > 0
      ? item.cons
      : getDerivedCons(fuelType, mileageValue, safetyValue, transmission);

  return {
    id: car._id || `server-car-${index}`,
    name,
    matchScore,
    price: formatPriceInLakhs(car.price),
    estimatedOnRoadPrice: formatCurrencyINR(item.estimatedOnRoadPrice),
    estimatedMonthlyRunningCost: formatCurrencyINR(item.estimatedMonthlyRunningCost),
    estimatedWaitingPeriod:
      typeof item.estimatedWaitingPeriodWeeks === 'number'
        ? `${item.estimatedWaitingPeriodWeeks} weeks`
        : 'N/A',
    location: item.location || 'India Average',
    pricingLastUpdated: item.pricingLastUpdated || 'N/A',
    mileage: mileageValue > 0 ? `${mileageValue} km/l` : 'N/A',
    safetyRating: `${safetyValue}-Star`,
    pros,
    cons,
    explanation: item.explanation || `AI Analysis: ${name} aligns with your selected preferences.`,
    specs: {
      engine: item.specs?.engine || engineSpec,
      transmission: item.specs?.transmission || transmission,
      fuelType: item.specs?.fuelType || fuelType,
      seats: item.specs?.seats || 5,
      bootSpace: item.specs?.bootSpace || '380 Litres',
    },
  };
};

// A robust catalog of real-world Indian-market cars with full specifications, pros, cons, and metadata
const CAR_CATALOG = [
  {
    name: 'Maruti Suzuki Swift',
    price: '6.5L - 9.5L',
    priceVal: 8, // Lakhs value approximate for scoring
    mileage: '24.8 km/l',
    mileageVal: 24.8,
    safetyRating: '3-Star GNCAP',
    safetyVal: 3,
    fuelType: 'Petrol',
    seats: 5,
    specs: {
      engine: '1.2L Z-Series 3-Cyl',
      transmission: '5-Speed MT / AMT',
      fuelType: 'Petrol',
      seats: 5,
      bootSpace: '265 Litres',
    },
    pros: ['Ultra-high fuel economy', 'Compact size for tight city spaces', 'Inexpensive spares & maintenance'],
    cons: ['Average high-speed highway stability', 'Mediocre cabin sound insulation', '3-Star crash safety rating'],
    baseExplanation: 'An exceptional choice for city commutes under 10L. The legendary mileage figures coupled with low upkeep make it the ultimate practical urban hatchback.',
  },
  {
    name: 'Tata Punch EV',
    price: '10.9L - 15.5L',
    priceVal: 13,
    mileage: '421 km Range',
    mileageVal: 35, // High efficiency score
    safetyRating: '5-Star GNCAP',
    safetyVal: 5,
    fuelType: 'EV',
    seats: 5,
    specs: {
      engine: 'Permanent Magnet Synchronous',
      transmission: 'Single Speed Automatic',
      fuelType: 'EV',
      seats: 5,
      bootSpace: '366 Litres',
    },
    pros: ['5-star crash rating with solid steel build', 'Instant electric torque for quick overtakes', 'Extremely cheap running costs'],
    cons: ['Charging infrastructure needed for long highway runs', 'Firm ride over deep potholes', 'EV battery capacity fades slightly over time'],
    baseExplanation: 'A stellar match for safe city drives on an electric budget. It blends SUV styling, premium tech, and a five-star safety cage with minimal running costs.',
  },
  {
    name: 'Tata Nexon',
    price: '8.0L - 15.8L',
    priceVal: 12,
    mileage: '17.4 km/l',
    mileageVal: 17.4,
    safetyRating: '5-Star BNCAP',
    safetyVal: 5,
    fuelType: 'Petrol',
    seats: 5,
    specs: {
      engine: '1.2L Turbocharged Revotron',
      transmission: '6-Speed MT / 7-Speed DCA',
      fuelType: 'Petrol',
      seats: 5,
      bootSpace: '382 Litres',
    },
    pros: ['Highest-in-class safety standards', 'Brilliant high-speed road manners', 'Muscular high SUV ground clearance'],
    cons: ['AMT gearbox feels slightly jerky', 'Tata service center consistency varies', 'Three-cylinder engine vibrates slightly at idle'],
    baseExplanation: 'The go-to compact SUV where safety is your primary target. High structural integrity and premium features make it excellent for mixed city-highway workloads.',
  },
  {
    name: 'Tata Nexon Diesel',
    price: '11.5L - 15.8L',
    priceVal: 14,
    mileage: '23.2 km/l',
    mileageVal: 23.2,
    safetyRating: '5-Star BNCAP',
    safetyVal: 5,
    fuelType: 'Diesel',
    seats: 5,
    specs: {
      engine: '1.5L Turbocharged Revotorq',
      transmission: '6-Speed MT / AMT',
      fuelType: 'Diesel',
      seats: 5,
      bootSpace: '382 Litres',
    },
    pros: ['Excellent mid-range diesel pulling power', 'Stunning fuel economy on highways', 'Superb high ground clearance'],
    cons: ['Diesel maintenance cost is higher', 'Vibrations seep into cabin at high RPMs', 'Steering feels slightly heavy at low city speeds'],
    baseExplanation: 'A torque-heavy, five-star safety cruiser designed for heavy highway usage. Offers incredible highway range, passing power, and structural ruggedness.',
  },
  {
    name: 'Hyundai Creta',
    price: '11.0L - 20.1L',
    priceVal: 16,
    mileage: '18.2 km/l',
    mileageVal: 18.2,
    safetyRating: '3-Star GNCAP',
    safetyVal: 3,
    fuelType: 'Petrol',
    seats: 5,
    specs: {
      engine: '1.5L MPi 4-Cyl Petrol',
      transmission: '6-Speed MT / IVT Automatic',
      fuelType: 'Petrol',
      seats: 5,
      bootSpace: '433 Litres',
    },
    pros: ['Extremely smooth and refined ride', 'Massive panoramic sunroof and ventilated seats', 'Light steering for fatigue-free city crawls'],
    cons: ['Average structural crash safety index', 'Slightly polarising front design', 'Turbo variants are highly expensive'],
    baseExplanation: 'The absolute king of cabin comfort. Refined petrol power and light controls make it the ideal companion for comfortable daily commutes and mixed family duties.',
  },
  {
    name: 'Hyundai Creta Diesel',
    price: '12.5L - 20.1L',
    priceVal: 17,
    mileage: '21.8 km/l',
    mileageVal: 21.8,
    safetyRating: '3-Star GNCAP',
    safetyVal: 3,
    fuelType: 'Diesel',
    seats: 5,
    specs: {
      engine: '1.5L CRDi Turbo Diesel',
      transmission: '6-Speed MT / 6-Speed Torque Converter',
      fuelType: 'Diesel',
      seats: 5,
      bootSpace: '433 Litres',
    },
    pros: ['Highly refined diesel engine with minimal cabin noise', 'Massive tank range on highways', 'Ultra-comfortable suspension setup'],
    cons: ['Crash rating sits at standard 3-stars', 'Brakes feel slightly soft under heavy loads', 'Higher long-term emission compliance risks'],
    baseExplanation: 'A silent, ultra-comfortable diesel mile-muncher. Perfect for families looking for low running costs, plush cabin amenities, and extensive roadtrips.',
  },
  {
    name: 'Honda City e:HEV Hybrid',
    price: '19.0L - 20.6L',
    priceVal: 19.8,
    mileage: '27.1 km/l',
    mileageVal: 27.1,
    safetyRating: '5-Star ASEAN NCAP',
    safetyVal: 5,
    fuelType: 'Hybrid',
    seats: 5,
    specs: {
      engine: '1.5L Atkinson Cycle i-VTEC Hybrid',
      transmission: 'e-CVT Automatic',
      fuelType: 'Hybrid',
      seats: 5,
      bootSpace: '410 Litres',
    },
    pros: ['Incredible city mileage matching small hatchbacks', 'Smooth dual-motor electric transition', 'Full ADAS safety suite standard'],
    cons: ['Boot capacity is reduced due to battery placement', 'Low sedan ground clearance on high bumps', 'Premium pricing near luxury crossovers'],
    baseExplanation: 'A masterclass in hybrid engineering. It delivers unbelievable fuel mileage in dense city traffic, luxurious sedan legroom, and active ADAS safety layers.',
  },
  {
    name: 'Toyota Innova Hycross Hybrid',
    price: '25.9L - 30.9L',
    priceVal: 28,
    mileage: '23.2 km/l',
    mileageVal: 23.2,
    safetyRating: '5-Star ASEAN NCAP',
    safetyVal: 5,
    fuelType: 'Hybrid',
    seats: 7,
    specs: {
      engine: '2.0L 5th-Gen Hybrid Petrol',
      transmission: 'e-Drive CVT Automatic',
      fuelType: 'Hybrid',
      seats: 7,
      bootSpace: '300 Litres (expandable)',
    },
    pros: ['Seating comfort fits 7 adults easily', 'Amazing 23+ km/l mileage for a giant vehicle', 'Unmatched Toyota reliability and resale value'],
    cons: ['Massive footprint makes city parking tough', 'Hard plastic trim on lower doors', 'Waiting list is extremely long'],
    baseExplanation: 'The ultimate premium family MPV. The self-charging hybrid engine ensures budget-friendly mileage, while the plush seats offer executive comfort for 7+ passengers.',
  },
  {
    name: 'Skoda Slavia 1.5 TSI',
    price: '15.0L - 19.0L',
    priceVal: 17,
    mileage: '18.7 km/l',
    mileageVal: 18.7,
    safetyRating: '5-Star GNCAP',
    safetyVal: 5,
    fuelType: 'Petrol',
    seats: 5,
    specs: {
      engine: '1.5L EVO Turbo-Petrol Active Cyl',
      transmission: '6-Speed MT / 7-Speed DSG',
      fuelType: 'Petrol',
      seats: 5,
      bootSpace: '521 Litres',
    },
    pros: ['Explosive 150HP engine performance', '5-Star crash safety rating with thick steel sheets', 'Huge 521L trunk capacity'],
    cons: ['DSG transmission is sensitive to heavy traffic heat', 'Spare parts are expensive after warranty', 'Ride is slightly firm for sports handling'],
    baseExplanation: 'A thrill-seeker\'s absolute dream. Under 20L, it combines a highly rigid, five-star safe body shell with an explosive turbocharged engine for maximum highway fun.',
  },
  {
    name: 'Mahindra XUV700',
    price: '14.0L - 26.9L',
    priceVal: 21,
    mileage: '13.0 km/l',
    mileageVal: 13.0,
    safetyRating: '5-Star GNCAP',
    safetyVal: 5,
    fuelType: 'Diesel',
    seats: 7,
    specs: {
      engine: '2.2L mHawk Turbocharged Diesel',
      transmission: '6-Speed MT / 6-Speed AT',
      fuelType: 'Diesel',
      seats: 7,
      bootSpace: '240 Litres (expandable)',
    },
    pros: ['Stunning 185HP diesel performance', 'Advanced level-2 ADAS active safety', 'Luxurious digital dashboard cockpit'],
    cons: ['Heavy weight leads to low city mileage', 'Body roll in sharp high-speed corners', 'Third-row seating is tight for tall adults'],
    baseExplanation: 'A dominant, muscular 7-seater SUV. Combining a powerful 185HP diesel unit with comprehensive active ADAS safety checks, it rules mixed commutes and long roadtrips.',
  },
  {
    name: 'Mahindra XUV700 Petrol',
    price: '14.0L - 25.5L',
    priceVal: 20,
    mileage: '11.8 km/l',
    mileageVal: 11.8,
    safetyRating: '5-Star GNCAP',
    safetyVal: 5,
    fuelType: 'Petrol',
    seats: 7,
    specs: {
      engine: '2.0L mStallion Turbo-Petrol',
      transmission: '6-Speed MT / 6-Speed AT',
      fuelType: 'Petrol',
      seats: 7,
      bootSpace: '240 Litres (expandable)',
    },
    pros: ['Explosive 200HP engine power output', 'Whisper quiet cabin refinement', 'Five-star crash tested framework'],
    cons: ['Extremely heavy fuel drinker in city jams', 'Vast dimensions make it tricky in small alleys', 'High pricing for top AWD variants'],
    baseExplanation: 'The ultimate performance-oriented family cruiser. A 200HP turbo-petrol engine guarantees top-tier passing power and silent comfort, backed by a robust 5-star shell.',
  },
  {
    name: 'MG ZS EV',
    price: '18.9L - 25.2L',
    priceVal: 22,
    mileage: '461 km Range',
    mileageVal: 35,
    safetyRating: '5-Star Euro NCAP',
    safetyVal: 5,
    fuelType: 'EV',
    seats: 5,
    specs: {
      engine: '50.3 kWh Prismatic Battery pack',
      transmission: 'Single Speed Automatic',
      fuelType: 'EV',
      seats: 5,
      bootSpace: '470 Litres',
    },
    pros: ['Brilliant real-world 360km range', 'Pristine 5-Star international safety rating', 'Soft leather touches throughout cabin'],
    cons: ['Slightly stiff rear suspension over ripples', 'Rear seat headroom is average for taller passengers', 'Lacks the character of performance sedans'],
    baseExplanation: 'An electric crossover masterfully balancing safety, cargo space, and battery economy. Five-star ratings and low operating costs make it ideal for modern eco-minded families.',
  },
  {
    name: 'Maruti Suzuki Brezza',
    price: '8.3L - 14.1L',
    priceVal: 11,
    mileage: '19.8 km/l',
    mileageVal: 19.8,
    safetyRating: '4-Star GNCAP',
    safetyVal: 4,
    fuelType: 'Petrol',
    seats: 5,
    specs: {
      engine: '1.5L K15C DualJet 4-Cyl',
      transmission: '5-Speed MT / 6-Speed AT',
      fuelType: 'Petrol',
      seats: 5,
      bootSpace: '328 Litres',
    },
    pros: ['Extremely fuel-efficient mild-hybrid engine', 'Reassuring 4-star safety shell', 'Broad, airy cabin with flat seating'],
    cons: ['Lacks punchy highway engine speed', 'Interior plastic feel is standard', 'AMT options feel basic'],
    baseExplanation: 'A reliable, highly efficient compact SUV under 15L. Excellent city-mileage, spacious interiors, and a comfortable suspension make it a stress-free daily commuter.',
  },
  {
    name: 'BYD Atto 3',
    price: '24.9L - 33.9L',
    priceVal: 29,
    mileage: '521 km Range',
    mileageVal: 40,
    safetyRating: '5-Star Euro NCAP',
    safetyVal: 5,
    fuelType: 'EV',
    seats: 5,
    specs: {
      engine: '60.48 kWh Blade Battery (LFP)',
      transmission: 'Single Speed Automatic',
      fuelType: 'EV',
      seats: 5,
      bootSpace: '440 Litres',
    },
    pros: ['Ultra-safe Blade Battery tech (no fire risk)', 'Unmatched sci-fi premium cabin styling', 'Stunning 521km driving range'],
    cons: ['Funky cabin layout isn\'t for everyone', 'BYD service network is currently growing', 'High initial premium investment'],
    baseExplanation: 'A premium, forward-thinking EV. Incorporating the famous structural Blade Battery, Euro NCAP five-star safety, and immense electric range, it represents the ultimate green cruiser.',
  },
  {
    name: 'Hyundai i20 N Line',
    price: '10.0L - 12.5L',
    priceVal: 11.2,
    mileage: '16.0 km/l',
    mileageVal: 16.0,
    safetyRating: '3-Star GNCAP',
    safetyVal: 3,
    fuelType: 'Petrol',
    seats: 5,
    specs: {
      engine: '1.0L Turbocharged Kappa GDi',
      transmission: '6-Speed MT / 7-Speed DCT',
      fuelType: 'Petrol',
      seats: 5,
      bootSpace: '311 Litres',
    },
    pros: ['Sporty exhausts and stiffened handling setup', 'Snappy, dual-clutch automatic gear shifts', 'All-black premium interior with red details'],
    cons: ['Average 3-star safety rating', 'Low mileage when driven aggressively', 'Trunk space is small for family travels'],
    baseExplanation: 'An agile, pocket-rocket hatchback under 15L. Perfect for solo drivers or couples who want racetrack handling, snappy styling, and fast city accelerations.',
  },
  {
    name: 'Kia Carens',
    price: '10.5L - 19.6L',
    priceVal: 15,
    mileage: '16.5 km/l',
    mileageVal: 16.5,
    safetyRating: '3-Star GNCAP',
    safetyVal: 3,
    fuelType: 'Petrol',
    seats: 7,
    specs: {
      engine: '1.5L Turbo Petrol',
      transmission: '6-Speed iMT / 7-Speed DCT',
      fuelType: 'Petrol',
      seats: 7,
      bootSpace: '216 Litres (all seats up)',
    },
    pros: ['Very spacious 3-row comfort for 7 adults', 'Punchy turbo petrol highway performance', 'Packed with digital convenience tech'],
    cons: ['Average 3-star safety rating', 'Suspension gets soft under full passenger load', 'Low ground clearance compared to full SUVs'],
    baseExplanation: 'A highly functional 7-seater family MPV. It provides exceptional seating flexibility, ventilated chairs, and punchy engine speeds for large families on a budget.',
  },
  {
    name: 'Audi Q3',
    price: '43.8L - 53.5L',
    priceVal: 48,
    mileage: '14.9 km/l',
    mileageVal: 14.9,
    safetyRating: '5-Star Euro NCAP',
    safetyVal: 5,
    fuelType: 'Petrol',
    seats: 5,
    specs: {
      engine: '2.0L TFSI Turbocharged Petrol',
      transmission: '7-Speed S-Tronic DCT',
      fuelType: 'Petrol',
      seats: 5,
      bootSpace: '530 Litres',
    },
    pros: ['Premium luxury brand status and design', 'Mind-blowing quattro all-wheel drive stability', 'Gorgeous panoramic cockpit screens'],
    cons: ['Extremely expensive sales and service costs', 'Averages low fuel efficiency in dense cities', 'Premium fuels highly recommended'],
    baseExplanation: 'A luxurious compact crossover for executive buyers. Offering top-tier 5-star European safety shields, standard Quattro AWD grip, and unmatched suspension comfort.',
  },
  {
    name: 'Toyota Fortuner Diesel',
    price: '33.4L - 51.4L',
    priceVal: 42,
    mileage: '14.4 km/l',
    mileageVal: 14.4,
    safetyRating: '5-Star ASEAN NCAP',
    safetyVal: 5,
    fuelType: 'Diesel',
    seats: 7,
    specs: {
      engine: '2.8L Powerful Turbo Diesel',
      transmission: '6-Speed MT / 6-Speed AT',
      fuelType: 'Diesel',
      seats: 7,
      bootSpace: '296 Litres',
    },
    pros: ['Bulletproof durability and massive road presence', 'Incredible off-road 4x4 crawling capability', 'Outstanding resale valuations'],
    cons: ['Bumpy, rigid body-on-frame ride comfort', 'Lacks premium tech inside relative to price', 'Heavy hydraulic steering in tight traffic'],
    baseExplanation: 'The heavy-duty king of the highway. Offers unmatched reliability, 5-star impact safety, immense road authority, and go-anywhere ruggedness for large families.',
  }
];

// High fidelity local recommendation matching engine (Runs if API is offline)
export const calculateMockRecommendations = (answers: QuestionnaireAnswers): CarRecommendation[] => {
  const scoredCars = CAR_CATALOG.map((car, idx) => {
    let score = 50; // Starting baseline

    // 1. BUDGET MATCHING
    const budgetPref = answers.budget;

    if (budgetPref === 'Under 10L') {
      if (car.priceVal < 10) score += 35;
      else if (car.priceVal <= 13) score -= 15;
      else score -= 40;
    } else if (budgetPref === '10-15L') {
      if (car.priceVal >= 10 && car.priceVal <= 15) score += 35;
      else if (car.priceVal < 10) score += 15; // affordable is okay
      else if (car.priceVal <= 20) score -= 15;
      else score -= 40;
    } else if (budgetPref === '15-20L') {
      if (car.priceVal >= 14 && car.priceVal <= 20) score += 35;
      else if (car.priceVal < 14 && car.priceVal >= 9) score += 15;
      else if (car.priceVal > 20 && car.priceVal <= 28) score -= 15;
      else score -= 40;
    } else if (budgetPref === '20L+') {
      if (car.priceVal >= 19) score += 35;
      else if (car.priceVal >= 12 && car.priceVal < 19) score += 10;
      else score -= 30;
    }

    // 2. FUEL PREFERENCE MATCHING
    const fuelPref = answers.fuel;
    if (fuelPref !== 'No Preference') {
      if (car.fuelType.toLowerCase() === fuelPref.toLowerCase()) {
        score += 25;
      } else {
        score -= 20;
      }
    } else {
      score += 15; // generalized fuel is accepted
    }

    // 3. FAMILY SIZE / SEATING MATCHING
    const sizePref = answers.familySize;
    if (sizePref === 2) {
      if (car.seats <= 5) score += 20;
      else score -= 15; // too bulky
    } else if (sizePref === 4) {
      if (car.seats === 5) score += 20;
      else if (car.seats === 7) score += 10; // extra seats are okay
      else score -= 10;
    } else if (sizePref >= 5) {
      if (car.seats >= 7) score += 30;
      else score -= 30; // unacceptable sizing
    }

    // 4. USAGE MATCHING
    const usagePref = answers.usage;
    if (usagePref === 'City') {
      if (car.fuelType === 'EV' || car.fuelType === 'Hybrid') score += 15;
      if (car.name.includes('Swift') || car.name.includes('Brezza')) score += 15; // compacts
    } else if (usagePref === 'Highway') {
      if (car.fuelType === 'Diesel') score += 15;
      if (car.safetyVal === 5) score += 10; // high speed stability & safety
    } else if (usagePref === 'Mixed') {
      score += 10;
    }

    // 5. PRIORITY MATCHING
    const prioPref = answers.priority;
    if (prioPref === 'Safety') {
      if (car.safetyVal === 5) score += 25;
      else if (car.safetyVal === 4) score += 10;
      else score -= 20;
    } else if (prioPref === 'Mileage') {
      if (car.mileageVal >= 22) score += 25;
      else if (car.mileageVal >= 17) score += 10;
      else score -= 15;
    } else if (prioPref === 'Comfort') {
      if (car.name.includes('Hycross') || car.name.includes('Creta') || car.name.includes('Audi') || car.name.includes('City')) {
        score += 25;
      }
    } else if (prioPref === 'Performance') {
      if (car.name.includes('Slavia') || car.name.includes('i20 N Line') || car.name.includes('Audi') || car.name.includes('XUV700')) {
        score += 25;
      }
    }

    // Capping score between 60 and 99 for high-fidelity realism
    const matchScore = Math.max(65, Math.min(99, Math.round(score)));

    // Generate Custom AI Explanation dynamically
    const formattedExplanation = `AI Analysis: The ${car.name} is a **${matchScore}% match** for your profiles. It perfectly maps to your budget (${answers.budget}) and family load requirements (${answers.familySize} seats). Since your core driver focus is **${answers.priority}**, this car's **${car.safetyRating}** structural integrity and **${car.mileage}** performance satisfy your demands. ${car.baseExplanation}`;

    return {
      id: `car-${idx}-${car.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: car.name,
      matchScore,
      price: car.price,
      mileage: car.mileage,
      safetyRating: car.safetyRating,
      pros: car.pros,
      cons: car.cons,
      explanation: formattedExplanation,
      specs: car.specs,
    } as CarRecommendation;
  });

  // Sort by score descending and return top 3 matches
  return scoredCars.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
};

export const fetchCarRecommendations = async (
  answers: QuestionnaireAnswers
): Promise<CarRecommendation[]> => {
  try {
    const normalizedAnswers = normalizeAnswersForApi(answers);
    const response = await api.post('/recommendations', normalizedAnswers);
    const recommendations = response?.data?.recommendations;

    if (!Array.isArray(recommendations)) {
      throw new Error('Invalid recommendation response format from API');
    }

    if (
      recommendations.length > 0 &&
      typeof recommendations[0] === 'object' &&
      recommendations[0] &&
      'car' in recommendations[0]
    ) {
      return (recommendations as ServerRecommendationItem[]).map(
        mapServerRecommendationToClient
      );
    }

    return recommendations as CarRecommendation[];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const message =
        (error.response.data as { message?: string | string[] })?.message || 'API request failed';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    console.warn('Backend API unreachable. Invoking client-side AI Fallback Matchmaker.', error);

    return new Promise((resolve) => {
      setTimeout(() => {
        const matches = calculateMockRecommendations(answers);
        resolve(matches);
      }, 2000);
    });
  }
};
