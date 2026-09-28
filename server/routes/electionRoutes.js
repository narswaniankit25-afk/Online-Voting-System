const express = require("express");

const router = express.Router();

const {
    createElection,
    getElections,
    getElectionById,
    announceResults,
    deleteElection
} = require("../controllers/electionController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


/* =========================================
   CREATE ELECTION
========================================= */

router.post(
    "/election",
    authMiddleware,
    adminMiddleware,
    createElection
);


/* =========================================
   GET ALL ELECTIONS
========================================= */

router.get(
    "/elections",
    getElections
);


/* =========================================
   GET SINGLE ELECTION
========================================= */

router.get(
    "/election/:electionId",
    getElectionById
);


/* =========================================
   ANNOUNCE RESULTS
========================================= */

router.post(
    "/election/:electionId/announce-results",
    authMiddleware,
    adminMiddleware,
    announceResults
);


/* =========================================
   DELETE ELECTION
========================================= */

router.delete(
    "/election/:electionId",
    authMiddleware,
    adminMiddleware,
    deleteElection
);


module.exports = router;