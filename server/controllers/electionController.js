const Election = require("../models/electionModel");
const Candidate = require("../models/candidateModel");
const Vote = require("../models/voteModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");


/* =========================================
   HELPER
   DELETE UPLOADED FILE
========================================= */

const deleteUploadedFile = (filePath) => {

    if (!filePath) {
        return;
    }

    const fileName =
        path.basename(filePath);

    const absolutePath =
        path.join(
            __dirname,
            "..",
            "uploads",
            "candidates",
            fileName
        );

    if (fs.existsSync(absolutePath)) {

        try {

            fs.unlinkSync(absolutePath);

        } catch (error) {

            console.log(
                "Unable to delete file:",
                absolutePath
            );

        }

    }

};


/* =========================================
   GET ELECTION STATUS
========================================= */

const getElectionStatus = (election) => {

    const now = new Date();

    if (now < election.startTime) {

        return "not_started";

    }

    if (now >= election.startTime &&
        now <= election.endTime) {

        return "live";

    }

    return "ended";
};


/* =========================================
   CREATE ELECTION
========================================= */

const createElection = async (req, res) => {

    try {

        const {
            title,
            startTime,
            endTime
        } = req.body;


        if (!startTime || !endTime) {

            return res.status(400).json({
                message:
                    "Start time and end time are required"
            });

        }


        const start =
            new Date(startTime);

        const end =
            new Date(endTime);


        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {

            return res.status(400).json({
                message:
                    "Invalid start time or end time"
            });

        }


        if (start >= end) {

            return res.status(400).json({
                message:
                    "Start time must be before end time"
            });

        }


        const election =
            new Election({

                title:
                    title?.trim() ||
                    "Election",

                startTime: start,

                endTime: end

            });


        await election.save();


        res.status(201).json({

            message:
                "Election created successfully",

            election

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};


/* =========================================
   GET ALL ELECTIONS
========================================= */

const getElections = async (req, res) => {

    try {

        const elections =
            await Election.find()
                .sort({
                    startTime: -1
                });


        const electionsWithStatus =
            elections.map((election) => {

                const electionObject =
                    election.toObject();

                return {

                    ...electionObject,

                    status:
                        getElectionStatus(
                            election
                        )

                };

            });


        res.status(200).json({

            elections:
                electionsWithStatus

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};


/* =========================================
   GET SINGLE ELECTION
========================================= */

const getElectionById = async (req, res) => {

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


        res.status(200).json({

            election,

            status:
                getElectionStatus(
                    election
                )

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
            message: error.message
        });

    }

};


/* =========================================
   ANNOUNCE RESULTS
========================================= */

const announceResults = async (req, res) => {

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


        if (now < election.endTime) {

            return res.status(403).json({
                message:
                    "Voting is still in progress"
            });

        }


        if (election.resultsAnnounced) {

            return res.status(400).json({
                message:
                    "Results have already been announced"
            });

        }


        election.resultsAnnounced =
            true;


        await election.save();


        res.status(200).json({

            message:
                "Results announced successfully",

            election

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
            message: error.message
        });

    }

};


/* =========================================
   DELETE ELECTION
========================================= */

const deleteElection = async (req, res) => {

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


        /*
            Election must be completed
        */

        if (now < election.endTime) {

            return res.status(403).json({
                message:
                    "Election cannot be deleted before it ends"
            });

        }


        /*
            Results must already
            have been announced
        */

        if (!election.resultsAnnounced) {

            return res.status(403).json({
                message:
                    "Results must be announced before deleting the election"
            });

        }


        /*
            Find candidates belonging
            ONLY to this election
        */

        const candidates =
            await Candidate.find({
                election:
                    election._id
            });


        /*
            Delete candidate images
        */

        for (
            const candidate
            of candidates
        ) {

            deleteUploadedFile(
                candidate.photo
            );

            deleteUploadedFile(
                candidate.symbolImage
            );

        }


        /*
            Delete votes belonging
            ONLY to this election
        */

        await Vote.deleteMany({
    election: election._id
});

await Candidate.deleteMany({
    election: election._id
});

await User.updateMany(
    {
        elections: election._id
    },
    {
        $pull: {
            elections: election._id
        }
    }
);

await Election.findByIdAndDelete(
    election._id
);


        /*
            Delete candidates belonging
            ONLY to this election
        */

        await Candidate.deleteMany({

            election:
                election._id

        });


        /*
            Finally delete election
        */

        await Election.deleteOne({

            _id:
                election._id

        });


        res.status(200).json({

            message:
                "Election deleted successfully"

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
            message: error.message
        });

    }

};


/* =========================================
   EXPORT
========================================= */

module.exports = {

    createElection,

    getElections,

    getElectionById,

    announceResults,

    deleteElection

};