import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/hostelDB')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    if (collections.find(c => c.name === 'messmenus')) {
      const indexes = await db.collection('messmenus').indexInformation();
      console.log('Indexes on messmenus:', indexes);
      
      if (indexes['day_1']) {
        console.log('Attempting to drop day_1...');
        await db.collection('messmenus').dropIndex('day_1');
        console.log('day_1 index dropped.');
      } else {
        console.log('day_1 index not found. No action needed.');
      }
    } else {
      console.log('messmenus collection not found');
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
