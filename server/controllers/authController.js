const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Election = require("../models/electionModel");
const bcrypt = require("bcrypt");


/* =========================================
   REGISTER
========================================= */

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            electionIds
        } = req.body;


        /* =========================================
           BASIC VALIDATION
        ========================================== */

        if (!name || !email || !password) {
            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });
        }


        /* =========================================
           CHECK EXISTING USER
        ========================================== */

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "User with this email already exists"
            });
        }


        /* =========================================
           VALIDATE ELECTION SELECTION
        ========================================== */

        let selectedElectionIds = [];

        if (Array.isArray(electionIds)) {
            selectedElectionIds =
                [...new Set(electionIds)];
        }


        if (selectedElectionIds.length === 0) {
            return res.status(400).json({
                message:
                    "Please select at least one election"
            });
        }


        /* =========================================
           FIND SELECTED ELECTIONS
        ========================================== */

        const elections =
            await Election.find({
                _id: {
                    $in: selectedElectionIds
                }
            });


        if (
            elections.length !==
            selectedElectionIds.length
        ) {
            return res.status(400).json({
                message:
                    "One or more selected elections were not found"
            });
        }


        /* =========================================
           CHECK ELECTION STATUS
        ========================================== */

        const now = new Date();

        const endedElection =
            elections.find(
                (election) =>
                    now >= election.endTime
            );

        if (endedElection) {
            return res.status(400).json({
                message:
                    "You cannot register for an election that has already ended"
            });
        }


        /* =========================================
           HASH PASSWORD
        ========================================== */

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        /* =========================================
           CREATE USER
        ========================================== */

        const user = new User({
            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: "user",

            elections:
                selectedElectionIds
        });

        await user.save();


        /* =========================================
           CREATE JWT
        ========================================== */

        const token =
            jwt.sign(
                {
                    userId: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );


        /* =========================================
           RESPONSE
        ========================================== */

        res.status(201).json({
            message:
                "Registration successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                elections:
                    user.elections
            }
        });

    } catch (error) {

        console.log(error);


        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    "User with this email already exists"
            });
        }


        if (
            error.name ===
            "CastError"
        ) {
            return res.status(400).json({
                message:
                    "One or more election IDs are invalid"
            });
        }


        res.status(500).json({
            message:
                error.message
        });
    }
};


/* =========================================
   LOGIN
========================================= */

const login = async (req, res) => {
    try {

        const email =
            req.body.email
                ?.trim()
                .toLowerCase();


        const user =
            await User.findOne({
                email
            });


        if (!user) {
            return res.status(404).json({
                message:
                    "User not found"
            });
        }


        const isMatch =
            await bcrypt.compare(
                req.body.password,
                user.password
            );


        if (!isMatch) {
            return res.status(401).json({
                message:
                    "Invalid password"
            });
        }


        const token =
            jwt.sign(
                {
                    userId: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );


        res.status(200).json({
            message:
                "Login successful",

            token
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                error.message
        });
    }
};


/* =========================================
   GET MY ELECTIONS
========================================= */

const getMyElections = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.user.userId
            ).populate({
                path: "elections",
                options: {
                    sort: {
                        startTime: 1
                    }
                }
            });


        if (!user) {
            return res.status(404).json({
                message:
                    "User not found"
            });
        }


        const now = new Date();


        const elections =
            (user.elections || [])
                .filter(
                    (election) =>
                        election &&
                        election.endTime
                )
                .map((election) => {

                    let status =
                        "not_started";

                    if (
                        now >= election.endTime
                    ) {
                        status = "ended";
                    } else if (
                        now >= election.startTime
                    ) {
                        status = "live";
                    }

                    return {
                        _id:
                            election._id,

                        title:
                            election.title,

                        startTime:
                            election.startTime,

                        endTime:
                            election.endTime,

                        resultsAnnounced:
                            election.resultsAnnounced,

                        status
                    };
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
};


module.exports = {
    register,
    login,
    getMyElections
};