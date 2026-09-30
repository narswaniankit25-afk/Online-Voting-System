import { useEffect, useMemo, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";
import "./Results.css";


function Results() {

    const navigate = useNavigate();

    const { electionId } = useParams();

    const [results, setResults] = useState([]);
    const [message, setMessage] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    const [isAdmin, setIsAdmin] = useState(false);


    /* =========================================
       DARK MODE
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
       AUTHENTICATION
    ========================================== */

    useEffect(() => {

        const token =
            localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {

            const decodedToken =
                jwtDecode(token);

            setIsAdmin(
                decodedToken.role === "admin"
            );

        } catch (error) {

            console.log(error);

            localStorage.removeItem("token");

            navigate("/login");
        }

    }, [navigate]);


    /* =========================================
       GET RESULTS
    ========================================== */

    useEffect(() => {

        if (!electionId) {

            setMessage(
                "Election ID is missing"
            );

            return;
        }

        getResults();

    }, [electionId]);


    const getResults = async () => {

        try {

            const response =
                await api.get(
                    `/results/${electionId}`
                );

            setResults(
                response.data.results || []
            );

            setMessage("");

        } catch (error) {

            console.log(error);

            setMessage(
                error.response?.data?.message ||
                "Unable to load results"
            );
        }
    };


    /* =========================================
       IMAGE URL
    ========================================== */

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `http://localhost:5000${image}`;
    };


    /* =========================================
       SORT RESULTS
    ========================================== */

    const sortedResults = useMemo(() => {

        return [...results].sort(
            (a, b) => b.votes - a.votes
        );

    }, [results]);


    /* =========================================
       TOTAL VOTES
    ========================================== */

    const totalVotes = useMemo(() => {

        return results.reduce(
            (total, result) =>
                total + Number(result.votes || 0),
            0
        );

    }, [results]);


    /* =========================================
       WINNERS
    ========================================== */

    const winners = useMemo(() => {

        if (results.length === 0) {
            return [];
        }

        const highestVotes =
            Math.max(
                ...results.map(
                    (result) =>
                        Number(result.votes || 0)
                )
            );

        return results.filter(
            (result) =>
                Number(result.votes || 0) ===
                highestVotes
        );

    }, [results]);


    /* =========================================
       PERCENTAGE
    ========================================== */

    const getPercentage = (votes) => {

        if (totalVotes === 0) {
            return "0.0";
        }

        return (
            (Number(votes || 0) /
                totalVotes) *
            100
        ).toFixed(1);
    };


    /* =========================================
       LOGOUT
    ========================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");
    };


    /* =========================================
       DASHBOARD
    ========================================== */

    const handleDashboard = () => {

        if (isAdmin) {
            navigate("/admin");
        } else {
            navigate("/dashboard");
        }
    };


    /* =========================================
       RENDER
    ========================================== */

    return (

        <div className="results-page">

            {/* =====================================
                NAVBAR
            ====================================== */}

            <header className="results-navbar">

                <div className="results-navbar-inner">

                    <div
                        className="results-brand"
                        onClick={handleDashboard}
                    >

                        <div className="results-brand-icon">
                            ✓
                        </div>

                        <div>
                            <strong>eVote</strong>
                            <span>Digital Election System</span>
                        </div>

                    </div>


                    <nav className="results-nav">

                        <button
                            className="results-nav-link"
                            onClick={handleDashboard}
                        >
                            <span>←</span>
                            Dashboard
                        </button>

                    </nav>


                    <div className="results-navbar-actions">

                        <button
                            className="results-theme-button"
                            onClick={() =>
                                setDarkMode(
                                    !darkMode
                                )
                            }
                            title={
                                darkMode
                                    ? "Light mode"
                                    : "Dark mode"
                            }
                        >

                            {darkMode ? "☀" : "☾"}

                        </button>


                        <button
                            className="results-logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* =====================================
                MAIN
            ====================================== */}

            <main className="results-main">

                {/* =================================
                    HERO
                ================================== */}

                <section className="results-hero">

                    <div>

                        <span className="results-hero-label">
                            OFFICIAL ELECTION RESULTS
                        </span>

                        <h1>
                            Election Results
                        </h1>

                        <p>
                            View the final voting outcome
                            and candidate performance.
                        </p>

                    </div>

                    <div className="results-hero-icon">
                        🗳️
                    </div>

                </section>


                {/* =================================
                    ERROR MESSAGE
                ================================== */}

                {message && (

                    <div className="results-message">

                        <span>!</span>

                        <p>
                            {message}
                        </p>

                    </div>

                )}


                {/* =================================
                    WINNER
                ================================== */}

                {winners.length > 0 && (

                    winners.length === 1 ? (

                        <section className="winner-card">

                            <div className="winner-glow"></div>

                            <div className="winner-top">

                                <div className="winner-trophy">
                                    🏆
                                </div>

                                <div>

                                    <span className="winner-label">
                                        ELECTION WINNER
                                    </span>

                                    <p className="winner-subtitle">
                                        Final official result
                                    </p>

                                </div>

                            </div>


                            <div className="winner-main">

                                <div className="winner-photo-area">

                                    <div className="winner-photo-ring">

                                        {winners[0].photo ? (

                                            <img
                                                src={getImageUrl(
                                                    winners[0].photo
                                                )}
                                                alt={
                                                    winners[0].candidate
                                                }
                                                className="winner-photo"
                                                onError={(e) => {

                                                    e.currentTarget.style.display =
                                                        "none";

                                                    const placeholder =
                                                        e.currentTarget
                                                            .nextElementSibling;

                                                    if (placeholder) {
                                                        placeholder.style.display =
                                                            "flex";
                                                    }
                                                }}
                                            />

                                        ) : null}


                                        <div
                                            className="winner-photo-placeholder"
                                            style={{
                                                display:
                                                    winners[0].photo
                                                        ? "none"
                                                        : "flex"
                                            }}
                                        >
                                            {winners[0].candidate
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                        </div>

                                    </div>


                                    <div className="winner-crown">
                                        ★
                                    </div>

                                </div>


                                <div className="winner-details">

                                    <span className="winner-position">
                                        1ST PLACE
                                    </span>

                                    <h2>
                                        {winners[0].candidate}
                                    </h2>

                                    <p className="winner-party">
                                        {winners[0].party}
                                    </p>


                                    <div className="winner-stats">

                                        <div className="winner-stat">

                                            <strong>
                                                {winners[0].votes}
                                            </strong>

                                            <span>
                                                Votes
                                            </span>

                                        </div>


                                        <div className="winner-stat-divider"></div>


                                        <div className="winner-stat">

                                            <strong>
                                                {getPercentage(
                                                    winners[0].votes
                                                )}%
                                            </strong>

                                            <span>
                                                Vote Share
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div className="winner-footer">

                                <span className="winner-check">
                                    ✓
                                </span>

                                Official Election Result

                            </div>

                        </section>

                    ) : (

                        <section className="tie-card">

                            <div className="tie-icon">
                                🤝
                            </div>

                            <div className="tie-content">

                                <span className="tie-label">
                                    ELECTION RESULT
                                </span>

                                <h2>
                                    Election Tie
                                </h2>

                                <p>
                                    The election has ended in a tie
                                    between the following candidates.
                                </p>

                            </div>


                            <div className="tie-candidates">

                                {winners.map(
                                    (winner) => (

                                        <div
                                            className="tie-candidate"
                                            key={
                                                winner.candidate
                                            }
                                        >

                                            <div className="tie-photo">

                                                {winner.photo ? (

                                                    <img
                                                        src={getImageUrl(
                                                            winner.photo
                                                        )}
                                                        alt={
                                                            winner.candidate
                                                        }
                                                        onError={(e) => {

                                                            e.currentTarget.style.display =
                                                                "none";

                                                            e.currentTarget.nextElementSibling.style.display =
                                                                "flex";
                                                        }}
                                                    />

                                                ) : null}


                                                <span
                                                    style={{
                                                        display:
                                                            winner.photo
                                                                ? "none"
                                                                : "flex"
                                                    }}
                                                >
                                                    {winner.candidate
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "?"}
                                                </span>

                                            </div>

                                            <div>

                                                <strong>
                                                    {winner.candidate}
                                                </strong>

                                                <p>
                                                    {winner.party}
                                                </p>

                                                <span>
                                                    {winner.votes} votes
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>

                    )

                )}


                {/* =================================
                    CANDIDATE PERFORMANCE
                ================================== */}

                <section className="performance-section">

                    <div className="results-section-heading">

                        <div>

                            <span className="section-label">
                                VOTING BREAKDOWN
                            </span>

                            <h2>
                                Candidate Performance
                            </h2>

                            <p>
                                Detailed performance of all
                                candidates based on final votes.
                            </p>

                        </div>

                        <div className="candidate-count">

                            <strong>
                                {results.length}
                            </strong>

                            <span>
                                Candidates
                            </span>

                        </div>

                    </div>


                    {sortedResults.length === 0 ? (

                        <div className="results-empty">

                            <div className="results-empty-icon">
                                📊
                            </div>

                            <h3>
                                No results available
                            </h3>

                            <p>
                                Election results will appear
                                here once they are announced.
                            </p>

                        </div>

                    ) : (

                        <div className="performance-list">

                            {sortedResults.map(
                                (result, index) => (

                                    <article
                                        className={
                                            `performance-card ${
                                                index === 0
                                                    ? "performance-winner"
                                                    : ""
                                            }`
                                        }
                                        key={
                                            result.candidate
                                        }
                                    >

                                        <div className="performance-rank">

                                            {index === 0
                                                ? "🏆"
                                                : `#${index + 1}`}

                                        </div>


                                        <div className="performance-photo">

                                            {result.photo ? (

                                                <img
                                                    src={getImageUrl(
                                                        result.photo
                                                    )}
                                                    alt={
                                                        result.candidate
                                                    }
                                                    onError={(e) => {

                                                        e.currentTarget.style.display =
                                                            "none";

                                                        e.currentTarget.nextElementSibling.style.display =
                                                            "flex";
                                                    }}
                                                />

                                            ) : null}


                                            <span
                                                style={{
                                                    display:
                                                        result.photo
                                                            ? "none"
                                                            : "flex"
                                                }}
                                            >
                                                {result.candidate
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "?"}
                                            </span>

                                        </div>


                                        <div className="performance-info">

                                            <div className="performance-name-row">

                                                <div>

                                                    <h3>
                                                        {result.candidate}
                                                    </h3>

                                                    <p>
                                                        {result.party}
                                                    </p>

                                                </div>

                                                {result.symbol && (

                                                    <span className="performance-symbol">
                                                        {result.symbol}
                                                    </span>

                                                )}

                                            </div>


                                            <div className="performance-progress">

                                                <div className="performance-progress-top">

                                                    <span>
                                                        Vote Share
                                                    </span>

                                                    <strong>
                                                        {getPercentage(
                                                            result.votes
                                                        )}%
                                                    </strong>

                                                </div>


                                                <div className="progress-track">

                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width:
                                                                `${getPercentage(
                                                                    result.votes
                                                                )}%`
                                                        }}
                                                    ></div>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="performance-votes">

                                            <strong>
                                                {result.votes}
                                            </strong>

                                            <span>
                                                Votes
                                            </span>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================
                    ELECTION SUMMARY
                ================================== */}

                {results.length > 0 && (

                    <section className="summary-section">

                        <div className="results-section-heading">

                            <div>

                                <span className="section-label">
                                    AT A GLANCE
                                </span>

                                <h2>
                                    Election Summary
                                </h2>

                            </div>

                        </div>


                        <div className="summary-grid">

                            <div className="summary-card">

                                <div className="summary-icon">
                                    🗳️
                                </div>

                                <div>

                                    <strong>
                                        {totalVotes}
                                    </strong>

                                    <span>
                                        Total Votes
                                    </span>

                                </div>

                            </div>


                            <div className="summary-card">

                                <div className="summary-icon">
                                    👥
                                </div>

                                <div>

                                    <strong>
                                        {results.length}
                                    </strong>

                                    <span>
                                        Candidates
                                    </span>

                                </div>

                            </div>


                            <div className="summary-card">

                                <div className="summary-icon">
                                    🏆
                                </div>

                                <div>

                                    <strong>
                                        {winners.length === 1
                                            ? winners[0].candidate
                                            : `${winners.length} Candidates`}
                                    </strong>

                                    <span>
                                        Result
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>

                )}


                {/* =================================
                    BACK BUTTON
                ================================== */}

                <div className="results-back-area">

                    <button
                        className="results-back-button"
                        onClick={handleDashboard}
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </main>


            {/* =====================================
                FOOTER
            ====================================== */}

            <footer className="results-footer">

                <span>
                    eVote Digital Election System
                </span>

                <span>
                    Secure • Transparent • Reliable
                </span>

            </footer>

        </div>
    );
}


export default Results;