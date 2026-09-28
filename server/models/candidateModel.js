const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
    {
        election: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Election",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        party: {
            type: String,
            required: true,
            trim: true
        },

        symbol: {
            type: String,
            required: true,
            trim: true
        },

        photo: {
            type: String,
            default: null
        },

        symbolImage: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Candidate",
    candidateSchema
);