const express = require("express");

const router = express.Router();


const {
    addCandidate,
    getCandidates,
    updateCandidate
} = require("../controllers/candidateController");


const authMiddleware =
    require("../middleware/authMiddleware");


const adminMiddleware =
    require("../middleware/adminMiddleware");


const upload =
    require("../middleware/uploadMiddleware");


/* =========================================
   ADD CANDIDATE
========================================= */

router.post(
    "/candidate",

    authMiddleware,

    adminMiddleware,

    upload.fields([
        {
            name: "photo",
            maxCount: 1
        },
        {
            name: "symbolImage",
            maxCount: 1
        }
    ]),

    addCandidate
);


/* =========================================
   GET CANDIDATES
========================================= */

router.get(
    "/candidates",
    getCandidates
);


/* =========================================
   EDIT CANDIDATE
========================================= */

router.put(
    "/candidate/:id",

    authMiddleware,

    adminMiddleware,

    upload.fields([
        {
            name: "photo",
            maxCount: 1
        },
        {
            name: "symbolImage",
            maxCount: 1
        }
    ]),

    updateCandidate
);


module.exports = router;