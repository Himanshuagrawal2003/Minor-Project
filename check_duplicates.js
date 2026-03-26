const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

async function checkDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User', new mongoose.Schema({ name: String, role: String }));
    
    const duplicates = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$name', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.log('Duplicate student names found:');
      duplicates.forEach(d => {
        console.log(`- ${d._id}: ${d.count} occurrences`);
      });
    } else {
      console.log('No duplicate student names found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDuplicates();
