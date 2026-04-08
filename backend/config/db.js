const mongoose = require("mongoose");
const { ensureFileDatabase, isFileDbEnabled } = require("../storage/repository");

async function connectDB() {
  if (isFileDbEnabled()) {
    await ensureFileDatabase();
    console.log("File storage connected");
    return;
  }

  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/url-manager-system";

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

module.exports = connectDB;
