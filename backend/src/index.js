import express from "express";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {app,server} from "./lib/socket.js";
import cors from "cors";
import path from "path";
dotenv.config();
// const app = express();
const port = process.env.PORT || 5001;
const __dirname = path.resolve();
// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production") {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}
// Server start
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  connectDB();
});
