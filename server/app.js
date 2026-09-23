const express = require("express");
const cors = require("cors");
const path = require("path");

const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const electionRoutes = require("./routes/electionRoutes");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded candidate images
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/", candidateRoutes);
app.use("/", voteRoutes);
app.use("/", electionRoutes);

const PORT = 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();