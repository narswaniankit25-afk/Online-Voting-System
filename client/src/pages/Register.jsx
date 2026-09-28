import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [elections, setElections] = useState([]);
    const [selectedElectionIds, setSelectedElectionIds] = useState([]);
    const [electionsLoading, setElectionsLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    const navigate = useNavigate();

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
       FETCH AVAILABLE ELECTIONS
    ========================================== */

    useEffect(() => {
        const fetchElections = async () => {
            try {
                setElectionsLoading(true);

                const response =
                    await axios.get(
                        "http://localhost:5000/registration-elections"
                    );

                const availableElections =
                    response.data?.elections || [];

                setElections(
                    availableElections
                );

                /*
                If there is exactly one election,
                automatically select it.

                This gives the user a simple
                registration experience when only
                one election exists.
                */

                if (
                    availableElections.length === 1
                ) {
                    setSelectedElectionIds([
                        availableElections[0]._id
                    ]);
                }

            } catch (error) {
                console.log(error);

                setMessage(
                    error.response?.data?.message ||
                    "Unable to load elections"
                );

                setMessageType("error");

            } finally {
                setElectionsLoading(false);
            }
        };

        fetchElections();
    }, []);


    /* =========================================
       TOGGLE ELECTION SELECTION
    ========================================== */

    const toggleElection = (electionId) => {
        setSelectedElectionIds((current) => {
            if (
                current.includes(electionId)
            ) {
                return current.filter(
                    (id) =>
                        id !== electionId
                );
            }

            return [
                ...current,
                electionId
            ];
        });
    };


    /* =========================================
       FORMAT DATE
    ========================================== */

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };


    /* =========================================
       REGISTER
    ========================================== */

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");

        /* =========================================
           PASSWORD VALIDATION
        ========================================== */

        if (
            password !== confirmPassword
        ) {
            setMessage(
                "Passwords do not match"
            );

            setMessageType("error");

            return;
        }


        /* =========================================
           ELECTION VALIDATION
        ========================================== */

        if (
            selectedElectionIds.length === 0
        ) {
            setMessage(
                "Please select at least one election"
            );

            setMessageType("error");

            return;
        }


        try {
            const response =
                await axios.post(
                    "http://localhost:5000/register",
                    {
                        name: name,
                        email: email,
                        password: password,
                        electionIds:
                            selectedElectionIds
                    }
                );


            /* =========================================
               SAVE TOKEN
            ========================================== */

            localStorage.setItem(
                "token",
                response.data.token
            );


            /* =========================================
               SUCCESS MESSAGE
            ========================================== */

            setMessage(
                response.data.message ||
                "Registration successful"
            );

            setMessageType("success");


            /* =========================================
               REDIRECT
            ========================================== */

            setTimeout(() => {
                navigate("/dashboard");
            }, 1200);

        } catch (error) {
            console.log(error);

            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );

            setMessageType("error");
        }
    };


    return (
        <div className="login-page">

            {/* =========================
                THEME TOGGLE
            ========================== */}

            <button
                type="button"
                className="theme-toggle"
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

                    /* SUN ICON */

                    <svg
                        width="20"
                        height="20"
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

                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />

                        <path d="M2 12h2" />
                        <path d="M20 12h2" />

                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                    </svg>

                ) : (

                    /* MOON ICON */

                    <svg
                        width="20"
                        height="20"
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


            {/* =========================
                LEFT SIDE
            ========================== */}

            <div className="login-left">

                {/* BRAND */}

                <div className="brand">

                    <div className="brand-icon">

                        <svg
                            width="28"
                            height="28"
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

                    <div>

                        <h2>
                            Online Voting System
                        </h2>

                        <p>
                            Your Vote. A Better Tomorrow.
                        </p>

                    </div>

                </div>


                {/* LEFT CONTENT */}

                <div className="left-content">

                    <h1>
                        Make Your
                        <br />
                        <span>Voice Heard</span>
                    </h1>

                    <p className="left-description">
                        Create your account and become
                        part of a secure and transparent
                        digital voting experience.
                    </p>


                    {/* FEATURE 1 */}

                    <div className="feature">

                        <div className="feature-icon">

                            <svg
                                width="22"
                                height="22"
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

                            <h3>
                                Secure
                            </h3>

                            <p>
                                Your account is protected
                            </p>

                        </div>

                    </div>


                    {/* FEATURE 2 */}

                    <div className="feature">

                        <div className="feature-icon">

                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 2v20" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
                            </svg>

                        </div>

                        <div>

                            <h3>
                                Simple
                            </h3>

                            <p>
                                Easy registration process
                            </p>

                        </div>

                    </div>


                    {/* FEATURE 3 */}

                    <div className="feature">

                        <div className="feature-icon">

                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                />

                                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />

                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />

                                <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                            </svg>

                        </div>

                        <div>

                            <h3>
                                Transparent
                            </h3>

                            <p>
                                Fair and trustworthy voting
                            </p>

                        </div>

                    </div>

                </div>


                {/* QUOTE */}

                <div className="left-quote">
                    "Every vote counts."
                </div>

            </div>


            {/* =========================
                RIGHT SIDE
            ========================== */}

            <div className="login-right">

                <div className="login-container">

                    <div className="login-card">

                        {/* HEADING */}

                        <div className="login-heading">

                            <h1>
                                Create Account
                            </h1>

                            <p>
                                Register to participate in elections
                            </p>

                        </div>


                        {/* MESSAGE */}

                        {message && (
                            <div
                                className={`form-message ${messageType}`}
                            >

                                <span className="message-icon">

                                    {messageType === "success"
                                        ? "✓"
                                        : "!"}

                                </span>

                                <span>
                                    {message}
                                </span>

                            </div>
                        )}


                        {/* FORM */}

                        <form onSubmit={handleRegister}>

                            {/* NAME */}

                            <div className="input-group">

                                <label>
                                    Full Name
                                </label>

                                <div className="input-wrapper">

                                    <svg
                                        className="input-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle
                                            cx="12"
                                            cy="8"
                                            r="4"
                                        />

                                        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                                    </svg>

                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="input-group">

                                <label>
                                    Email
                                </label>

                                <div className="input-wrapper">

                                    <svg
                                        className="input-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="5"
                                            width="18"
                                            height="14"
                                            rx="2"
                                        />

                                        <polyline points="3,7 12,13 21,7" />
                                    </svg>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* =========================================
                                ELECTION SELECTION
                            ========================================== */}

                            <div className="input-group">

                                <label>
                                    Select Election
                                </label>

                                {electionsLoading ? (

                                    <div
                                        style={{
                                            padding: "14px",
                                            borderRadius: "10px",
                                            border: "1px solid #ddd",
                                            fontSize: "14px"
                                        }}
                                    >
                                        Loading available elections...
                                    </div>

                                ) : elections.length === 0 ? (

                                    <div
                                        style={{
                                            padding: "14px",
                                            borderRadius: "10px",
                                            border: "1px solid #ddd",
                                            fontSize: "14px"
                                        }}
                                    >
                                        No active elections are currently
                                        available for registration.
                                    </div>

                                ) : elections.length === 1 ? (

                                    /* =========================================
                                       SINGLE ELECTION
                                    ========================================== */

                                    <div
                                        style={{
                                            padding: "14px 16px",
                                            borderRadius: "10px",
                                            border: "1px solid #ddd",
                                            background:
                                                "rgba(0, 0, 0, 0.02)"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px"
                                            }}
                                        >

                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedElectionIds.includes(
                                                        elections[0]._id
                                                    )
                                                }
                                                onChange={() =>
                                                    toggleElection(
                                                        elections[0]._id
                                                    )
                                                }
                                            />

                                            <strong>
                                                {elections[0].title}
                                            </strong>

                                        </div>

                                        <div
                                            style={{
                                                marginTop: "8px",
                                                marginLeft: "28px",
                                                fontSize: "12px",
                                                opacity: 0.75
                                            }}
                                        >
                                            {formatDate(
                                                elections[0].startTime
                                            )}

                                            {" — "}

                                            {formatDate(
                                                elections[0].endTime
                                            )}
                                        </div>

                                    </div>

                                ) : (

                                    /* =========================================
                                       MULTIPLE ELECTIONS
                                    ========================================== */

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                            maxHeight: "230px",
                                            overflowY: "auto",
                                            paddingRight: "4px"
                                        }}
                                    >

                                        {elections.map(
                                            (election) => {

                                                const isSelected =
                                                    selectedElectionIds.includes(
                                                        election._id
                                                    );

                                                return (
                                                    <label
                                                        key={
                                                            election._id
                                                        }
                                                        style={{
                                                            display: "block",
                                                            padding:
                                                                "12px 14px",
                                                            borderRadius:
                                                                "10px",
                                                            border:
                                                                isSelected
                                                                    ? "2px solid #2563eb"
                                                                    : "1px solid #ddd",
                                                            cursor:
                                                                "pointer",
                                                            background:
                                                                isSelected
                                                                    ? "rgba(37, 99, 235, 0.08)"
                                                                    : "transparent"
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "10px"
                                                            }}
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() =>
                                                                    toggleElection(
                                                                        election._id
                                                                    )
                                                                }
                                                            />

                                                            <strong>
                                                                {
                                                                    election.title
                                                                }
                                                            </strong>

                                                        </div>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "6px",
                                                                marginLeft:
                                                                    "28px",
                                                                fontSize:
                                                                    "12px",
                                                                opacity:
                                                                    0.75
                                                            }}
                                                        >
                                                            {
                                                                formatDate(
                                                                    election.startTime
                                                                )
                                                            }

                                                            {" — "}

                                                            {
                                                                formatDate(
                                                                    election.endTime
                                                                )
                                                            }
                                                        </div>

                                                    </label>
                                                );
                                            }
                                        )}

                                    </div>
                                )}

                                {!electionsLoading &&
                                    elections.length > 1 && (
                                        <p
                                            style={{
                                                marginTop: "7px",
                                                fontSize: "12px",
                                                opacity: 0.7
                                            }}
                                        >
                                            Select one or more elections
                                            you want to participate in.
                                        </p>
                                    )}

                            </div>


                            {/* PASSWORD */}

                            <div className="input-group">

                                <label>
                                    Password
                                </label>

                                <div className="input-wrapper">

                                    <svg
                                        className="input-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="4"
                                            y="10"
                                            width="16"
                                            height="11"
                                            rx="2"
                                        />

                                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                    </svg>

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {showPassword ? (

                                            /* EYE OFF */

                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 3l18 18" />

                                                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                                                <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8a14.8 14.8 0 0 1-3.2 5.1" />

                                                <path d="M6.6 6.6C4.6 8 3.2 10.2 2 12c1.3 4 5 8 10 8 1.8 0 3.4-.5 4.8-1.2" />
                                            </svg>

                                        ) : (

                                            /* EYE */

                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />

                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="3"
                                                />
                                            </svg>

                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* CONFIRM PASSWORD */}

                            <div className="input-group">

                                <label>
                                    Confirm Password
                                </label>

                                <div className="input-wrapper">

                                    <svg
                                        className="input-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="4"
                                            y="10"
                                            width="16"
                                            height="11"
                                            rx="2"
                                        />

                                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                    </svg>

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm your password"
                                        value={
                                            confirmPassword
                                        }
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {showConfirmPassword ? (

                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 3l18 18" />

                                                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                                                <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8a14.8 14.8 0 0 1-3.2 5.1" />

                                                <path d="M6.6 6.6C4.6 8 3.2 10.2 2 12c1.3 4 5 8 10 8 1.8 0 3.4-.5 4.8-1.2" />
                                            </svg>

                                        ) : (

                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />

                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="3"
                                                />
                                            </svg>

                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* REGISTER BUTTON */}

                            <button
                                type="submit"
                                className="login-button"
                                disabled={
                                    electionsLoading ||
                                    elections.length === 0
                                }
                            >

                                <span>
                                    Create Account
                                </span>

                                <span className="arrow">
                                    →
                                </span>

                            </button>

                        </form>


                        {/* DIVIDER */}

                        <div className="divider">

                            <span></span>

                            <p>
                                OR
                            </p>

                            <span></span>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="button"
                            className="register-button"
                            onClick={() =>
                                navigate("/login")
                            }
                        >

                            Already have an account?

                            <span>
                                Login
                            </span>

                        </button>


                        {/* SECURITY */}

                        <div className="security-note">

                            <svg
                                width="20"
                                height="20"
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

                            <span>
                                Your data is safe with us
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;