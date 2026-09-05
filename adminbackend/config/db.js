const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Backend has its own separate mongoose instance (different node_modules).
    // adminbackend imports models from ../../Backend/models/ which use that
    // separate mongoose. We must connect it too, otherwise those models
    // buffer forever and timeout with 10000ms errors.
    try {
      const backendMongoose = require("../../Backend/node_modules/mongoose");
      if (backendMongoose.connection.readyState === 0) {
        await backendMongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      }
    } catch (e) {
      console.warn("Could not connect Backend mongoose instance:", e.message);
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
