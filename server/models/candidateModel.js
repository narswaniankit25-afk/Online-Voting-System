const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
    {
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


const Candidate =
    mongoose.model(
        "Candidate",
        candidateSchema
    );


module.exports = Candidate;