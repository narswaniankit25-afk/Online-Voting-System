const Election = require("../models/electionModel");

const electionMiddleware = async (req, res, next) => {
    try {
        const election = await Election.findOne();

        if (!election) {
            return res.status(404).json({
                message: "No election found"
            });
        }

        const now = new Date();

        if (now < election.startTime) {
            return res.status(403).json({
                message: "Voting has not started yet"
            });
        }

        if (now > election.endTime) {
            return res.status(403).json({
                message: "Voting has ended"
            });
        }

        next();

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = electionMiddleware;