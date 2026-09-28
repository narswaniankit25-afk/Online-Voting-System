const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: "Election"
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        resultsAnnounced: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Election",
    electionSchema
);