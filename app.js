const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const path = require("path");

const hotelRoutes = require("./routes/hotel");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ===========================
   TRUST PROXY (Render/Heroku)
=========================== */
app.set("trust proxy", 1);

/* ===========================
   DATABASE CONNECTION
=========================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ===========================
   MIDDLEWARE
=========================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "7d",
  etag: true
}));

app.set("view engine", "ejs");
app.use(logger);

/* ===========================
   SESSION CONFIG
=========================== */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
}));

/* ===========================
   ROUTES
=========================== */
app.use("/hotel", hotelRoutes);
app.use("/", authRoutes);

app.get("/hotelBooking", (req, res) => {
  res.render("hotelBooking");
});

app.get("/", (req, res) => {
  res.render("app");
});

/* ===========================
   ERROR HANDLER
=========================== */
app.use(errorHandler);

/* ===========================
   START SERVER
=========================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
