const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
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
});

const Election = mongoose.model("Election", electionSchema);

module.exports = Election;