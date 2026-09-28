const Vote = require("../models/voteModel");
const Candidate = require("../models/candidateModel");
const Election = require("../models/electionModel");
const User = require("../models/userModel");


/* =========================================
   CAST VOTE
========================================= */

const castVote = async (req, res) => {

    try {

        const {
            candidateId,
            electionId
        } = req.body;


        /* =========================================
           BASIC VALIDATION
        ========================================== */

        if (
            !candidateId ||
            !electionId
        ) {
            return res.status(400).json({
                message:
                    "Candidate ID and Election ID are required"
            });
        }


        /* =========================================
           FIND USER
        ========================================== */

        const user =
            await User.findById(
                req.user.userId
            );


        if (!user) {
            return res.status(404).json({
                message:
                    "User not found"
            });
        }


        /* =========================================
           CHECK ELECTION ASSIGNMENT
        ========================================== */

        const isAssigned =
            user.elections?.some(
                (id) =>
                    id.toString() ===
                    electionId.toString()
            );


        if (!isAssigned) {
            return res.status(403).json({
                message:
                    "You are not registered for this election"
            });
        }


        /* =========================================
           FIND ELECTION
        ========================================== */

        const election =
            await Election.findById(
                electionId
            );


        if (!election) {
            return res.status(404).json({
                message:
                    "Election not found"
            });
        }


        /* =========================================
           CHECK ELECTION TIME
        ========================================== */

        const now =
            new Date();


        if (
            now < election.startTime
        ) {
            return res.status(403).json({
                message:
                    "Voting has not started yet"
            });
        }


        if (
            now >= election.endTime
        ) {
            return res.status(403).json({
                message:
                    "Voting has ended"
            });
        }


        /* =========================================
           FIND CANDIDATE
        ========================================== */

        const candidate =
            await Candidate.findById(
                candidateId
            );


        if (!candidate) {
            return res.status(404).json({
                message:
                    "Candidate not found"
            });
        }


        /* =========================================
           CHECK CANDIDATE BELONGS TO ELECTION
        ========================================== */

        if (
            candidate.election.toString() !==
            electionId.toString()
        ) {
            return res.status(400).json({
                message:
                    "Candidate does not belong to this election"
            });
        }


        /* =========================================
           CHECK EXISTING VOTE
        ========================================== */

        const existingVote =
            await Vote.findOne({
                user:
                    req.user.userId,

                election:
                    electionId
            });


        if (existingVote) {
            return res.status(409).json({
                message:
                    "You have already voted in this election"
            });
        }


        /* =========================================
           CREATE VOTE
        ========================================== */

        try {

            const vote =
                await Vote.create({
                    user:
                        req.user.userId,

                    election:
                        electionId,

                    candidate:
                        candidateId
                });


            res.status(201).json({
                message:
                    "Vote cast successfully",

                voteId:
                    vote._id
            });

        } catch (error) {

            /*
            Compound unique index provides
            an additional database-level
            protection against duplicate votes.
            */

            if (
                error.code === 11000
            ) {
                return res.status(409).json({
                    message:
                        "You have already voted in this election"
                });
            }

            throw error;
        }

    } catch (error) {

        console.log(error);

        if (
            error.name ===
            "CastError"
        ) {
            return res.status(400).json({
                message:
                    "Invalid ID provided"
            });
        }

        res.status(500).json({
            message:
                error.message
        });
    }
};


/* =========================================
   GET RESULTS
========================================= */

const getResults = async (req, res) => {

    try {

        const {
            electionId
        } = req.params;


        const election =
            await Election.findById(
                electionId
            );


        if (!election) {
            return res.status(404).json({
                message:
                    "Election not found"
            });
        }


        const now =
            new Date();


        if (
            now < election.endTime
        ) {
            return res.status(403).json({
                message:
                    "Results are not available until the election ends"
            });
        }


        if (
            !election.resultsAnnounced
        ) {
            return res.status(403).json({
                message:
                    "Results have not been announced yet"
            });
        }


        const candidates =
            await Candidate.find({
                election:
                    electionId
            });


        const results =
            await Promise.all(
                candidates.map(
                    async (candidate) => {

                        const voteCount =
                            await Vote.countDocuments({
                                election:
                                    electionId,

                                candidate:
                                    candidate._id
                            });


                        return {
                            candidateId:
                                candidate._id,

                            name:
                                candidate.name,

                            party:
                                candidate.party,

                            symbol:
                                candidate.symbol,

                            photo:
                                candidate.photo,

                            symbolImage:
                                candidate.symbolImage,

                            votes:
                                voteCount
                        };
                    }
                )
            );


        results.sort(
            (a, b) =>
                b.votes - a.votes
        );


        res.status(200).json({

            election: {
                _id:
                    election._id,

                title:
                    election.title,

                startTime:
                    election.startTime,

                endTime:
                    election.endTime,

                resultsAnnounced:
                    election.resultsAnnounced
            },

            results
        });

    } catch (error) {

        console.log(error);

        if (
            error.name ===
            "CastError"
        ) {
            return res.status(400).json({
                message:
                    "Invalid election ID"
            });
        }

        res.status(500).json({
            message:
                error.message
        });
    }
};


module.exports = {
    castVote,
    getResults
};