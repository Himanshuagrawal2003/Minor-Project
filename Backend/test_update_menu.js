import connectDB from './config/db.js';
import { updateMenu } from './controllers/messController.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const runTest = async () => {
  // Use Mongoose connect directly with the fixed URI in case dotenv fails
  await mongoose.connect('mongodb://127.0.0.1:27017/hostelDB');
  console.log("Connected to DB, running test...");
  
  const req = {
    body: {
      messId: 'Default Mess',
      day: 'Monday',
      meals: { breakfast: ['Tea'], lunch: ['Rice'], dinner: ['Roti'] }
    }
  };
  
  const res = {
    json: (data) => console.log("SUCCESS:", JSON.stringify(data)),
    status: (code) => {
      console.log("STATUS CALLED:", code);
      return {
        json: (data) => console.log("ERROR DATA:", JSON.stringify(data))
      };
    }
  };
  
  try {
    await updateMenu(req, res);
  } catch (err) {
    console.error("CATCH BLOCK ERROR:", err);
  }
  
  process.exit();
};

runTest();
