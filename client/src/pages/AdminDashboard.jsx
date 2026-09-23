import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";


function AdminDashboard() {

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [election, setElection] = useState(null);
    const [electionStatus, setElectionStatus] = useState("");

    const [candidates, setCandidates] = useState([]);

    const [candidateName, setCandidateName] = useState("");
    const [party, setParty] = useState("");
    const [symbol, setSymbol] = useState("");

    const [candidatePhoto, setCandidatePhoto] =
        useState(null);

    const [symbolImage, setSymbolImage] =
        useState(null);

    const [editingCandidate, setEditingCandidate] =
        useState(null);

    const [removePhoto, setRemovePhoto] =
        useState(false);

    const [removeSymbolImage, setRemoveSymbolImage] =
        useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("");

    const [loading, setLoading] =
        useState(false);

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
       INITIAL LOAD
    ========================================== */

    useEffect(() => {

        getElection();

        getCandidates();

    }, []);


    /* =========================================
       MESSAGE
    ========================================== */

    const showMessage = (text, type) => {

        setMessage(text);
        setMessageType(type);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    const clearMessage = () => {

        setMessage("");
        setMessageType("");
    };


    /* =========================================
       ELECTION
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

            if (
                error.response?.status !== 404
            ) {

                console.log(error);

                showMessage(
                    error.response?.data?.message ||
                    "Failed to load election",
                    "error"
                );
            }
        }
    };


    /* =========================================
       CANDIDATES
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
                "Failed to load candidates",
                "error"
            );
        }
    };


    /* =========================================
       IMAGE VALIDATION
    ========================================== */

    const validateImage = (file) => {

        if (!file) {
            return true;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            showMessage(
                "Only JPG, PNG and WEBP images are allowed",
                "error"
            );

            return false;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showMessage(
                "Each image must be smaller than 5 MB",
                "error"
            );

            return false;
        }


        return true;
    };


    /* =========================================
       CREATE ELECTION
    ========================================== */

    const handleCreateElection = async (e) => {

        e.preventDefault();

        clearMessage();

        try {

            setLoading(true);

            const response =
                await api.post(
                    "/election",
                    {
                        startTime,
                        endTime
                    }
                );


            showMessage(
                response.data.message,
                "success"
            );


            setElection(
                response.data.election
            );

            await getElection();


            setStartTime("");
            setEndTime("");

        } catch (error) {

            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to create election",
                "error"
            );

        } finally {

            setLoading(false);
        }
    };


    /* =========================================
       ADD CANDIDATE
    ========================================== */

    const handleAddCandidate = async (e) => {

        e.preventDefault();

        clearMessage();


        if (
            candidatePhoto &&
            !validateImage(candidatePhoto)
        ) {
            return;
        }


        if (
            symbolImage &&
            !validateImage(symbolImage)
        ) {
            return;
        }


        try {

            setLoading(true);


            const formData =
                new FormData();


            formData.append(
                "name",
                candidateName
            );


            formData.append(
                "party",
                party
            );


            formData.append(
                "symbol",
                symbol
            );


            if (candidatePhoto) {

                formData.append(
                    "photo",
                    candidatePhoto
                );
            }


            if (symbolImage) {

                formData.append(
                    "symbolImage",
                    symbolImage
                );
            }


            const response =
                await api.post(
                    "/candidate",
                    formData
                );


            showMessage(
                response.data.message,
                "success"
            );


            setCandidateName("");
            setParty("");
            setSymbol("");

            setCandidatePhoto(null);
            setSymbolImage(null);


            // Reset file inputs
            const photoInput =
                document.getElementById(
                    "candidate-photo-input"
                );

            const symbolInput =
                document.getElementById(
                    "symbol-image-input"
                );


            if (photoInput) {
                photoInput.value = "";
            }


            if (symbolInput) {
                symbolInput.value = "";
            }


            await getCandidates();

        } catch (error) {

            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to add candidate",
                "error"
            );

        } finally {

            setLoading(false);
        }
    };


    /* =========================================
       EDIT CANDIDATE
    ========================================== */

    const openEditCandidate = (candidate) => {

        setEditingCandidate(candidate);

        setCandidateName(
            candidate.name || ""
        );

        setParty(
            candidate.party || ""
        );

        setSymbol(
            candidate.symbol || ""
        );

        setCandidatePhoto(null);
        setSymbolImage(null);

        setRemovePhoto(false);
        setRemoveSymbolImage(false);

        clearMessage();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* =========================================
       CANCEL EDIT
    ========================================== */

    const cancelEdit = () => {

        setEditingCandidate(null);

        setCandidateName("");
        setParty("");
        setSymbol("");

        setCandidatePhoto(null);
        setSymbolImage(null);

        setRemovePhoto(false);
        setRemoveSymbolImage(false);

        const photoInput =
            document.getElementById(
                "candidate-photo-input"
            );

        const symbolInput =
            document.getElementById(
                "symbol-image-input"
            );


        if (photoInput) {
            photoInput.value = "";
        }


        if (symbolInput) {
            symbolInput.value = "";
        }


        clearMessage();
    };


    /* =========================================
       UPDATE CANDIDATE
    ========================================== */

    const handleUpdateCandidate =
        async (e) => {

            e.preventDefault();

            clearMessage();


            if (!editingCandidate) {
                return;
            }


            if (
                candidatePhoto &&
                !validateImage(candidatePhoto)
            ) {
                return;
            }


            if (
                symbolImage &&
                !validateImage(symbolImage)
            ) {
                return;
            }


            try {

                setLoading(true);


                const formData =
                    new FormData();


                formData.append(
                    "name",
                    candidateName
                );


                formData.append(
                    "party",
                    party
                );


                formData.append(
                    "symbol",
                    symbol
                );


                formData.append(
                    "removePhoto",
                    removePhoto
                        ? "true"
                        : "false"
                );


                formData.append(
                    "removeSymbolImage",
                    removeSymbolImage
                        ? "true"
                        : "false"
                );


                if (candidatePhoto) {

                    formData.append(
                        "photo",
                        candidatePhoto
                    );
                }


                if (symbolImage) {

                    formData.append(
                        "symbolImage",
                        symbolImage
                    );
                }


                const response =
                    await api.put(
                        `/candidate/${editingCandidate._id}`,
                        formData
                    );


                showMessage(
                    response.data.message,
                    "success"
                );


                await getCandidates();


                cancelEdit();

            } catch (error) {

                console.log(error);

                showMessage(
                    error.response?.data?.message ||
                    "Failed to update candidate",
                    "error"
                );

            } finally {

                setLoading(false);
            }
        };


    /* =========================================
       ANNOUNCE RESULTS
    ========================================== */

    const handleAnnounceResults =
        async () => {

            clearMessage();


            try {

                setLoading(true);


                const response =
                    await api.post(
                        "/election/announce-results",
                        {}
                    );


                showMessage(
                    response.data.message,
                    "success"
                );


                await getElection();

            } catch (error) {

                console.log(error);

                showMessage(
                    error.response?.data?.message ||
                    "Failed to announce results",
                    "error"
                );

            } finally {

                setLoading(false);
            }
        };


    /* =========================================
       LOGOUT
    ========================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");

        window.location.href =
            "/login";
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
       PHOTO URL
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
       STATUS
    ========================================== */

    const getStatusText = () => {

        if (
            electionStatus ===
            "not_started"
        ) {
            return "Not Started";
        }

        if (
            electionStatus ===
            "live"
        ) {
            return "Live Now";
        }

        if (
            electionStatus ===
            "ended"
        ) {
            return "Ended";
        }

        return "Unavailable";
    };


    const getStatusClass = () => {

        if (
            electionStatus ===
            "not_started"
        ) {
            return "admin-status-upcoming";
        }

        if (
            electionStatus ===
            "live"
        ) {
            return "admin-status-live";
        }

        return "admin-status-ended";
    };


    return (

        <div className="admin-page">


            {/* =================================
                NAVBAR
            ================================== */}

            <header className="admin-navbar">

                <div className="admin-navbar-inner">


                    <button
                        className="admin-brand"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >

                        <div className="admin-brand-icon">

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
                                <path d="M4 7h16" />
                                <path d="M6 7v13h12V7" />
                                <path d="M8 7V4h8v3" />
                                <path d="m9 13 2 2 4-4" />
                            </svg>

                        </div>


                        <div>

                            <strong>
                                eVote
                            </strong>

                            <span>
                                Administration
                            </span>

                        </div>

                    </button>


                    <div className="admin-nav-actions">


                        <button
                            className="admin-nav-button"
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

                            Voter View

                        </button>


                        <button
                            className="admin-nav-button"
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


                        <button
                            className="admin-theme-button"
                            onClick={() =>
                                setDarkMode(
                                    !darkMode
                                )
                            }
                        >

                            {darkMode ? "☀" : "☾"}

                        </button>


                        <button
                            className="admin-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* =================================
                MAIN
            ================================== */}

            <main className="admin-main">


                {/* HERO */}

                <section className="admin-hero">

                    <div>

                        <span>
                            ADMINISTRATION PANEL
                        </span>

                        <h1>
                            Election Management
                        </h1>

                        <p>
                            Manage your election,
                            candidates and results
                            from one secure dashboard.
                        </p>

                    </div>


                    <div className="admin-hero-icon">

                        <svg
                            width="70"
                            height="70"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 3 4 7v5c0 5.2 3.4 8.8 8 10 4.6-1.2 8-4.8 8-10V7l-8-4z" />

                            <path d="m9 12 2 2 4-4" />

                        </svg>

                    </div>

                </section>


                {/* MESSAGE */}

                {message && (

                    <div
                        className={`admin-notification ${messageType}`}
                    >

                        <span className="admin-notification-icon">

                            {messageType === "success"
                                ? "✓"
                                : "!"}

                        </span>


                        <span>
                            {message}
                        </span>


                        <button
                            onClick={
                                clearMessage
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =================================
                    ELECTION MANAGEMENT
                ================================== */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <div>

                            <span>
                                01
                            </span>

                            <div>

                                <h2>
                                    Election
                                </h2>

                                <p>
                                    Configure election timing
                                    and announcement status.
                                </p>

                            </div>

                        </div>

                    </div>


                    {election ? (

                        <div className="admin-election-card">

                            <div className="admin-election-top">

                                <div>

                                    <span className="admin-small-label">
                                        CURRENT ELECTION
                                    </span>

                                    <h3>
                                        Election is configured
                                    </h3>

                                </div>


                                <span
                                    className={`admin-status-badge ${getStatusClass()}`}
                                >

                                    <i></i>

                                    {getStatusText()}

                                </span>

                            </div>


                            <div className="admin-election-details">

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


                                <div>

                                    <span>
                                        Results
                                    </span>

                                    <strong>
                                        {election.resultsAnnounced
                                            ? "Announced"
                                            : "Not Announced"}
                                    </strong>

                                </div>

                            </div>


                            {!election.resultsAnnounced && (

                                <button
                                    className="admin-announce-button"
                                    onClick={
                                        handleAnnounceResults
                                    }
                                    disabled={
                                        electionStatus !==
                                        "ended" ||
                                        loading
                                    }
                                >

                                    {loading
                                        ? "Processing..."
                                        : electionStatus ===
                                            "ended"
                                            ? "Announce Results"
                                            : "Results Available After Election"}

                                </button>

                            )}

                        </div>

                    ) : (

                        <form
                            className="admin-form-card"
                            onSubmit={
                                handleCreateElection
                            }
                        >

                            <div className="admin-form-grid">

                                <div className="admin-field">

                                    <label>
                                        Start Date & Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <div className="admin-field">

                                    <label>
                                        End Date & Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Creating..."
                                    : "Create Election →"}

                            </button>

                        </form>

                    )}

                </section>


                {/* =================================
                    CANDIDATE MANAGEMENT
                ================================== */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <div>

                            <span>
                                02
                            </span>

                            <div>

                                <h2>
                                    {editingCandidate
                                        ? "Edit Candidate"
                                        : "Add Candidate"}
                                </h2>

                                <p>
                                    {editingCandidate
                                        ? "Update candidate details, photo or election symbol."
                                        : "Add candidates with optional photos and symbol images."}
                                </p>

                            </div>

                        </div>

                    </div>


                    <form
                        className="admin-form-card"
                        onSubmit={
                            editingCandidate
                                ? handleUpdateCandidate
                                : handleAddCandidate
                        }
                    >


                        <div className="admin-form-grid">

                            <div className="admin-field">

                                <label>
                                    Candidate Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter candidate name"
                                    value={candidateName}
                                    onChange={(e) =>
                                        setCandidateName(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div className="admin-field">

                                <label>
                                    Party
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter party name"
                                    value={party}
                                    onChange={(e) =>
                                        setParty(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div className="admin-field">

                                <label>
                                    Symbol Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Example: Tree"
                                    value={symbol}
                                    onChange={(e) =>
                                        setSymbol(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* IMAGE UPLOADS */}

                        <div className="admin-upload-grid">


                            {/* CANDIDATE PHOTO */}

                            <div className="admin-upload-box">

                                <div className="admin-upload-heading">

                                    <div>

                                        <strong>
                                            Candidate Photo
                                        </strong>

                                        <span>
                                            Optional
                                        </span>

                                    </div>

                                </div>


                                {editingCandidate &&
                                    editingCandidate.photo &&
                                    !removePhoto && (

                                        <div className="existing-image">

                                            <img
                                                src={getImageUrl(
                                                    editingCandidate.photo
                                                )}
                                                alt={
                                                    editingCandidate.name
                                                }
                                            />

                                            <div>

                                                <span>
                                                    Current photo
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRemovePhoto(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>

                                    )}


                                {removePhoto && (

                                    <div className="remove-image-message">

                                        Current photo will be removed.

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRemovePhoto(
                                                    false
                                                )
                                            }
                                        >
                                            Undo
                                        </button>

                                    </div>

                                )}


                                <label
                                    className="admin-file-label"
                                    htmlFor="candidate-photo-input"
                                >

                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="3"
                                            width="18"
                                            height="18"
                                            rx="2"
                                        />

                                        <circle
                                            cx="8.5"
                                            cy="8.5"
                                            r="1.5"
                                        />

                                        <path d="m21 15-5-5L5 21" />

                                    </svg>


                                    <span>

                                        {candidatePhoto
                                            ? candidatePhoto.name
                                            : "Choose candidate photo"}

                                    </span>


                                    <small>
                                        JPG, PNG or WEBP • Max 5 MB
                                    </small>

                                </label>


                                <input
                                    id="candidate-photo-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {

                                        const file =
                                            e.target.files?.[0];

                                        if (
                                            file &&
                                            validateImage(file)
                                        ) {
                                            setCandidatePhoto(
                                                file
                                            );
                                        } else {
                                            e.target.value = "";
                                        }

                                    }}
                                />

                            </div>


                            {/* SYMBOL IMAGE */}

                            <div className="admin-upload-box">

                                <div className="admin-upload-heading">

                                    <div>

                                        <strong>
                                            Symbol Image
                                        </strong>

                                        <span>
                                            Optional
                                        </span>

                                    </div>

                                </div>


                                {editingCandidate &&
                                    editingCandidate.symbolImage &&
                                    !removeSymbolImage && (

                                        <div className="existing-image symbol-existing">

                                            <img
                                                src={getImageUrl(
                                                    editingCandidate.symbolImage
                                                )}
                                                alt="Election symbol"
                                            />

                                            <div>

                                                <span>
                                                    Current symbol
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRemoveSymbolImage(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>

                                    )}


                                {removeSymbolImage && (

                                    <div className="remove-image-message">

                                        Current symbol image
                                        will be removed.

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRemoveSymbolImage(
                                                    false
                                                )
                                            }
                                        >
                                            Undo
                                        </button>

                                    </div>

                                )}


                                <label
                                    className="admin-file-label"
                                    htmlFor="symbol-image-input"
                                >

                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />

                                        <path d="m8 12 3 3 5-6" />

                                    </svg>


                                    <span>

                                        {symbolImage
                                            ? symbolImage.name
                                            : "Choose symbol image"}

                                    </span>


                                    <small>
                                        JPG, PNG or WEBP • Max 5 MB
                                    </small>

                                </label>


                                <input
                                    id="symbol-image-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {

                                        const file =
                                            e.target.files?.[0];

                                        if (
                                            file &&
                                            validateImage(file)
                                        ) {
                                            setSymbolImage(
                                                file
                                            );
                                        } else {
                                            e.target.value = "";
                                        }

                                    }}
                                />

                            </div>

                        </div>


                        {/* FORM ACTIONS */}

                        <div className="admin-form-actions">

                            {editingCandidate && (

                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={
                                        cancelEdit
                                    }
                                    disabled={loading}
                                >
                                    Cancel Edit
                                </button>

                            )}


                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Saving..."
                                    : editingCandidate
                                        ? "Save Changes →"
                                        : "Add Candidate →"}

                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================
                    CANDIDATE LIST
                ================================== */}

                <section className="admin-section">

                    <div className="admin-section-header">

                        <div>

                            <span>
                                03
                            </span>

                            <div>

                                <h2>
                                    Candidate List
                                </h2>

                                <p>
                                    View and manage all candidates
                                    currently registered.
                                </p>

                            </div>

                        </div>


                        <span className="admin-count">
                            {candidates.length}{" "}
                            {candidates.length === 1
                                ? "Candidate"
                                : "Candidates"}
                        </span>

                    </div>


                    {candidates.length === 0 ? (

                        <div className="admin-empty">

                            <div className="admin-empty-icon">
                                +
                            </div>

                            <h3>
                                No candidates yet
                            </h3>

                            <p>
                                Add your first candidate
                                using the form above.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-candidate-list">

                            {candidates.map(
                                (candidate, index) => (

                                    <div
                                        className="admin-candidate-item"
                                        key={candidate._id}
                                    >


                                        <div className="admin-candidate-number">

                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}

                                        </div>


                                        {/* PHOTO */}

                                        <div className="admin-candidate-photo">

                                            {candidate.photo ? (

                                                <img
                                                    src={getImageUrl(
                                                        candidate.photo
                                                    )}
                                                    alt={
                                                        candidate.name
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    {candidate.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </span>

                                            )}

                                        </div>


                                        {/* INFO */}

                                        <div className="admin-candidate-info">

                                            <h3>
                                                {candidate.name}
                                            </h3>

                                            <p>
                                                {candidate.party}
                                            </p>

                                        </div>


                                        {/* SYMBOL */}

                                        <div className="admin-symbol-preview">

                                            {candidate.symbolImage ? (

                                                <img
                                                    src={getImageUrl(
                                                        candidate.symbolImage
                                                    )}
                                                    alt={
                                                        candidate.symbol
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    {candidate.symbol}
                                                </span>

                                            )}

                                        </div>


                                        {/* EDIT */}

                                        <button
                                            className="admin-edit-button"
                                            onClick={() =>
                                                openEditCandidate(
                                                    candidate
                                                )
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
                                                <path d="M12 20h9" />

                                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />

                                            </svg>

                                            Edit

                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================
                    FOOTER
                ================================== */}

                <footer className="admin-footer">

                    <div>

                        <strong>
                            eVote
                        </strong>

                        <span>
                            Secure Election Administration
                        </span>

                    </div>


                    <p>
                        Admin Control Panel
                    </p>

                </footer>

            </main>

        </div>
    );
}


export default AdminDashboard;