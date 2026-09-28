const Election = require("../models/electionModel");


/* =========================================
   ELECTION MIDDLEWARE
========================================= */

const electionMiddleware = async (req, res, next) => {

    try {

        /*
         * Election ID can come from:
         *
         * 1. URL parameter
         * 2. Request body
         * 3. Query parameter
         *
         * This makes the middleware reusable
         * for different election-related routes.
         */

        const electionId =
            req.params.electionId ||
            req.body.electionId ||
            req.query.electionId;


        /* =========================================
           CHECK ELECTION ID
        ========================================== */

        if (!electionId) {

            return res.status(400).json({

                message:
                    "Election ID is required"

            });

        }


        /* =========================================
           FIND ELECTION
        ========================================== */

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


        /* =========================================
           CHECK ELECTION TIME
        ========================================== */

        const now =
            new Date();


        /*
         * Voting has not started.
         */

        if (
            now < election.startTime
        ) {

            return res.status(403).json({

                message:
                    "Voting has not started yet"

            });

        }


        /*
         * Voting has ended.
         */

        if (
            now >= election.endTime
        ) {

            return res.status(403).json({

                message:
                    "Voting has ended"

            });

        }


        /* =========================================
           ATTACH ELECTION TO REQUEST
        ========================================== */

        req.election =
            election;


        /* =========================================
           CONTINUE
        ========================================== */

        next();


    } catch (error) {

        console.log(error);


        /*
         * Invalid MongoDB ObjectId
         */

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

            message:
                error.message

        });

    }

};


/* =========================================
   EXPORT
========================================= */

module.exports =
    electionMiddleware;