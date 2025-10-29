import { connectToDatabase } from "./mongoose";

(async () => {
  try {
    await connectToDatabase();
    console.log("✅ MongoDB connection test successful");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
})();
