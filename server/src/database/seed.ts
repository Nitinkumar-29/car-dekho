import 'dotenv/config';
import mongoose from 'mongoose';
import { CarSchema } from '../cars/schemas/car.schema';

const CarModel = mongoose.model('Car', CarSchema, 'cars');

const cars = [
  { name: 'Swift', brand: 'Maruti', price: 750000, fuelType: 'Petrol', mileage: 22.4, safetyRating: 3, transmission: 'Manual', familyFriendly: true },
  { name: 'Baleno', brand: 'Maruti', price: 900000, fuelType: 'Petrol', mileage: 22.9, safetyRating: 4, transmission: 'Automatic', familyFriendly: true },
  { name: 'Brezza', brand: 'Maruti', price: 1200000, fuelType: 'Petrol', mileage: 19.8, safetyRating: 4, transmission: 'Automatic', familyFriendly: true },
  { name: 'Grand i10 Nios', brand: 'Hyundai', price: 780000, fuelType: 'Petrol', mileage: 20.7, safetyRating: 3, transmission: 'Manual', familyFriendly: true },
  { name: 'i20', brand: 'Hyundai', price: 1050000, fuelType: 'Petrol', mileage: 20, safetyRating: 3, transmission: 'Automatic', familyFriendly: true },
  { name: 'Venue', brand: 'Hyundai', price: 1280000, fuelType: 'Petrol', mileage: 18.1, safetyRating: 4, transmission: 'Automatic', familyFriendly: true },
  { name: 'Honda Amaze', brand: 'Honda', price: 930000, fuelType: 'Petrol', mileage: 19.4, safetyRating: 4, transmission: 'CVT', familyFriendly: true },
  { name: 'Honda City', brand: 'Honda', price: 1450000, fuelType: 'Petrol', mileage: 18.4, safetyRating: 5, transmission: 'CVT', familyFriendly: true },
  { name: 'Elevate', brand: 'Honda', price: 1600000, fuelType: 'Petrol', mileage: 16.9, safetyRating: 5, transmission: 'CVT', familyFriendly: true },
  { name: 'Tiago', brand: 'Tata', price: 700000, fuelType: 'Petrol', mileage: 20.1, safetyRating: 4, transmission: 'Manual', familyFriendly: true },
  { name: 'Altroz', brand: 'Tata', price: 980000, fuelType: 'Petrol', mileage: 19.3, safetyRating: 5, transmission: 'Manual', familyFriendly: true },
  { name: 'Nexon', brand: 'Tata', price: 1350000, fuelType: 'Petrol', mileage: 17.4, safetyRating: 5, transmission: 'AMT', familyFriendly: true },
  { name: 'Harrier', brand: 'Tata', price: 2200000, fuelType: 'Diesel', mileage: 16.8, safetyRating: 5, transmission: 'Automatic', familyFriendly: true },
  { name: 'XUV300', brand: 'Mahindra', price: 1250000, fuelType: 'Diesel', mileage: 20.1, safetyRating: 5, transmission: 'Manual', familyFriendly: true },
  { name: 'Scorpio N', brand: 'Mahindra', price: 2300000, fuelType: 'Diesel', mileage: 15.4, safetyRating: 5, transmission: 'Automatic', familyFriendly: true },
  { name: 'XUV700', brand: 'Mahindra', price: 2500000, fuelType: 'Diesel', mileage: 16.5, safetyRating: 5, transmission: 'Automatic', familyFriendly: true },
  { name: 'Sonet', brand: 'Kia', price: 1300000, fuelType: 'Petrol', mileage: 18.4, safetyRating: 4, transmission: 'DCT', familyFriendly: true },
  { name: 'Seltos', brand: 'Kia', price: 1850000, fuelType: 'Petrol', mileage: 17.9, safetyRating: 4, transmission: 'Automatic', familyFriendly: true },
  { name: 'Carens', brand: 'Kia', price: 1900000, fuelType: 'Diesel', mileage: 19, safetyRating: 4, transmission: 'Automatic', familyFriendly: true },
  { name: 'Glanza', brand: 'Toyota', price: 980000, fuelType: 'Petrol', mileage: 22.3, safetyRating: 4, transmission: 'AMT', familyFriendly: true },
  { name: 'Urban Cruiser Hyryder', brand: 'Toyota', price: 2050000, fuelType: 'Hybrid', mileage: 27.9, safetyRating: 4, transmission: 'eCVT', familyFriendly: true },
  { name: 'Innova Hycross', brand: 'Toyota', price: 3200000, fuelType: 'Hybrid', mileage: 23.2, safetyRating: 5, transmission: 'eCVT', familyFriendly: true }
];

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/car-recommendation';
  await mongoose.connect(uri);

  await CarModel.deleteMany({});
  await CarModel.insertMany(cars);
  await mongoose.disconnect();

  // eslint-disable-next-line no-console
  console.log(`Seeded ${cars.length} cars.`);
}

seed().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
