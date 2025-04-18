import { server } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/connect.db.js";

dotenv.config();

const PORT = process.env.PORT || 9001;

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🔥 API Documentation: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error. Exiting process...", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});


