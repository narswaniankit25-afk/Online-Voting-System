const express = require("express");

const router = express.Router();

const {
    createElection,
    announceResults,
    getElection
} = require("../controllers/electionController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post(
    "/election",
    authMiddleware,
    adminMiddleware,
    createElection
);

router.post(
    "/election/announce-results",
    authMiddleware,
    adminMiddleware,
    announceResults
);

router.get(
    "/election",
    getElection
);

module.exports = router;