import mongoose from 'mongoose';
import User from './Backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './Backend/.env' });

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const students = await User.find({ role: 'student' });
    console.log(`Total students: ${students.length}`);

    const allotted = students.filter(s => s.roomNumber && s.roomNumber !== '');
    console.log(`Allotted students in DB: ${allotted.length}`);

    allotted.forEach(s => {
      console.log(`- ${s.name} (${s.customId}): Room ${s.roomNumber}, Block ${s.block}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
