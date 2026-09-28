const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose");

const Election = require("../models/electionModel");
const Candidate = require("../models/candidateModel");
const Vote = require("../models/voteModel");


/* =========================================
   MIGRATE EXISTING DATA
========================================= */

const migrateElectionData = async () => {

    try {

        console.log("🔄 Checking election data migration...");


        /* =========================================
           GET EXISTING ELECTIONS
        ========================================== */

        const elections =
            await Election.find({})
                .sort({
                    createdAt: 1
                });


        /*
         * Existing project data was created before
         * multiple-election support.
         *
         * If exactly one election exists, we can
         * safely attach old candidates and votes
         * to that election.
         */

        if (elections.length === 1) {

            const election =
                elections[0];


            /* =========================================
               MIGRATE OLD CANDIDATES
            ========================================== */

            const candidateResult =
                await Candidate.updateMany(
                    {
                        $or: [
                            {
                                election: {
                                    $exists: false
                                }
                            },
                            {
                                election: null
                            }
                        ]
                    },
                    {
                        $set: {
                            election:
                                election._id
                        }
                    }
                );


            if (
                candidateResult.modifiedCount > 0
            ) {

                console.log(
                    `✅ Migrated ${candidateResult.modifiedCount} old candidate(s)`
                );

            }


            /* =========================================
               MIGRATE OLD VOTES
            ========================================== */

            const voteResult =
                await Vote.updateMany(
                    {
                        $or: [
                            {
                                election: {
                                    $exists: false
                                }
                            },
                            {
                                election: null
                            }
                        ]
                    },
                    {
                        $set: {
                            election:
                                election._id
                        }
                    }
                );


            if (
                voteResult.modifiedCount > 0
            ) {

                console.log(
                    `✅ Migrated ${voteResult.modifiedCount} old vote(s)`
                );

            }

        } else if (
            elections.length === 0
        ) {

            console.log(
                "ℹ️ No elections found. Skipping old data migration."
            );

        } else {

            console.log(
                `ℹ️ ${elections.length} elections found. Existing records without an election were not automatically reassigned.`
            );

        }


        /* =========================================
           REMOVE OLD USER-ONLY INDEX
        ========================================== */

        const voteCollection =
            mongoose.connection.collection(
                "votes"
            );


        const indexes =
            await voteCollection.indexes();


        const oldUserIndex =
            indexes.find(
                (index) =>
                    index.name === "user_1"
            );


        if (oldUserIndex) {

            await voteCollection.dropIndex(
                "user_1"
            );

            console.log(
                "✅ Removed old user_1 vote index"
            );

        }


        /* =========================================
           CREATE NEW COMPOUND INDEX
        ========================================== */

        const updatedIndexes =
            await voteCollection.indexes();


        const compoundIndex =
            updatedIndexes.find(
                (index) =>
                    index.name ===
                    "user_1_election_1"
            );


        if (!compoundIndex) {

            await voteCollection.createIndex(
                {
                    user: 1,
                    election: 1
                },
                {
                    unique: true,
                    name:
                        "user_1_election_1"
                }
            );

            console.log(
                "✅ Created user_1_election_1 index"
            );

        } else {

            console.log(
                "✅ Compound vote index already exists"
            );

        }


        console.log(
            "✅ Election data migration completed"
        );

    } catch (error) {

        console.error(
            "❌ Election data migration failed:",
            error
        );

        throw error;

    }

};


/* =========================================
   CONNECT DATABASE
========================================= */

const connectDB = async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URI
        );


        console.log(
            "✅ MongoDB Connected Successfully"
        );


        /* =========================================
           RUN MIGRATION
        ========================================== */

        await migrateElectionData();

    } catch (error) {

        console.error(
            "❌ MongoDB Connection/Migration Failed:",
            error
        );

        process.exit(1);

    }

};


/* =========================================
   EXPORT
========================================= */

module.exports = connectDB;