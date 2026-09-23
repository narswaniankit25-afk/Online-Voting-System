const Vote = require("../models/voteModel");
const Candidate = require("../models/candidateModel");

const castVote = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { candidateId } = req.body;

        // Check if candidate exists
        const candidate = await Candidate.findById(candidateId);

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }

        // Check if user has already voted
        const existingVote = await Vote.findOne({
            user: userId
        });

        if (existingVote) {
            return res.status(400).json({
                message: "You have already voted"
            });
        }

        // Create vote
        const vote = new Vote({
            user: userId,
            candidate: candidateId
        });

        await vote.save();

        res.status(201).json({
            message: "Vote cast successfully"
        });

    } catch (error) {
        console.log(error);

        // Handle duplicate vote caused by unique index
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already voted"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
};


const getResults = async (req, res) => {
    try {
        const Election = require("../models/electionModel");

        // Find election
        const election = await Election.findOne();

        if (!election) {
            return res.status(404).json({
                message: "No election found"
            });
        }

        const now = new Date();

        // Check if election has ended
        if (now < election.endTime) {
            return res.status(403).json({
                message: "Voting is still in progress"
            });
        }

        // Check if admin has announced results
        if (!election.resultsAnnounced) {
            return res.status(403).json({
                message: "Results have not been announced yet"
            });
        }

        // Get all candidates and count their votes
        const results = await Candidate.aggregate([
            {
                $lookup: {
                    from: "votes",
                    localField: "_id",
                    foreignField: "candidate",
                    as: "voteRecords"
                }
            },
            {
                $project: {
                    _id: 0,
                    candidate: "$name",
                    party: "$party",
                    symbol: "$symbol",
                    votes: {
                        $size: "$voteRecords"
                    }
                }
            },
            {
                $sort: {
                    votes: -1
                }
            }
        ]);

        res.status(200).json({
            results: results
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    castVote,
    getResults
};