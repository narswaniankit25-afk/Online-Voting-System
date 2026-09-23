import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";
import "./VoterDashboard.css";

function VoterDashboard() {
    const [candidates, setCandidates] = useState([]);
    const [election, setElection] = useState(null);
    const [electionStatus, setElectionStatus] = useState("");

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [votingCandidate, setVotingCandidate] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const [isAdmin, setIsAdmin] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    const navigate = useNavigate();


    /* =========================================
       THEME
    ========================================== */

    useEffect(() => {
        document.body.classList.toggle(
            "dark-mode",
            darkMode
        );

        localStorage.setItem(
            "darkMode",
            darkMode
        );
    }, [darkMode]);


    /* =========================================
       INITIAL LOAD
    ========================================== */

    useEffect(() => {
        checkUserRole();
        getCandidates();
        getElection();
    }, []);


    /* =========================================
       USER ROLE
    ========================================== */

    const checkUserRole = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decodedToken = jwtDecode(token);

            setIsAdmin(
                decodedToken.role === "admin"
            );

        } catch (error) {
            console.log(error);

            localStorage.removeItem("token");

            navigate("/login");
        }
    };


    /* =========================================
       NOTIFICATION
    ========================================== */

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* =========================================
       GET CANDIDATES
    ========================================== */

    const getCandidates = async () => {
        try {
            const response =
                await api.get("/candidates");

            setCandidates(
                response.data.candidates
            );

        } catch (error) {
            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Unable to load candidates",
                "error"
            );
        }
    };


    /* =========================================
       GET ELECTION
    ========================================== */

    const getElection = async () => {
        try {
            const response =
                await api.get("/election");

            setElection(
                response.data.election
            );

            setElectionStatus(
                response.data.status
            );

        } catch (error) {
            console.log(error);

            if (error.response?.status === 404) {

                showMessage(
                    "No election has been created yet.",
                    "error"
                );

            } else {

                showMessage(
                    error.response?.data?.message ||
                    "Unable to load election details",
                    "error"
                );
            }
        }
    };


    /* =========================================
       SEARCH
    ========================================== */

    const filteredCandidates = useMemo(() => {

        const search = searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
            return candidates;
        }

        return candidates.filter((candidate) => {

            const name =
                candidate.name?.toLowerCase() || "";

            const party =
                candidate.party?.toLowerCase() || "";

            const symbol =
                candidate.symbol?.toLowerCase() || "";

            return (
                name.includes(search) ||
                party.includes(search) ||
                symbol.includes(search)
            );
        });

    }, [candidates, searchTerm]);


    /* =========================================
       CANDIDATE PHOTO
    ========================================== */

    const getCandidatePhoto = (photo) => {

        if (!photo) {
            return null;
        }

        if (photo.startsWith("http")) {
            return photo;
        }

        return `http://localhost:5000${photo}`;
    };


    /* =========================================
       OPEN CONFIRMATION
    ========================================== */

    const openVoteConfirmation = (candidate) => {

        if (isAdmin) {
            return;
        }

        if (electionStatus !== "live") {
            return;
        }

        setSelectedCandidate(candidate);
    };


    /* =========================================
       CLOSE CONFIRMATION
    ========================================== */

    const closeVoteConfirmation = () => {

        if (votingCandidate !== null) {
            return;
        }

        setSelectedCandidate(null);
    };


    /* =========================================
       CONFIRM VOTE
    ========================================== */

    const confirmVote = async () => {

        if (!selectedCandidate) {
            return;
        }

        const candidateId =
            selectedCandidate._id;

        setMessage("");
        setMessageType("");

        setVotingCandidate(candidateId);

        try {

            const response =
                await api.post("/vote", {
                    candidateId: candidateId
                });

            showMessage(
                response.data.message ||
                "Vote cast successfully",
                "success"
            );

            setSelectedCandidate(null);

        } catch (error) {

            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Unable to cast vote",
                "error"
            );

        } finally {

            setVotingCandidate(null);
        }
    };


    /* =========================================
       LOGOUT
    ========================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");

        window.location.href = "/login";
    };


    /* =========================================
       FORMAT DATE
    ========================================== */

    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };


    /* =========================================
       ELECTION STATUS
    ========================================== */

    const getStatusText = () => {

        if (electionStatus === "live") {
            return "Live Now";
        }

        if (electionStatus === "not_started") {
            return "Not Started";
        }

        if (electionStatus === "ended") {
            return "Election Ended";
        }

        return "Unavailable";
    };


    const getStatusClass = () => {

        if (electionStatus === "live") {
            return "voter-status-live";
        }

        if (electionStatus === "not_started") {
            return "voter-status-upcoming";
        }

        return "voter-status-ended";
    };


    return (
        <div className="voter-page">

            {/* =====================================
                NAVBAR
            ====================================== */}

            <header className="voter-navbar">

                <div className="voter-navbar-inner">

                    {/* BRAND */}

                    <button
                        className="voter-brand"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >

                        <div className="voter-brand-logo">

                            <svg
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 7h16" />
                                <path d="M6 7v13h12V7" />
                                <path d="M8 7V4h8v3" />
                                <path d="m9 13 2 2 4-4" />
                            </svg>

                        </div>


                        <div className="voter-brand-text">

                            <strong>
                                eVote
                            </strong>

                            <span>
                                Democracy in Your Hands
                            </span>

                        </div>

                    </button>


                    {/* NAVIGATION */}

                    <nav className="voter-main-nav">

                        <button
                            className="voter-nav-link active"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >

                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m3 11 9-8 9 8" />
                                <path d="M5 10v10h14V10" />
                            </svg>

                            Dashboard

                        </button>


                        <button
                            className="voter-nav-link"
                            onClick={() =>
                                navigate("/results")
                            }
                        >

                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line
                                    x1="18"
                                    y1="20"
                                    x2="18"
                                    y2="10"
                                />

                                <line
                                    x1="12"
                                    y1="20"
                                    x2="12"
                                    y2="4"
                                />

                                <line
                                    x1="6"
                                    y1="20"
                                    x2="6"
                                    y2="14"
                                />
                            </svg>

                            Results

                        </button>

                    </nav>


                    {/* RIGHT ACTIONS */}

                    <div className="voter-navbar-actions">

                        <button
                            className="voter-theme-button"
                            onClick={() =>
                                setDarkMode(!darkMode)
                            }
                            aria-label={
                                darkMode
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                        >

                            {darkMode ? (

                                <svg
                                    width="19"
                                    height="19"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="4"
                                    />

                                    <path d="M12 2v2" />
                                    <path d="M12 20v2" />
                                    <path d="M4.93 4.93l1.41 1.41" />
                                    <path d="M17.66 17.66l1.41 1.41" />
                                    <path d="M2 12h2" />
                                    <path d="M20 12h2" />
                                    <path d="M6.34 17.66l-1.41 1.41" />
                                    <path d="M19.07 4.93l-1.41 1.41" />
                                </svg>

                            ) : (

                                <svg
                                    width="19"
                                    height="19"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>

                            )}

                        </button>


                        <div className="voter-profile">

                            <div className="voter-avatar">
                                {isAdmin ? "A" : "V"}
                            </div>

                            <div className="voter-profile-info">

                                <strong>
                                    {isAdmin
                                        ? "Admin"
                                        : "Voter"}
                                </strong>

                                <span>
                                    {isAdmin
                                        ? "Administrator"
                                        : "Voter"}
                                </span>

                            </div>

                        </div>


                        <button
                            className="voter-logout"
                            onClick={handleLogout}
                            title="Logout"
                        >

                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M10 17l5-5-5-5" />
                                <path d="M15 12H3" />
                                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                            </svg>

                        </button>

                    </div>

                </div>

            </header>


            {/* =====================================
                MAIN
            ====================================== */}

            <main className="voter-main">

                {/* HERO */}

                <section className="voter-hero">

                    <div className="voter-hero-content">

                        <span className="voter-hero-label">
                            YOUR VOTE MATTERS
                        </span>

                        <h1>
                            Be the{" "}
                            <span>Change</span>
                        </h1>

                        <p>
                            A fair • secure • transparent
                            election process for a better tomorrow.
                        </p>

                    </div>


                    <div className="voter-hero-illustration">

                        <div className="hero-glow"></div>

                        <div className="ballot-box">

                            <div className="ballot-slot"></div>

                            <div className="ballot-paper">

                                <svg
                                    width="25"
                                    height="25"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M6 2h9l3 3v17H6z" />
                                    <path d="M14 2v4h4" />
                                    <path d="m9 13 2 2 4-4" />
                                </svg>

                            </div>

                            <strong>
                                YOUR
                                <br />
                                VOTE
                                <br />
                                COUNTS
                            </strong>

                        </div>

                    </div>

                </section>


                {/* MESSAGE */}

                {message && (

                    <div
                        className={`voter-notification ${messageType}`}
                    >

                        <span className="notification-icon">

                            {messageType === "success"
                                ? "✓"
                                : "!"}

                        </span>

                        <span>
                            {message}
                        </span>

                        <button
                            onClick={() => {
                                setMessage("");
                                setMessageType("");
                            }}
                            aria-label="Close notification"
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =================================
                    ELECTION STATUS
                ================================== */}

                <section className="voter-election-card">

                    <div className="voter-election-info">

                        <div className="voter-section-title">

                            <h2>
                                Election Status
                            </h2>

                            {election && (

                                <span
                                    className={`voter-status-badge ${getStatusClass()}`}
                                >

                                    <span></span>

                                    {getStatusText()}

                                </span>

                            )}

                        </div>


                        <p>
                            {electionStatus === "live"
                                ? "The election is currently open. You can cast your vote."
                                : electionStatus === "not_started"
                                    ? "Voting will begin at the scheduled start time."
                                    : electionStatus === "ended"
                                        ? "Voting has ended for this election."
                                        : "Election information is currently unavailable."}
                        </p>

                    </div>


                    {election && (

                        <div className="voter-election-times">

                            <div className="voter-time-item">

                                <div className="voter-time-icon">

                                    <svg
                                        width="21"
                                        height="21"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="4"
                                            width="18"
                                            height="18"
                                            rx="2"
                                        />

                                        <line
                                            x1="16"
                                            y1="2"
                                            x2="16"
                                            y2="6"
                                        />

                                        <line
                                            x1="8"
                                            y1="2"
                                            x2="8"
                                            y2="6"
                                        />

                                        <line
                                            x1="3"
                                            y1="10"
                                            x2="21"
                                            y2="10"
                                        />
                                    </svg>

                                </div>

                                <div>

                                    <span>
                                        Start Time
                                    </span>

                                    <strong>
                                        {formatDate(
                                            election.startTime
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div className="voter-time-item">

                                <div className="voter-time-icon">

                                    <svg
                                        width="21"
                                        height="21"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />

                                        <polyline points="12 7 12 12 15 14" />
                                    </svg>

                                </div>

                                <div>

                                    <span>
                                        End Time
                                    </span>

                                    <strong>
                                        {formatDate(
                                            election.endTime
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    )}

                </section>


                {/* =================================
                    CANDIDATES
                ================================== */}

                <section className="voter-candidates-section">

                    <div className="voter-candidates-header">

                        <div>

                            <div className="voter-heading-line">

                                <span></span>

                                <div>

                                    <h2>
                                        Candidates
                                    </h2>

                                    <p>
                                        Choose your preferred candidate
                                        and make your voice heard.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="voter-candidate-tools">

                            <div className="voter-search">

                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="7"
                                    />

                                    <path d="m20 20-4-4" />
                                </svg>

                                <input
                                    type="text"
                                    placeholder="Search candidates..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <span className="voter-candidate-count">
                                {filteredCandidates.length}{" "}
                                {filteredCandidates.length === 1
                                    ? "Candidate"
                                    : "Candidates"}
                            </span>

                        </div>

                    </div>


                    {/* NO CANDIDATES */}

                    {filteredCandidates.length === 0 ? (

                        <div className="voter-empty-state">

                            <div className="voter-empty-icon">

                                <svg
                                    width="34"
                                    height="34"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle
                                        cx="9"
                                        cy="7"
                                        r="4"
                                    />

                                    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />

                                    <line
                                        x1="17"
                                        y1="11"
                                        x2="22"
                                        y2="11"
                                    />

                                    <line
                                        x1="19.5"
                                        y1="8.5"
                                        x2="19.5"
                                        y2="13.5"
                                    />

                                </svg>

                            </div>

                            <h3>
                                No candidates found
                            </h3>

                            <p>
                                Try searching with a different
                                candidate or party name.
                            </p>

                        </div>

                    ) : (

                        <div className="voter-candidate-grid">

                            {filteredCandidates.map(
                                (candidate, index) => (

                                    <article
                                        className="voter-candidate-card"
                                        key={candidate._id}
                                    >

                                        {/* CARD TOP */}

                                        <div className="voter-candidate-top">

                                            <span className="voter-candidate-number">
                                                {String(
                                                    index + 1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </span>


                                            <div className="voter-candidate-visual">

                                                {candidate.photo ? (

                                                    <img
                                                        src={getCandidatePhoto(
                                                            candidate.photo
                                                        )}
                                                        alt={
                                                            candidate.name
                                                        }
                                                        className="voter-candidate-photo"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display =
                                                                "none";

                                                            e.currentTarget.nextElementSibling.style.display =
                                                                "flex";
                                                        }}
                                                    />

                                                ) : null}


                                                <div
                                                    className="voter-candidate-symbol"
                                                    style={{
                                                        display:
                                                            candidate.photo
                                                                ? "none"
                                                                : "flex"
                                                    }}
                                                >
                                                    {candidate.symbol}
                                                </div>

                                            </div>

                                        </div>


                                        {/* CANDIDATE INFO */}

                                        <div className="voter-candidate-info">

                                            <h3>
                                                {candidate.name}
                                            </h3>

                                            <p>
                                                {candidate.party}
                                            </p>

                                        </div>


                                        {/* VOTE */}

                                        {!isAdmin && (

                                            <button
                                                className="voter-vote-button"
                                                onClick={() =>
                                                    openVoteConfirmation(
                                                        candidate
                                                    )
                                                }
                                                disabled={
                                                    electionStatus !==
                                                    "live" ||
                                                    votingCandidate !==
                                                    null
                                                }
                                            >

                                                <span>

                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M4 7h16" />
                                                        <path d="M6 7v13h12V7" />
                                                        <path d="M8 7V4h8v3" />
                                                        <path d="m9 13 2 2 4-4" />
                                                    </svg>

                                                    Vote for this candidate

                                                </span>

                                                <span className="voter-vote-arrow">
                                                    →
                                                </span>

                                            </button>

                                        )}

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================
                    SECURITY
                ================================== */}

                <section className="voter-security-card">

                    <div className="voter-security-icon">

                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />

                            <path d="m9 12 2 2 4-4" />
                        </svg>

                    </div>


                    <div>

                        <strong>
                            Your vote is secure
                        </strong>

                        <p>
                            Your vote is confidential and can
                            only be cast once.
                        </p>

                    </div>


                    <button
                        onClick={() =>
                            navigate("/results")
                        }
                    >
                        View Results
                        <span>→</span>
                    </button>

                </section>

            </main>


            {/* =====================================
                FOOTER
            ====================================== */}

            <footer className="voter-footer">

                <div>

                    <strong>
                        eVote
                    </strong>

                    <span>
                        Democracy in Your Hands
                    </span>

                </div>


                <p>
                    Secure • Transparent • Simple
                </p>

            </footer>


            {/* =====================================
                CONFIRM VOTE MODAL
            ====================================== */}

            {selectedCandidate && (

                <div
                    className="voter-modal-overlay"
                    onClick={closeVoteConfirmation}
                >

                    <div
                        className="voter-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* CLOSE */}

                        <button
                            className="voter-modal-close"
                            onClick={
                                closeVoteConfirmation
                            }
                            disabled={
                                votingCandidate !== null
                            }
                            aria-label="Close"
                        >
                            ×
                        </button>


                        {/* ICON */}

                        <div className="voter-modal-icon">

                            <svg
                                width="29"
                                height="29"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 7h16" />
                                <path d="M6 7v13h12V7" />
                                <path d="M8 7V4h8v3" />
                                <path d="m9 13 2 2 4-4" />
                            </svg>

                        </div>


                        <h2>
                            Confirm Your Vote
                        </h2>


                        <p className="voter-modal-subtitle">
                            Are you sure you want to vote
                            for this candidate?
                        </p>


                        {/* SELECTED CANDIDATE */}

                        <div className="voter-modal-candidate">

                            <div className="voter-modal-photo-wrapper">

                                {selectedCandidate.photo ? (

                                    <img
                                        src={getCandidatePhoto(
                                            selectedCandidate.photo
                                        )}
                                        alt={
                                            selectedCandidate.name
                                        }
                                        className="voter-modal-photo"
                                    />

                                ) : (

                                    <div className="voter-modal-symbol">
                                        {selectedCandidate.symbol}
                                    </div>

                                )}

                            </div>


                            <div>

                                <h3>
                                    {selectedCandidate.name}
                                </h3>

                                <p>
                                    {selectedCandidate.party}
                                </p>

                            </div>

                        </div>


                        {/* WARNING */}

                        <div className="voter-modal-warning">

                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M10.3 3.9 2.1 18a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />

                                <line
                                    x1="12"
                                    y1="9"
                                    x2="12"
                                    y2="13"
                                />

                                <line
                                    x1="12"
                                    y1="17"
                                    x2="12.01"
                                    y2="17"
                                />
                            </svg>

                            <span>
                                Once submitted, your vote
                                cannot be changed.
                            </span>

                        </div>


                        {/* ACTIONS */}

                        <div className="voter-modal-actions">

                            <button
                                className="voter-modal-cancel"
                                onClick={
                                    closeVoteConfirmation
                                }
                                disabled={
                                    votingCandidate !== null
                                }
                            >
                                Cancel
                            </button>


                            <button
                                className="voter-modal-confirm"
                                onClick={confirmVote}
                                disabled={
                                    votingCandidate !== null
                                }
                            >

                                {votingCandidate !== null ? (

                                    <>
                                        <span className="voter-spinner"></span>
                                        Submitting...
                                    </>

                                ) : (

                                    <>
                                        Confirm Vote

                                        <svg
                                            width="17"
                                            height="17"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="m5 12 4 4L19 6" />
                                        </svg>
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default VoterDashboard;