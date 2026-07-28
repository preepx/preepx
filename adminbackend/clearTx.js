require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const WalletTransaction = require('./models/WalletTransaction');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB. Deleting all transactions...');
    const result = await WalletTransaction.deleteMany({});
    console.log(`Deleted ${result.deletedCount} transactions.`);
    console.log('Total revenue is now 0.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
