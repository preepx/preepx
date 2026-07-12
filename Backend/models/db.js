const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Remove orphaned unique index from older schema — only if collection exists
    try {
      const collections = await mongoose.connection.db.listCollections({ name: "users" }).toArray();
      if (collections.length > 0) {
        const users = mongoose.connection.collection("users");
        const indexes = await users.indexes();
        if (indexes.some((idx) => idx.name === "userName_1")) {
          await users.dropIndex("userName_1");
          console.log("Dropped stale userName_1 index");
        }
      }
    } catch (indexErr) {
      // Non-fatal — ignore index cleanup errors
      console.warn("Index cleanup skipped:", indexErr.message);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
