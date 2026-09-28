const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        /*
        =========================================
        USER ELECTIONS
        =========================================

        A voter can be associated with multiple
        elections.

        Example:

        elections: [
            electionId1,
            electionId2,
            electionId3
        ]

        If a voter has only one election:
        elections: [electionId1]
        */
        elections: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Election"
            }
        ]
    },
    {
        timestamps: true
    }
);

const User = mongoose.model(
    "User",
    userSchema
);

module.exports = User;