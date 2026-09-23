const express = require("express");

const router = express.Router();

const {
    castVote,
    getResults
} = require("../controllers/voteController");
const electionMiddleware = require("../middleware/electionMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const userMiddleware = require("../middleware/userMiddleware");


// User: Cast vote
router.post(
    "/vote",
    authMiddleware,
    userMiddleware,
    electionMiddleware,
    castVote
);


// Get results
router.get("/results", getResults);


module.exports = router;