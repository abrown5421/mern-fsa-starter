import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import userRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import session from "express-session";
import integrationsRoutes from "./integrations/routes/integrations.routes";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  console.log("The server is running!\n");
});

app.use(cookieParser());

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/integrations", integrationsRoutes);
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
