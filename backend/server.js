
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const { findLinkByShortCode } = require("./storage/repository");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (origin === CLIENT_URL) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    const isLocalHost =
      parsedOrigin.hostname === "localhost" || parsedOrigin.hostname === "127.0.0.1";

    return isLocalHost;
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for this origin."));
    },
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Short URL Management API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.get("/:shortCode", async (req, res, next) => {
  try {
    const link = await findLinkByShortCode(req.params.shortCode);

    if (!link) {
      return res.status(404).send("Invalid short code.");
    }

    const now = new Date();
    const startTime = link.startTime ? new Date(link.startTime) : null;
    const endTime = link.endTime ? new Date(link.endTime) : null;

    if (!link.isActive) {
      return res.status(403).send("This link is inactive.");
    }

    if (startTime && now < startTime) {
      return res.status(403).send("This link is not active yet.");
    }

    if (endTime && now > endTime) {
      return res.status(410).send("This link has expired.");
    }

    return res.redirect(link.originalUrl);
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  res.status(statusCode).json({ message });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
