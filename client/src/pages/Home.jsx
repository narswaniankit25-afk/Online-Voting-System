import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setIsLoggedIn(false);
            setIsAdmin(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);

            if (
                decoded.exp &&
                decoded.exp * 1000 < Date.now()
            ) {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setIsAdmin(false);
                return;
            }

            setIsLoggedIn(true);
            setIsAdmin(decoded.role === "admin");
        } catch (error) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setIsAdmin(false);
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode((previous) => !previous);
    };

    const goToDashboard = () => {
        if (isAdmin) {
            navigate("/admin");
        } else {
            navigate("/dashboard");
        }
    };

    const handleGetStarted = () => {
        if (isLoggedIn) {
            goToDashboard();
        } else {
            navigate("/register");
        }
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    const faqs = [
        {
            question: "Who can use eVote?",
            answer:
                "eVote provides separate experiences for voters and administrators. Authorized voters can access the voting dashboard, while administrators can manage elections and candidates."
        },
        {
            question: "Can a voter vote more than once?",
            answer:
                "The voting system uses backend validation to prevent duplicate voting by the same authenticated user."
        },
        {
            question: "When are election results displayed?",
            answer:
                "Results are controlled by the election workflow and can be displayed after the election has ended and results have been officially announced."
        },
        {
            question: "Can administrators manage candidates?",
            answer:
                "Yes. Authorized administrators can add and update candidate information, including candidate details and visual assets."
        }
    ];

    return (
        <div className="home-page">

            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <header className="home-navbar">

                <div className="home-nav-container">

                    <button
                        type="button"
                        className="home-brand"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            })
                        }
                    >

                        <div className="home-brand-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 3L20 7V11C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 11V7L12 3Z" />
                                <path d="M9 12L11 14L15 10" />
                            </svg>
                        </div>

                        <div className="home-brand-text">
                            <span>eVote</span>
                            <small>Secure Digital Voting</small>
                        </div>

                    </button>


                    <nav className="home-nav-links">

                        <button
                            type="button"
                            onClick={() => scrollToSection("features")}
                        >
                            Features
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("how-it-works")
                            }
                        >
                            How It Works
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("security")
                            }
                        >
                            Security
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("faq")
                            }
                        >
                            FAQ
                        </button>

                    </nav>


                    <div className="home-nav-actions">

                        <button
                            type="button"
                            className="home-theme-button"
                            onClick={toggleDarkMode}
                            title="Toggle theme"
                        >
                            {darkMode ? (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="4"
                                    />
                                    <path d="M12 2V4" />
                                    <path d="M12 20V22" />
                                    <path d="M4.93 4.93L6.34 6.34" />
                                    <path d="M17.66 17.66L19.07 19.07" />
                                    <path d="M2 12H4" />
                                    <path d="M20 12H22" />
                                    <path d="M4.93 19.07L6.34 17.66" />
                                    <path d="M17.66 6.34L19.07 4.93" />
                                </svg>
                            ) : (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3C11 3.63 10.9 4.3 10.9 5C10.9 9.42 14.58 13.1 19 13.1C19.7 13.1 20.37 13 21 12.79Z" />
                                </svg>
                            )}
                        </button>


                        {isLoggedIn ? (
                            <button
                                type="button"
                                className="home-login-button"
                                onClick={goToDashboard}
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="home-login-button"
                                    onClick={handleLogin}
                                >
                                    Login
                                </button>

                                <button
                                    type="button"
                                    className="home-nav-register"
                                    onClick={handleGetStarted}
                                >
                                    Get Started
                                </button>
                            </>
                        )}

                    </div>

                </div>

            </header>


            <main>

                {/* =====================================================
                    HERO
                ===================================================== */}

                <section className="home-hero">

                    <div className="home-hero-background">
                        <div className="hero-glow hero-glow-one"></div>
                        <div className="hero-glow hero-glow-two"></div>
                    </div>


                    <div className="home-hero-container">

                        <div className="home-hero-content">

                            <div className="home-eyebrow">
                                <span className="home-eyebrow-dot"></span>
                                Secure • Transparent • Digital
                            </div>


                            <h1>
                                Your Vote.
                                <br />
                                <span>Your Voice.</span>
                            </h1>


                            <p className="home-hero-description">
                                A modern digital voting platform designed
                                to make elections simpler, safer and more
                                transparent for voters and administrators.
                            </p>


                            <div className="home-hero-buttons">

                                <button
                                    type="button"
                                    className="home-primary-button"
                                    onClick={handleGetStarted}
                                >
                                    {isLoggedIn
                                        ? "Open Dashboard"
                                        : "Get Started"}

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M5 12H19" />
                                        <path d="M12 5L19 12L12 19" />
                                    </svg>
                                </button>


                                <button
                                    type="button"
                                    className="home-secondary-button"
                                    onClick={() =>
                                        scrollToSection(
                                            "how-it-works"
                                        )
                                    }
                                >
                                    Explore Platform
                                </button>

                            </div>


                            <div className="home-hero-trust">

                                <div className="trust-avatars">

                                    <span>V</span>
                                    <span>A</span>
                                    <span>E</span>
                                    <span>+</span>

                                </div>

                                <div>
                                    <strong>Built for modern elections</strong>
                                    <small>
                                        Designed for simple and secure voting
                                    </small>
                                </div>

                            </div>

                        </div>


                        {/* HERO DASHBOARD */}

                        <div className="home-hero-visual">

                            <div className="home-orbit orbit-one"></div>
                            <div className="home-orbit orbit-two"></div>


                            <div className="hero-dashboard-card">

                                <div className="hero-dashboard-header">

                                    <div>
                                        <span>EVOTE DASHBOARD</span>
                                        <strong>Presidential Election</strong>
                                    </div>

                                    <div className="live-badge">
                                        <i></i>
                                        LIVE
                                    </div>

                                </div>


                                <div className="hero-dashboard-stats">

                                    <div>
                                        <span>Total Candidates</span>
                                        <strong>04</strong>
                                    </div>

                                    <div>
                                        <span>Election Status</span>
                                        <strong className="active-text">
                                            Active
                                        </strong>
                                    </div>

                                </div>


                                <div className="hero-ballot-title">
                                    Select Candidate
                                </div>


                                <div className="hero-candidate selected">

                                    <div className="candidate-avatar">
                                        A
                                    </div>

                                    <div className="candidate-info">
                                        <strong>Candidate A</strong>
                                        <span>Progressive Alliance</span>
                                    </div>

                                    <div className="candidate-check">
                                        ✓
                                    </div>

                                </div>


                                <div className="hero-candidate">

                                    <div className="candidate-avatar avatar-two">
                                        B
                                    </div>

                                    <div className="candidate-info">
                                        <strong>Candidate B</strong>
                                        <span>National Development Party</span>
                                    </div>

                                    <div className="candidate-radio"></div>

                                </div>


                                <div className="hero-candidate">

                                    <div className="candidate-avatar avatar-three">
                                        C
                                    </div>

                                    <div className="candidate-info">
                                        <strong>Candidate C</strong>
                                        <span>People's Democratic Front</span>
                                    </div>

                                    <div className="candidate-radio"></div>

                                </div>


                                <button
                                    type="button"
                                    className="hero-vote-button"
                                    onClick={handleGetStarted}
                                >
                                    Continue to Vote
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M5 12H19" />
                                        <path d="M12 5L19 12L12 19" />
                                    </svg>
                                </button>


                                <div className="hero-secure-line">

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M12 3L20 7V11C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 11V7L12 3Z" />
                                        <path d="M9 12L11 14L15 10" />
                                    </svg>

                                    Secure voting session

                                </div>

                            </div>


                            <div className="hero-floating-card floating-one">

                                <div className="floating-icon blue">
                                    ✓
                                </div>

                                <div>
                                    <strong>Vote Protected</strong>
                                    <span>Secure authentication</span>
                                </div>

                            </div>


                            <div className="hero-floating-card floating-two">

                                <div className="floating-icon green">
                                    ✓
                                </div>

                                <div>
                                    <strong>Vote Recorded</strong>
                                    <span>Successfully submitted</span>
                                </div>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="home-scroll-indicator"
                        onClick={() =>
                            scrollToSection("platform-stats")
                        }
                    >
                        <span>Scroll to explore</span>

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M6 9L12 15L18 9" />
                        </svg>

                    </button>

                </section>


                {/* =====================================================
                    STATS
                ===================================================== */}

                <section
                    id="platform-stats"
                    className="home-stats-section"
                >

                    <div className="home-stats-container">

                        <div className="home-stat">
                            <strong>01</strong>
                            <span>Secure Voting Flow</span>
                        </div>

                        <div className="home-stat">
                            <strong>24/7</strong>
                            <span>Platform Accessibility</span>
                        </div>

                        <div className="home-stat">
                            <strong>100%</strong>
                            <span>Authenticated Access</span>
                        </div>

                        <div className="home-stat">
                            <strong>1×</strong>
                            <span>Vote Per User</span>
                        </div>

                    </div>

                </section>


                {/* =====================================================
                    FEATURES
                ===================================================== */}

                <section
                    id="features"
                    className="home-features-section"
                >

                    <div className="home-section-heading">

                        <span className="home-section-label">
                            POWERFUL FEATURES
                        </span>

                        <h2>
                            Everything you need for
                            <span> better elections.</span>
                        </h2>

                        <p>
                            From voter authentication to result
                            publication, eVote brings the complete
                            election workflow together.
                        </p>

                    </div>


                    <div className="home-feature-grid">

                        <article className="home-feature-card">

                            <div className="home-feature-icon blue-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect
                                        x="5"
                                        y="11"
                                        width="14"
                                        height="10"
                                        rx="2"
                                    />
                                    <path d="M8 11V7A4 4 0 0 1 16 7V11" />
                                </svg>
                            </div>

                            <h3>Secure Voting</h3>

                            <p>
                                Authentication and protected workflows
                                help keep the voting process controlled.
                            </p>

                            <span className="feature-link">
                                Protected workflow →
                            </span>

                        </article>


                        <article className="home-feature-card">

                            <div className="home-feature-icon purple-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 19V5" />
                                    <path d="M4 19H20" />
                                    <path d="M7 16L11 11L14 14L20 7" />
                                </svg>
                            </div>

                            <h3>Transparent Results</h3>

                            <p>
                                Candidate performance and election
                                results can be presented clearly.
                            </p>

                            <span className="feature-link">
                                Clear result view →
                            </span>

                        </article>


                        <article className="home-feature-card">

                            <div className="home-feature-icon green-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M16 21V19C16 16.79 14.21 15 12 15H6C3.79 15 2 16.79 2 19V21" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M19 8V14" />
                                    <path d="M22 11H16" />
                                </svg>
                            </div>

                            <h3>Easy to Use</h3>

                            <p>
                                A simple interface helps voters move
                                through registration and voting quickly.
                            </p>

                            <span className="feature-link">
                                Simple experience →
                            </span>

                        </article>


                        <article className="home-feature-card">

                            <div className="home-feature-icon orange-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 3L20 7V11C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 11V7L12 3Z" />
                                    <path d="M9 12L11 14L15 10" />
                                </svg>
                            </div>

                            <h3>Admin Control</h3>

                            <p>
                                Authorized administrators can manage
                                candidates and election settings.
                            </p>

                            <span className="feature-link">
                                Central management →
                            </span>

                        </article>


                        <article className="home-feature-card">

                            <div className="home-feature-icon cyan-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 6H20" />
                                    <path d="M4 12H20" />
                                    <path d="M4 18H20" />
                                    <circle cx="8" cy="6" r="2" />
                                    <circle cx="16" cy="12" r="2" />
                                    <circle cx="10" cy="18" r="2" />
                                </svg>
                            </div>

                            <h3>Election Management</h3>

                            <p>
                                Manage election timing and result
                                publication from one administration area.
                            </p>

                            <span className="feature-link">
                                Organized management →
                            </span>

                        </article>


                        <article className="home-feature-card">

                            <div className="home-feature-icon red-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 3V21" />
                                    <path d="M5 7H19" />
                                    <path d="M5 17H19" />
                                    <path d="M7 7L4 12L7 17" />
                                    <path d="M17 7L20 12L17 17" />
                                </svg>
                            </div>

                            <h3>Reliable Validation</h3>

                            <p>
                                Backend checks help enforce voting rules
                                and protect election actions.
                            </p>

                            <span className="feature-link">
                                Backend protected →
                            </span>

                        </article>

                    </div>

                </section>


                {/* =====================================================
                    HOW IT WORKS
                ===================================================== */}

                <section
                    id="how-it-works"
                    className="home-process-section"
                >

                    <div className="home-section-heading">

                        <span className="home-section-label">
                            HOW IT WORKS
                        </span>

                        <h2>
                            Voting made
                            <span> simple.</span>
                        </h2>

                        <p>
                            A clear four-step journey from registration
                            to the final election result.
                        </p>

                    </div>


                    <div className="home-process-grid">

                        <article className="home-process-card">

                            <span className="process-step">
                                01
                            </span>

                            <div className="home-process-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M16 21V19C16 16.79 14.21 15 12 15H6C3.79 15 2 16.79 2 19V21" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M19 8V14" />
                                    <path d="M22 11H16" />
                                </svg>
                            </div>

                            <h3>Create Account</h3>

                            <p>
                                Register and securely access your
                                personalized voter dashboard.
                            </p>

                        </article>


                        <article className="home-process-card">

                            <span className="process-step">
                                02
                            </span>

                            <div className="home-process-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect
                                        x="4"
                                        y="4"
                                        width="16"
                                        height="16"
                                        rx="2"
                                    />
                                    <path d="M8 9H16" />
                                    <path d="M8 13H16" />
                                    <path d="M8 17H12" />
                                </svg>
                            </div>

                            <h3>View Candidates</h3>

                            <p>
                                Review available candidates and their
                                election information.
                            </p>

                        </article>


                        <article className="home-process-card">

                            <span className="process-step">
                                03
                            </span>

                            <div className="home-process-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 5H20V19H4Z" />
                                    <path d="M8 9H16" />
                                    <path d="M8 13H16" />
                                    <path d="M8 17H13" />
                                </svg>
                            </div>

                            <h3>Cast Your Vote</h3>

                            <p>
                                Select your candidate and submit your
                                vote through the protected workflow.
                            </p>

                        </article>


                        <article className="home-process-card">

                            <span className="process-step">
                                04
                            </span>

                            <div className="home-process-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 19V5" />
                                    <path d="M4 19H20" />
                                    <path d="M7 16L11 12L14 14L20 8" />
                                </svg>
                            </div>

                            <h3>View Results</h3>

                            <p>
                                After announcement, explore the final
                                election results and performance.
                            </p>

                        </article>

                    </div>

                </section>


                {/* =====================================================
                    SECURITY
                ===================================================== */}

                <section
                    id="security"
                    className="home-security-section"
                >

                    <div className="home-security-grid">

                        <div className="home-security-content">

                            <span className="home-section-label">
                                SECURITY FIRST
                            </span>

                            <h2>
                                Your vote deserves
                                <span> protection.</span>
                            </h2>

                            <p>
                                eVote is structured around authenticated
                                access, controlled voting and protected
                                administration.
                            </p>


                            <div className="home-security-list">

                                <div className="home-security-item">

                                    <div className="home-security-check">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            Authenticated Access
                                        </strong>

                                        <span>
                                            Protected features are available
                                            to authenticated users.
                                        </span>
                                    </div>

                                </div>


                                <div className="home-security-item">

                                    <div className="home-security-check">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            One Vote Per User
                                        </strong>

                                        <span>
                                            Backend validation helps prevent
                                            duplicate voting.
                                        </span>
                                    </div>

                                </div>


                                <div className="home-security-item">

                                    <div className="home-security-check">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            Protected Administration
                                        </strong>

                                        <span>
                                            Administrative actions are
                                            restricted to authorized users.
                                        </span>
                                    </div>

                                </div>


                                <div className="home-security-item">

                                    <div className="home-security-check">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            Controlled Results
                                        </strong>

                                        <span>
                                            Results follow the election
                                            lifecycle and announcement process.
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="home-security-visual">

                            <div className="home-security-panel">

                                <div className="security-panel-top">

                                    <div className="security-panel-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M12 3L20 7V11C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 11V7L12 3Z" />
                                            <path d="M9 12L11 14L15 10" />
                                        </svg>
                                    </div>

                                    <div>
                                        <strong>
                                            eVote Security
                                        </strong>

                                        <span>
                                            Platform protection status
                                        </span>
                                    </div>

                                    <div className="security-live">
                                        <i></i>
                                        Active
                                    </div>

                                </div>


                                <div className="security-progress">

                                    <span></span>

                                </div>


                                <div className="security-row">
                                    <span>Authentication</span>
                                    <strong>Protected</strong>
                                </div>

                                <div className="security-row">
                                    <span>Voting System</span>
                                    <strong>Protected</strong>
                                </div>

                                <div className="security-row">
                                    <span>Candidate Data</span>
                                    <strong>Protected</strong>
                                </div>

                                <div className="security-row">
                                    <span>Election Results</span>
                                    <strong>Controlled</strong>
                                </div>


                                <div className="security-bottom-card">

                                    <div className="security-check-large">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            Security checks active
                                        </strong>

                                        <span>
                                            Voting environment ready
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    VOTER / ADMIN
                ===================================================== */}

                <section className="home-roles-section">

                    <div className="home-section-heading">

                        <span className="home-section-label">
                            ONE PLATFORM
                        </span>

                        <h2>
                            Built for both
                            <span> voters and admins.</span>
                        </h2>

                        <p>
                            Different roles, different responsibilities,
                            one connected election platform.
                        </p>

                    </div>


                    <div className="home-role-grid">

                        <div className="home-role-card voter-role">

                            <div className="role-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="8" r="3" />
                                    <path d="M5 21C5 17.13 8.13 14 12 14C15.87 14 19 17.13 19 21" />
                                </svg>
                            </div>

                            <span className="role-label">
                                FOR VOTERS
                            </span>

                            <h3>
                                A simple voting experience
                            </h3>

                            <p>
                                Everything a voter needs in one clean
                                dashboard.
                            </p>

                            <ul>
                                <li>Secure account access</li>
                                <li>View election candidates</li>
                                <li>Cast your vote</li>
                                <li>Vote status confirmation</li>
                                <li>View announced results</li>
                            </ul>

                            <button
                                type="button"
                                onClick={handleGetStarted}
                            >
                                Start Voting →
                            </button>

                        </div>


                        <div className="home-role-card admin-role">

                            <div className="role-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 3L20 7V11C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 11V7L12 3Z" />
                                    <path d="M9 12L11 14L15 10" />
                                </svg>
                            </div>

                            <span className="role-label">
                                FOR ADMINISTRATORS
                            </span>

                            <h3>
                                Complete election management
                            </h3>

                            <p>
                                Centralized tools for managing the
                                election lifecycle.
                            </p>

                            <ul>
                                <li>Create and manage elections</li>
                                <li>Add candidate information</li>
                                <li>Manage candidate images</li>
                                <li>Control result announcement</li>
                                <li>Monitor election status</li>
                            </ul>

                            <button
                                type="button"
                                onClick={handleLogin}
                            >
                                Admin Login →

                            </button>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    ELECTION PREVIEW
                ===================================================== */}

                <section className="home-preview-section">

                    <div className="home-preview-container">

                        <div className="preview-content">

                            <span className="home-section-label">
                                ELECTION INSIGHTS
                            </span>

                            <h2>
                                Understand your election
                                <span> at a glance.</span>
                            </h2>

                            <p>
                                A structured results experience makes
                                candidate performance and election
                                information easy to understand.
                            </p>

                            <button
                                type="button"
                                onClick={handleGetStarted}
                                className="preview-button"
                            >
                                Explore Dashboard →
                            </button>

                        </div>


                        <div className="preview-dashboard">

                            <div className="preview-dashboard-header">

                                <div>
                                    <span>RESULT OVERVIEW</span>
                                    <strong>Election Results</strong>
                                </div>

                                <div className="result-pill">
                                    Official
                                </div>

                            </div>


                            <div className="preview-total">

                                <span>Total Votes</span>

                                <strong>1,248</strong>

                                <small>
                                    Votes recorded
                                </small>

                            </div>


                            <div className="preview-bars">

                                <div className="preview-bar-row">
                                    <span>Candidate A</span>

                                    <div className="preview-bar">
                                        <i style={{ width: "72%" }}></i>
                                    </div>

                                    <strong>72%</strong>
                                </div>


                                <div className="preview-bar-row">
                                    <span>Candidate B</span>

                                    <div className="preview-bar">
                                        <i style={{ width: "54%" }}></i>
                                    </div>

                                    <strong>54%</strong>
                                </div>


                                <div className="preview-bar-row">
                                    <span>Candidate C</span>

                                    <div className="preview-bar">
                                        <i style={{ width: "37%" }}></i>
                                    </div>

                                    <strong>37%</strong>
                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    FAQ
                ===================================================== */}

                <section
                    id="faq"
                    className="home-faq-section"
                >

                    <div className="home-section-heading">

                        <span className="home-section-label">
                            FAQ
                        </span>

                        <h2>
                            Questions?
                            <span> We have answers.</span>
                        </h2>

                        <p>
                            Some common questions about the eVote platform.
                        </p>

                    </div>


                    <div className="home-faq-list">

                        {faqs.map((faq, index) => (
                            <details
                                className="home-faq-item"
                                key={index}
                            >

                                <summary>

                                    <span>
                                        {faq.question}
                                    </span>

                                    <b>+</b>

                                </summary>

                                <p>
                                    {faq.answer}
                                </p>

                            </details>
                        ))}

                    </div>

                </section>


                {/* =====================================================
                    FINAL CTA
                ===================================================== */}

                <section className="home-cta-section">

                    <div className="home-cta-card">

                        <div className="cta-orb cta-orb-one"></div>
                        <div className="cta-orb cta-orb-two"></div>

                        <div className="home-cta-content">

                            <span className="home-cta-label">
                                READY TO PARTICIPATE?
                            </span>

                            <h2>
                                Make your voice count.
                            </h2>

                            <p>
                                Experience a simple and secure digital
                                voting platform built for modern elections.
                            </p>

                            <button
                                type="button"
                                className="home-cta-button"
                                onClick={handleGetStarted}
                            >
                                {isLoggedIn
                                    ? "Open Dashboard"
                                    : "Get Started"}

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M5 12H19" />
                                    <path d="M12 5L19 12L12 19" />
                                </svg>
                            </button>

                        </div>

                    </div>

                </section>

            </main>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="home-footer">

                <div className="home-footer-main">

                    <div className="footer-brand-area">

                        <div className="home-footer-brand-top">

                            <div className="home-brand-icon">

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 3L20 7V11C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 11V7L12 3Z" />
                                    <path d="M9 12L11 14L15 10" />
                                </svg>

                            </div>

                            <div className="home-brand-text">

                                <span>eVote</span>

                                <small>
                                    Secure Digital Voting
                                </small>

                            </div>

                        </div>

                        <p>
                            A modern digital voting platform focused on
                            secure elections, simple voter experiences
                            and organized election management.
                        </p>

                    </div>


                    <div className="home-footer-column">

                        <h4>Platform</h4>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("features")
                            }
                        >
                            Features
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("how-it-works")
                            }
                        >
                            How It Works
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("security")
                            }
                        >
                            Security
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("faq")
                            }
                        >
                            FAQ
                        </button>

                    </div>


                    <div className="home-footer-column">

                        <h4>Account</h4>

                        <button
                            type="button"
                            onClick={handleLogin}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Register
                        </button>

                        {isLoggedIn && (
                            <button
                                type="button"
                                onClick={goToDashboard}
                            >
                                Dashboard
                            </button>
                        )}

                    </div>


                    <div className="home-footer-column">

                        <h4>eVote</h4>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("about")
                            }
                        >
                            About Platform
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("platform-stats")
                            }
                        >
                            Platform
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection("security")
                            }
                        >
                            Security
                        </button>

                    </div>

                </div>


                <div className="home-footer-bottom">

                    <span>
                        © {new Date().getFullYear()} eVote.
                        All rights reserved.
                    </span>

                    <span>
                        Secure Digital Voting Platform
                    </span>

                </div>

            </footer>

        </div>
    );
}

export default Home;