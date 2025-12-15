/**
 * Script to fix users missing storeName
 * Run with: npx ts-node scripts/fix-user-storenames.ts
 */

import mongoose from 'mongoose';

async function fixUserStoreNames() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('Database connection not established');
    process.exit(1);
  }

  // Find all users without storeName
  const users = await db.collection('users').find({
    storeName: { $in: [null, undefined, ''] }
  }).toArray();

  console.log(`Found ${users.length} users without storeName`);

  for (const user of users) {
    const store = await db.collection('stores').findOne({ _id: new mongoose.Types.ObjectId(user.storeId) });

    if (store) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { storeName: store.name } }
      );
      console.log(`Updated user ${user.email} with storeName: ${store.name}`);
    } else {
      console.log(`Store not found for user ${user.email}`);
    }
  }

  console.log('Done!');
  await mongoose.disconnect();
}

fixUserStoreNames().catch(console.error);
