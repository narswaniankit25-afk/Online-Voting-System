const Election = require("../models/electionModel");

const createElection = async (req, res) => {
    try {
        const { startTime, endTime } = req.body;

        // Check if both times are provided
        if (!startTime || !endTime) {
            return res.status(400).json({
                message: "Start time and end time are required"
            });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Check if dates are valid
        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                message: "Invalid start time or end time"
            });
        }

        // Start time must be before end time
        if (start >= end) {
            return res.status(400).json({
                message: "Start time must be before end time"
            });
        }

        const existingElection = await Election.findOne();

        if (existingElection) {
            return res.status(400).json({
                message: "An election already exists"
            });
        }

        const election = new Election({
            startTime: start,
            endTime: end
        });

        await election.save();

        res.status(201).json({
            message: "Election created successfully",
            election
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
const announceResults = async (req, res) => {
    try {
        const election = await Election.findOne();

        if (!election) {
            return res.status(404).json({
                message: "No election found"
            });
        }

        const now = new Date();

        if (now < election.endTime) {
            return res.status(403).json({
                message: "Voting is still in progress"
            });
        }

        if (election.resultsAnnounced) {
            return res.status(400).json({
                message: "Results have already been announced"
            });
        }

        election.resultsAnnounced = true;

        await election.save();

        res.status(200).json({
            message: "Results announced successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
const getElection = async (req, res) => {
    try {
        const election = await Election.findOne();

        if (!election) {
            return res.status(404).json({
                message: "No election found"
            });
        }

        const now = new Date();

        let status;

        if (now < election.startTime) {
            status = "not_started";
        } else if (now > election.endTime) {
            status = "ended";
        } else {
            status = "live";
        }

        res.status(200).json({
            election,
            status
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createElection,
    announceResults,
    getElection
};