import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await mongoose.connection.db.collection('users').find({ role: 'student' }).toArray();
    console.log(`Total students: ${users.length}`);

    const allotted = users.filter(s => s.roomNumber && s.roomNumber !== '');
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
