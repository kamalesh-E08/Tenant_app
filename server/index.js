const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const faultRoutes = require("./routes/faultRoutes");
const tenantRoutes = require("./routes/tenantRoutes");

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://Kamalesh:Kamal%40Sang0818@rooms.w5p8t86.mongodb.net/?retryWrites=true&w=majority&appName=rooms",
    {}
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use("/", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/rooms", faultRoutes);
app.use("/tenant", tenantRoutes);

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
