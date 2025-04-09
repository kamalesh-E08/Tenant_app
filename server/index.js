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

mongoose.connect("mongodb://127.0.0.1:27017/tenant_management", {
});

app.use("/", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/rooms", faultRoutes);
app.use("/tenant", tenantRoutes);

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
