
const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const User = require("../models/userModel");
const Election = require("../models/electionModel");
const Candidate = require("../models/candidateModel");

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL ||
    "http://127.0.0.1:8000";

function getElectionStatus(election) {
    const now = new Date();

    if (now < new Date(election.startTime)) {
        return "not_started";
    }

    if (now > new Date(election.endTime)) {
        return "ended";
    }

    return "live";
}

// POST /ai/chat
router.post(
    "/ai/chat",
    authMiddleware,
    async (req, res) => {
        try {
            const question =
                typeof req.body.question === "string"
                    ? req.body.question.trim()
                    : "";

            const electionId =
                typeof req.body.electionId === "string"
                    ? req.body.electionId.trim()
                    : "";

            if (!question || question.length > 1000) {
                return res.status(400).json({
                    message:
                        "Question is required and must not exceed 1000 characters."
                });
            }

            if (
                !electionId ||
                !/^[a-f\d]{24}$/i.test(electionId)
            ) {
                return res.status(400).json({
                    message: "A valid electionId is required."
                });
            }

            // Find the logged-in user.
            const user = await User.findById(
                req.user.userId
            ).select("_id role elections");

            if (!user) {
                return res.status(401).json({
                    message: "User account not found."
                });
            }

            // This endpoint is for registered voters.
            if (user.role !== "user") {
                return res.status(403).json({
                    message:
                        "The voter AI assistant is only available to registered voters."
                });
            }

            // Verify the voter is assigned to this election.
            const isAssigned =
                Array.isArray(user.elections) &&
                user.elections.some(
                    (id) =>
                        id.toString() === electionId
                );

            if (!isAssigned) {
                return res.status(403).json({
                    message:
                        "You are not registered for this election."
                });
            }

            const election =
                await Election.findById(electionId)
                    .select(
                        "title startTime endTime resultsAnnounced"
                    )
                    .lean();

            if (!election) {
                return res.status(404).json({
                    message: "Election not found."
                });
            }

            // Fetch only candidates belonging to this election.
            const candidates =
                await Candidate.find({
                    election: election._id
                })
                    .select("name party symbol")
                    .sort({ name: 1 })
                    .lean();

            // Only send public, permitted information to AI.
            const electionContext = {
                title: election.title || "Election",
                status: getElectionStatus(election),
                startTime:
                    election.startTime.toISOString(),
                endTime:
                    election.endTime.toISOString(),
                resultsAnnounced:
                    election.resultsAnnounced === true,
                candidates: candidates.map(
                    (candidate) => ({
                        name: candidate.name,
                        party: candidate.party,
                        symbol: candidate.symbol
                    })
                ),
                totalVotes: null,
                results: []
            };

            const controller =
                new AbortController();

            const timeout = setTimeout(
                () => controller.abort(),
                30000
            );

            let aiResponse;

            try {
                aiResponse = await fetch(
                    `${AI_SERVICE_URL}/chat`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            question,
                            election: electionContext
                        }),
                        signal: controller.signal
                    }
                );
            } finally {
                clearTimeout(timeout);
            }

            const responseData =
                await aiResponse.json().catch(
                    () => ({})
                );

            if (!aiResponse.ok) {
                console.error(
                    "AI service error:",
                    aiResponse.status,
                    responseData
                );

                return res.status(502).json({
                    message:
                        responseData.detail ||
                        "The AI service could not answer your question."
                });
            }

            return res.status(200).json({
                answer: responseData.answer,
                election: {
                    id: election._id,
                    title: election.title
                }
            });
        } catch (error) {
            if (error.name === "AbortError") {
                return res.status(504).json({
                    message:
                        "The AI took too long to respond. Please try again."
                });
            }

            console.error(
                "AI chat route error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to process your AI request."
            });
        }
    }
);

module.exports = router;
