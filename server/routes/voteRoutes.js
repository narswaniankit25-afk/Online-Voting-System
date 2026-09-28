const express = require("express");

const router = express.Router();


const {
    castVote,
    getResults
} = require("../controllers/voteController");


const electionMiddleware =
    require("../middleware/electionMiddleware");


const authMiddleware =
    require("../middleware/authMiddleware");


const userMiddleware =
    require("../middleware/userMiddleware");


/* =========================================
   CAST VOTE
========================================= */

router.post(
    "/vote",

    authMiddleware,

    userMiddleware,

    electionMiddleware,

    castVote
);


/* =========================================
   GET ELECTION RESULTS
========================================= */

router.get(
    "/results/:electionId",

    getResults
);


/* =========================================
   EXPORT
========================================= */

module.exports = router;