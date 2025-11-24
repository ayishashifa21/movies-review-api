const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const auth = require("./middleware/auth");
const movieRoutes = require("./routes/movies");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/movies", auth, movieRoutes);

app.get("/", (req, res) => res.send("Movie Review API running"));

app.listen(process.env.PORT || 3000, () =>
    console.log("Server running")
);
