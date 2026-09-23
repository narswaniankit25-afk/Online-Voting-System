import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);

        localStorage.setItem(
            "darkMode",
            darkMode
        );
    }, [darkMode]);

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");

        try {
            const response = await axios.post(
                "http://localhost:5000/login",
                {
                    email: email,
                    password: password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            const decodedToken = jwtDecode(
                response.data.token
            );

            setMessage(
                response.data.message ||
                "Login successful"
            );

            setMessageType("success");

            setTimeout(() => {
                if (decodedToken.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/dashboard");
                }
            }, 800);

        } catch (error) {
            console.log(error);

            setMessage(
                error.response?.data?.message ||
                "Login failed"
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
                onClick={() => setDarkMode(!darkMode)}
                aria-label={
                    darkMode
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                }
            >
                {darkMode ? (

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
                        <circle cx="12" cy="12" r="4" />
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
                        Every Voice
                        <br />
                        <span>Matters</span>
                    </h1>

                    <p className="left-description">
                        A secure, transparent and simple
                        digital voting platform for a
                        stronger tomorrow.
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
                                Your vote is protected
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
                                Fair and open elections
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

                        </div>

                        <div>

                            <h3>
                                Empowering
                            </h3>

                            <p>
                                A stronger community
                            </p>

                        </div>

                    </div>

                </div>


                {/* QUOTE */}

                <div className="left-quote">
                    "Your vote is your voice."
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
                                Welcome Back
                            </h1>

                            <p>
                                Login to your account to continue
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


                        {/* LOGIN FORM */}

                        <form onSubmit={handleLogin}>

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
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />

                                </div>

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
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
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


                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                className="login-button"
                            >

                                <span>
                                    Login
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


                        {/* REGISTER */}

                        <button
                            type="button"
                            className="register-button"
                            onClick={() => navigate("/register")}
                        >

                            Don't have an account?

                            <span>
                                Register
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

export default Login;