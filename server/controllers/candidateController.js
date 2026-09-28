const Candidate = require("../models/candidateModel");
const Election = require("../models/electionModel");

const fs = require("fs");
const path = require("path");


/* =========================================
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
   CHECK ELECTION
========================================= */

const findElection = async (electionId) => {

    if (!electionId) {
        return null;
    }

    return await Election.findById(
        electionId
    );
};


/* =========================================
   ADD CANDIDATE
========================================= */

const addCandidate = async (req, res) => {

    try {

        const {
            electionId,
            name,
            party,
            symbol
        } = req.body;


        /* ================================
           VALIDATION
        ================================= */

        if (!electionId) {

            return res.status(400).json({
                message:
                    "Election ID is required"
            });

        }


        if (!name || !party || !symbol) {

            return res.status(400).json({
                message:
                    "Candidate name, party and symbol are required"
            });

        }


        /* ================================
           CHECK ELECTION
        ================================= */

        const election =
            await findElection(
                electionId
            );


        if (!election) {

            return res.status(404).json({
                message:
                    "Election not found"
            });

        }


        /* ================================
           PREVENT ADDING CANDIDATES
           AFTER ELECTION ENDS
        ================================= */

        const now =
            new Date();


        if (now >= election.endTime) {

            return res.status(403).json({
                message:
                    "Candidates cannot be added after the election ends"
            });

        }


        /* ================================
           GET UPLOADED FILES
        ================================= */

        let photo = null;

        let symbolImage = null;


        if (
            req.files &&
            req.files.photo &&
            req.files.photo[0]
        ) {

            photo =
                `/uploads/candidates/${req.files.photo[0].filename}`;

        }


        if (
            req.files &&
            req.files.symbolImage &&
            req.files.symbolImage[0]
        ) {

            symbolImage =
                `/uploads/candidates/${req.files.symbolImage[0].filename}`;

        }


        /* ================================
           CREATE CANDIDATE
        ================================= */

        const candidate =
            new Candidate({

                election:
                    election._id,

                name:
                    name.trim(),

                party:
                    party.trim(),

                symbol:
                    symbol.trim(),

                photo,

                symbolImage

            });


        await candidate.save();


        res.status(201).json({

            message:
                "Candidate added successfully",

            candidate

        });


    } catch (error) {

        console.log(error);


        res.status(500).json({
            message: error.message
        });

    }

};


/* =========================================
   GET CANDIDATES
========================================= */

const getCandidates = async (req, res) => {

    try {

        const {
            electionId
        } = req.query;


        if (!electionId) {

            return res.status(400).json({
                message:
                    "Election ID is required"
            });

        }


        /* ================================
           CHECK ELECTION
        ================================= */

        const election =
            await findElection(
                electionId
            );


        if (!election) {

            return res.status(404).json({
                message:
                    "Election not found"
            });

        }


        /* ================================
           GET ONLY THIS ELECTION'S
           CANDIDATES
        ================================= */

        const candidates =
            await Candidate.find({

                election:
                    election._id

            }).sort({

                createdAt: 1

            });


        res.status(200).json({

            candidates

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
   UPDATE CANDIDATE
========================================= */

const updateCandidate = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const {
            name,
            party,
            symbol,
            removePhoto,
            removeSymbolImage
        } = req.body;


        /* ================================
           FIND CANDIDATE
        ================================= */

        const candidate =
            await Candidate.findById(id);


        if (!candidate) {

            return res.status(404).json({
                message:
                    "Candidate not found"
            });

        }


        /* ================================
           FIND ASSOCIATED ELECTION
        ================================= */

        const election =
            await Election.findById(
                candidate.election
            );


        if (!election) {

            return res.status(404).json({
                message:
                    "Associated election not found"
            });

        }


        /* ================================
           PREVENT EDIT AFTER ELECTION ENDS
        ================================= */

        const now =
            new Date();


        if (now >= election.endTime) {

            return res.status(403).json({
                message:
                    "Candidates cannot be edited after the election ends"
            });

        }


        /* ================================
           UPDATE TEXT FIELDS
        ================================= */

        if (name !== undefined) {

            candidate.name =
                name.trim();

        }


        if (party !== undefined) {

            candidate.party =
                party.trim();

        }


        if (symbol !== undefined) {

            candidate.symbol =
                symbol.trim();

        }


        /* ================================
           REMOVE CANDIDATE PHOTO
        ================================= */

        if (
            removePhoto === "true" ||
            removePhoto === true
        ) {

            if (candidate.photo) {

                deleteUploadedFile(
                    candidate.photo
                );

            }

            candidate.photo =
                null;

        }


        /* ================================
           REMOVE SYMBOL IMAGE
        ================================= */

        if (
            removeSymbolImage === "true" ||
            removeSymbolImage === true
        ) {

            if (candidate.symbolImage) {

                deleteUploadedFile(
                    candidate.symbolImage
                );

            }

            candidate.symbolImage =
                null;

        }


        /* ================================
           NEW PHOTO
        ================================= */

        if (
            req.files &&
            req.files.photo &&
            req.files.photo[0]
        ) {

            if (candidate.photo) {

                deleteUploadedFile(
                    candidate.photo
                );

            }


            candidate.photo =
                `/uploads/candidates/${req.files.photo[0].filename}`;

        }


        /* ================================
           NEW SYMBOL IMAGE
        ================================= */

        if (
            req.files &&
            req.files.symbolImage &&
            req.files.symbolImage[0]
        ) {

            if (candidate.symbolImage) {

                deleteUploadedFile(
                    candidate.symbolImage
                );

            }


            candidate.symbolImage =
                `/uploads/candidates/${req.files.symbolImage[0].filename}`;

        }


        await candidate.save();


        res.status(200).json({

            message:
                "Candidate updated successfully",

            candidate

        });


    } catch (error) {

        console.log(error);


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({
                message:
                    "Invalid candidate ID"
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

    addCandidate,

    getCandidates,

    updateCandidate

};