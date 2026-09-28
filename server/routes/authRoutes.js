const express = require("express");

const router = express.Router();


const {
    register,
    login,
    getMyElections
} = require("../controllers/authController");


const Election =
    require("../models/electionModel");


const authMiddleware =
    require("../middleware/authMiddleware");


/* =========================================
   LOGIN
========================================= */

router.post(
    "/login",
    login
);


/* =========================================
   REGISTER
========================================= */

router.post(
    "/register",
    register
);


/* =========================================
   GET ELECTIONS FOR REGISTRATION
========================================= */

router.get(
    "/registration-elections",
    async (req, res) => {

        try {

            const now =
                new Date();


            const elections =
                await Election.find({
                    endTime: {
                        $gt: now
                    }
                })
                .sort({
                    startTime: 1
                });


            res.status(200).json({
                elections
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                    error.message
            });
        }
    }
);


/* =========================================
   GET ELECTIONS ASSIGNED TO LOGGED-IN USER
========================================= */

router.get(
    "/my-elections",
    authMiddleware,
    getMyElections
);


/* =========================================
   PROTECTED TEST ROUTE
========================================= */

router.get(
    "/protected",
    authMiddleware,
    (req, res) => {

        res.json({
            message:
                "You accessed a protected route",

            user:
                req.user
        });
    }
);


module.exports = router;