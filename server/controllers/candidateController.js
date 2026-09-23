const Candidate = require("../models/candidateModel");
const fs = require("fs");
const path = require("path");


const deleteFile = (fileUrl) => {

    if (!fileUrl) {
        return;
    }

    const filePath = path.join(
        __dirname,
        "..",
        fileUrl.replace(/^\/+/, "")
    );

    fs.unlink(filePath, (error) => {

        if (error && error.code !== "ENOENT") {
            console.log(
                "Unable to delete old file:",
                error.message
            );
        }
    });
};


/* =========================================
   ADD CANDIDATE
========================================= */

const addCandidate = async (req, res) => {

    try {

        const {
            name,
            party,
            symbol
        } = req.body;


        if (!name || !party || !symbol) {

            return res.status(400).json({
                message:
                    "Candidate name, party and symbol are required"
            });
        }


        let candidatePhoto = null;
        let symbolImage = null;


        if (req.files?.photo?.[0]) {

            candidatePhoto =
                `/uploads/candidates/${req.files.photo[0].filename}`;
        }


        if (req.files?.symbolImage?.[0]) {

            symbolImage =
                `/uploads/candidates/${req.files.symbolImage[0].filename}`;
        }


        const candidate = new Candidate({

            name: name.trim(),

            party: party.trim(),

            symbol: symbol.trim(),

            photo: candidatePhoto,

            symbolImage: symbolImage

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

        const candidates =
            await Candidate.find()
                .sort({ createdAt: 1 });


        res.status(200).json({
            candidates
        });

    } catch (error) {

        console.log(error);

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

        const { id } = req.params;

        const {
            name,
            party,
            symbol,
            removePhoto,
            removeSymbolImage
        } = req.body;


        const candidate =
            await Candidate.findById(id);


        if (!candidate) {

            return res.status(404).json({
                message: "Candidate not found"
            });
        }


        if (!name || !party || !symbol) {

            return res.status(400).json({
                message:
                    "Candidate name, party and symbol are required"
            });
        }


        /*
         * Update basic candidate information
         */

        candidate.name = name.trim();

        candidate.party = party.trim();

        candidate.symbol = symbol.trim();


        /*
         * Handle candidate photo
         */

        if (req.files?.photo?.[0]) {

            // Delete previous photo
            if (candidate.photo) {
                deleteFile(candidate.photo);
            }

            candidate.photo =
                `/uploads/candidates/${req.files.photo[0].filename}`;

        } else if (removePhoto === "true") {

            if (candidate.photo) {
                deleteFile(candidate.photo);
            }

            candidate.photo = null;
        }


        /*
         * Handle symbol image
         */

        if (req.files?.symbolImage?.[0]) {

            // Delete previous symbol image
            if (candidate.symbolImage) {
                deleteFile(candidate.symbolImage);
            }

            candidate.symbolImage =
                `/uploads/candidates/${req.files.symbolImage[0].filename}`;

        } else if (removeSymbolImage === "true") {

            if (candidate.symbolImage) {
                deleteFile(candidate.symbolImage);
            }

            candidate.symbolImage = null;
        }


        await candidate.save();


        res.status(200).json({

            message:
                "Candidate updated successfully",

            candidate

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {

    addCandidate,

    getCandidates,

    updateCandidate

};