import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import bookRouter from "./routes/bookRoutes.js";
import favoriteRouter from "./routes/favoriteRoutes.js";
import stripeWebhook from "./routes/stripeWebhook.js";
import orderRoutes from "./routes/orderRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

// ** CONFIG
const app = express();
const port = process.env.PORT || 5000;

// ** MIDDLEWARES
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(cors());
connectDB();

// ** API ENDPOINTS
app.use("/api/auth", authRouter);
app.use("/api/user", userRoutes);
app.use("/api/book", bookRouter);
app.use("/api/order", orderRoutes);
app.use("/api/favorite", favoriteRouter);
app.use("/api/stats", statsRoutes);

app.get("/api", (_, res) => {
  res.send("API IS RUNNING");
});

app.listen(port, () => {
  console.log("server running on port: " + port);
});
