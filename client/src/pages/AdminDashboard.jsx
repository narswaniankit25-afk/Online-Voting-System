import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";


function AdminDashboard() {

    /* =========================================
       ELECTION STATE
    ========================================== */

    const [elections, setElections] = useState([]);
    const [selectedElectionId, setSelectedElectionId] = useState("");

    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");


    /* =========================================
       CANDIDATE STATE
    ========================================== */

    const [candidates, setCandidates] = useState([]);

    const [candidateName, setCandidateName] = useState("");
    const [party, setParty] = useState("");
    const [symbol, setSymbol] = useState("");

    const [candidatePhoto, setCandidatePhoto] = useState(null);
    const [symbolImage, setSymbolImage] = useState(null);

    const [editingCandidate, setEditingCandidate] = useState(null);

    const [removePhoto, setRemovePhoto] = useState(false);
    const [removeSymbolImage, setRemoveSymbolImage] = useState(false);


    /* =========================================
       UI STATE
    ========================================== */

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });


    const navigate = useNavigate();


    /* =========================================
       SELECTED ELECTION
    ========================================== */

    const selectedElection = useMemo(() => {

        return elections.find(
            (item) =>
                item._id === selectedElectionId
        ) || null;

    }, [elections, selectedElectionId]);


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

        getElections();

    }, []);


    /* =========================================
       LOAD CANDIDATES WHEN ELECTION CHANGES
    ========================================== */

    useEffect(() => {

        if (selectedElectionId) {

            getCandidates(
                selectedElectionId
            );

        } else {

            setCandidates([]);

        }

        resetCandidateForm();
        setSearchTerm("");

    }, [selectedElectionId]);


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
       GET ELECTIONS
    ========================================== */

    const getElections = async (
        preferredElectionId = null
    ) => {

        try {

            const response =
                await api.get(
                    "/elections"
                );

            const list =
                response.data.elections || [];

            setElections(list);


            /*
             * Keep the currently selected election
             * if it still exists.
             */

            const currentId =
                preferredElectionId ||
                selectedElectionId;


            const currentStillExists =
                currentId &&
                list.some(
                    (item) =>
                        item._id === currentId
                );


            if (currentStillExists) {

                setSelectedElectionId(
                    currentId
                );

            } else if (list.length > 0) {

                /*
                 * Select the first election when
                 * nothing is selected.
                 */

                setSelectedElectionId(
                    list[0]._id
                );

            } else {

                setSelectedElectionId("");

            }

        } catch (error) {

            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to load elections",
                "error"
            );

        }

    };


    /* =========================================
       GET CANDIDATES
    ========================================== */

    const getCandidates = async (
        electionId
    ) => {

        if (!electionId) {

            setCandidates([]);

            return;

        }

        try {

            const response =
                await api.get(
                    `/candidates?electionId=${electionId}`
                );

            setCandidates(
                response.data.candidates || []
            );

        } catch (error) {

            console.log(error);

            setCandidates([]);

            showMessage(
                error.response?.data?.message ||
                "Failed to load candidates",
                "error"
            );

        }

    };


    /* =========================================
       SELECT ELECTION
    ========================================== */

    const handleElectionChange = (e) => {

        const electionId =
            e.target.value;

        setSelectedElectionId(
            electionId
        );

        clearMessage();

    };


    /* =========================================
       SEARCH
    ========================================== */

    const filteredCandidates = useMemo(() => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();


        if (!search) {

            return candidates;

        }


        return candidates.filter(
            (candidate) => {

                const name =
                    candidate.name?.toLowerCase() ||
                    "";

                const partyName =
                    candidate.party?.toLowerCase() ||
                    "";

                const candidateSymbol =
                    candidate.symbol?.toLowerCase() ||
                    "";


                return (
                    name.includes(search) ||
                    partyName.includes(search) ||
                    candidateSymbol.includes(search)
                );

            }
        );

    }, [candidates, searchTerm]);


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


        if (file.size > 5 * 1024 * 1024) {

            showMessage(
                "Each image must be smaller than 5 MB",
                "error"
            );

            return false;

        }


        return true;

    };

/* =========================================
   LOCAL DATE/TIME → UTC
========================================== */

const localDateTimeToUTC = (value) => {

    if (!value) {
        return null;
    }

    const [datePart, timePart] =
        value.split("T");

    const [year, month, day] =
        datePart.split("-").map(Number);

    const [hours, minutes] =
        timePart.split(":").map(Number);

    const localDate = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
    );

    return localDate.toISOString();

};


    /* =========================================
       CREATE ELECTION
    ========================================== */

    /* =========================================
   CREATE ELECTION
========================================== */

const handleCreateElection = async (e) => {

    e.preventDefault();

    clearMessage();


    if (!title.trim()) {

        showMessage(
            "Please enter an election title.",
            "error"
        );

        return;

    }


    if (!startTime || !endTime) {

        showMessage(
            "Please select both start and end time.",
            "error"
        );

        return;

    }


    /* =========================================
       CONVERT LOCAL TIME TO UTC
    ========================================== */

    const startUTC =
        localDateTimeToUTC(startTime);

    const endUTC =
        localDateTimeToUTC(endTime);


    if (
        !startUTC ||
        !endUTC
    ) {

        showMessage(
            "Invalid election date or time.",
            "error"
        );

        return;

    }


    /* =========================================
       VALIDATE TIME ORDER
    ========================================== */

    if (
        new Date(endUTC) <=
        new Date(startUTC)
    ) {

        showMessage(
            "End time must be later than start time.",
            "error"
        );

        return;

    }


    try {

        setLoading(true);


        const response =
            await api.post(
                "/election",
                {
                    title:
                        title.trim(),

                    startTime:
                        startUTC,

                    endTime:
                        endUTC
                }
            );


        const createdElection =
            response.data.election;


        showMessage(
            response.data.message ||
            "Election created successfully",
            "success"
        );


        setTitle("");

        setStartTime("");

        setEndTime("");


        /* =========================================
           REFRESH ELECTION LIST
           AND SELECT NEW ELECTION
        ========================================== */

        await getElections(
            createdElection?._id
        );


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
       DELETE ELECTION
    ========================================== */

    const handleDeleteElection = async () => {

        if (!selectedElection) {

            return;

        }


        if (
            electionStatus !== "ended"
        ) {

            showMessage(
                "An election can only be deleted after it has ended.",
                "error"
            );

            return;

        }


        if (
            !selectedElection.resultsAnnounced
        ) {

            showMessage(
                "Results must be announced before deleting this election.",
                "error"
            );

            return;

        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${selectedElection.title || "Election"}"?\n\nThis will permanently delete this election, its candidates, votes and uploaded images. Other elections will not be affected.`
            );


        if (!confirmed) {

            return;

        }


        try {

            setLoading(true);

            clearMessage();


            const response =
                await api.delete(
                    `/election/${selectedElection._id}`
                );


            showMessage(
                response.data.message ||
                "Election deleted successfully",
                "success"
            );


            setSelectedElectionId("");

            setCandidates([]);

            resetCandidateForm();


            await getElections();

        } catch (error) {

            console.log(error);

            showMessage(
                error.response?.data?.message ||
                "Failed to delete election",
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


        if (!selectedElection) {

            showMessage(
                "Please select an election first.",
                "error"
            );

            return;

        }


        if (
            getElectionStatus(
                selectedElection
            ) === "ended"
        ) {

            showMessage(
                "Candidates cannot be added after the election ends.",
                "error"
            );

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
                "electionId",
                selectedElection._id
            );


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
                response.data.message ||
                "Candidate added successfully",
                "success"
            );


            resetCandidateForm();


            await getCandidates(
                selectedElection._id
            );

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

    const openEditCandidate = (
        candidate
    ) => {

        setEditingCandidate(
            candidate
        );


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
       RESET FORM
    ========================================== */

    const resetCandidateForm = () => {

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

    };


    /* =========================================
       CANCEL EDIT
    ========================================== */

    const cancelEdit = () => {

        resetCandidateForm();

        clearMessage();

    };


    /* =========================================
       UPDATE CANDIDATE
    ========================================== */

    const handleUpdateCandidate = async (e) => {

        e.preventDefault();

        clearMessage();


        if (!editingCandidate) {

            return;

        }


        if (
            selectedElection &&
            getElectionStatus(
                selectedElection
            ) === "ended"
        ) {

            showMessage(
                "Candidates cannot be edited after the election ends.",
                "error"
            );

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
                response.data.message ||
                "Candidate updated successfully",
                "success"
            );


            await getCandidates(
                selectedElectionId
            );


            resetCandidateForm();

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

    const handleAnnounceResults = async () => {

        clearMessage();


        if (!selectedElection) {

            return;

        }


        try {

            setLoading(true);


            const response =
                await api.post(
                    `/election/${selectedElection._id}/announce-results`,
                    {}
                );


            showMessage(
                response.data.message ||
                "Results announced successfully",
                "success"
            );


            await getElections(
                selectedElection._id
            );

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

        localStorage.removeItem(
            "token"
        );

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


        return new Date(
            date
        ).toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    /* =========================================
       IMAGE URL
    ========================================== */

    const getImageUrl = (image) => {

        if (!image) {

            return null;

        }


        if (
            image.startsWith("http")
        ) {

            return image;

        }


        return `http://localhost:5000${image}`;

    };


    /* =========================================
       ELECTION STATUS
    ========================================== */

    const getElectionStatus = (
        election
    ) => {

        if (!election) {

            return "";

        }


        const now =
            new Date();


        const start =
            new Date(
                election.startTime
            );


        const end =
            new Date(
                election.endTime
            );


        if (now < start) {

            return "not_started";

        }


        if (now >= end) {

            return "ended";

        }


        return "live";

    };


    const electionStatus =
        getElectionStatus(
            selectedElection
        );


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


    /* =========================================
       RENDER
    ========================================== */

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
                            onClick={() => {

                                if (
                                    selectedElectionId
                                ) {

                                    navigate(
                                        `/results/${selectedElectionId}`
                                    );

                                } else {

                                    navigate(
                                        "/results"
                                    );

                                }

                            }}
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
                            aria-label={
                                darkMode
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                        >

                            {darkMode
                                ? "☀"
                                : "☾"}

                        </button>


                        <button
                            className="admin-logout"
                            onClick={
                                handleLogout
                            }
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
                            Manage multiple elections,
                            candidates and results from
                            one secure dashboard.
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

                            {messageType ===
                            "success"
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
                    STATISTICS
                ================================== */}

                <section className="admin-stats-grid">


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon purple">

                            <svg
                                width="21"
                                height="21"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                />

                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />

                            </svg>

                        </div>


                        <div>

                            <span>
                                Total Candidates
                            </span>

                            <strong>
                                {candidates.length}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon green">

                            <svg
                                width="21"
                                height="21"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >

                                <path d="M12 3 4 7v5c0 5.2 3.4 8.8 8 10 4.6-1.2 8-4.8 8-10V7l-8-4z" />

                                <path d="m9 12 2 2 4-4" />

                            </svg>

                        </div>


                        <div>

                            <span>
                                Election Status
                            </span>

                            <strong>
                                {getStatusText()}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon blue">

                            <svg
                                width="21"
                                height="21"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
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

                            <span>
                                Results
                            </span>

                            <strong>

                                {selectedElection
                                    ?.resultsAnnounced
                                    ? "Announced"
                                    : "Pending"}

                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon orange">

                            <svg
                                width="21"
                                height="21"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
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
                                Total Elections
                            </span>

                            <strong>
                                {elections.length}
                            </strong>

                        </div>

                    </div>

                </section>


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
                                    Election Management
                                </h2>

                                <p>
                                    Create and manage multiple
                                    independent elections.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* CREATE ELECTION */}

                    <form
                        className="admin-form-card"
                        onSubmit={
                            handleCreateElection
                        }
                    >

                        <div className="admin-form-intro">

                            <div className="admin-form-intro-icon">

                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
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

                                <strong>
                                    Create New Election
                                </strong>

                                <span>
                                    Create as many independent
                                    elections as required.
                                </span>

                            </div>

                        </div>


                        <div className="admin-form-grid">


                            <div className="admin-field">

                                <label>
                                    Election Title
                                </label>

                                <input
                                    type="text"
                                    placeholder="Example: Student Council Election 2026"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


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


                    {/* ELECTION SELECTOR */}

                    {elections.length > 0 && (

                        <div
                            className="admin-form-card"
                            style={{
                                marginTop: "20px"
                            }}
                        >

                            <div className="admin-form-intro">

                                <div className="admin-form-intro-icon">

                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
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

                                        <path d="m8 10 4 4 4-4" />

                                    </svg>

                                </div>


                                <div>

                                    <strong>
                                        Select Election
                                    </strong>

                                    <span>
                                        Select which election you
                                        want to manage below.
                                    </span>

                                </div>

                            </div>


                            <div className="admin-field">

                                <label>
                                    Active Election
                                </label>

                                <select
                                    value={
                                        selectedElectionId
                                    }
                                    onChange={
                                        handleElectionChange
                                    }
                                    style={{
                                        width: "100%",
                                        padding: "12px 14px",
                                        borderRadius: "10px",
                                        border: "1px solid #d9d9d9",
                                        background: "inherit",
                                        fontSize: "15px"
                                    }}
                                >

                                    {elections.map(
                                        (item) => (

                                            <option
                                                key={
                                                    item._id
                                                }
                                                value={
                                                    item._id
                                                }
                                            >

                                                {item.title ||
                                                    "Election"}

                                                {" — "}

                                                {formatDate(
                                                    item.startTime
                                                )}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    )}


                    {/* SELECTED ELECTION */}

                    {selectedElection && (

                        <div
                            className="admin-election-card"
                            style={{
                                marginTop: "20px"
                            }}
                        >

                            <div className="admin-election-top">

                                <div>

                                    <span className="admin-small-label">
                                        SELECTED ELECTION
                                    </span>

                                    <h3>
                                        {selectedElection.title ||
                                            "Election"}
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
                                            selectedElection.startTime
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        End Time
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedElection.endTime
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Results
                                    </span>

                                    <strong>
                                        {selectedElection.resultsAnnounced
                                            ? "Announced"
                                            : "Not Announced"}
                                    </strong>

                                </div>


                            </div>


                            <div
                                className="admin-form-actions"
                                style={{
                                    marginTop: "20px"
                                }}
                            >


                                {!selectedElection.resultsAnnounced && (

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


                                {selectedElection.resultsAnnounced && (

                                    <button
                                        className="admin-primary-button"
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/results/${selectedElection._id}`
                                            )
                                        }
                                    >

                                        View Results →

                                    </button>

                                )}


                                {selectedElection.resultsAnnounced &&
                                    electionStatus ===
                                        "ended" && (

                                        <button
                                            type="button"
                                            className="admin-secondary-button"
                                            onClick={
                                                handleDeleteElection
                                            }
                                            disabled={
                                                loading
                                            }
                                        >

                                            {loading
                                                ? "Deleting..."
                                                : "Delete Election"}

                                        </button>

                                    )}

                            </div>


                        </div>

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

                                    {selectedElection
                                        ? `Manage candidates for ${
                                            selectedElection.title ||
                                            "selected election"
                                        }.`
                                        : "Select an election first."}

                                </p>

                            </div>

                        </div>

                    </div>


                    {!selectedElection ? (

                        <div className="admin-empty">

                            <div className="admin-empty-icon">
                                !
                            </div>

                            <h3>
                                Select an election
                            </h3>

                            <p>
                                Create or select an election
                                before adding candidates.
                            </p>

                        </div>

                    ) : electionStatus === "ended" ? (

                        <div className="admin-empty">

                            <div className="admin-empty-icon">
                                ✓
                            </div>

                            <h3>
                                Election has ended
                            </h3>

                            <p>
                                Candidates cannot be added
                                or edited after this election ends.
                            </p>

                        </div>

                    ) : (

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
                                        value={
                                            candidateName
                                        }
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
                                        value={
                                            party
                                        }
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
                                        value={
                                            symbol
                                        }
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

                                            <span>
                                                Current photo will be removed.
                                            </span>

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
                                                validateImage(
                                                    file
                                                )
                                            ) {

                                                setCandidatePhoto(
                                                    file
                                                );

                                            } else {

                                                e.target.value =
                                                    "";

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

                                            <span>
                                                Current symbol image
                                                will be removed.
                                            </span>

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
                                                validateImage(
                                                    file
                                                )
                                            ) {

                                                setSymbolImage(
                                                    file
                                                );

                                            } else {

                                                e.target.value =
                                                    "";

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
                                        disabled={
                                            loading
                                        }
                                    >
                                        Cancel Edit
                                    </button>

                                )}


                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={
                                        loading
                                    }
                                >

                                    {loading
                                        ? "Saving..."
                                        : editingCandidate
                                            ? "Save Changes →"
                                            : "Add Candidate →"}

                                </button>


                            </div>


                        </form>

                    )}

                </section>


                {/* =================================
                    CANDIDATE LIST
                ================================== */}

                <section className="admin-section">


                    <div className="admin-section-header candidate-list-header">


                        <div>

                            <span>
                                03
                            </span>

                            <div>

                                <h2>
                                    Candidate List
                                </h2>

                                <p>

                                    {selectedElection
                                        ? `Candidates registered for ${
                                            selectedElection.title ||
                                            "selected election"
                                        }.`
                                        : "Select an election to view candidates."}

                                </p>

                            </div>

                        </div>


                        {selectedElection && (

                            <div className="admin-list-controls">


                                <div className="admin-search">

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
                                        value={
                                            searchTerm
                                        }
                                        onChange={(e) =>
                                            setSearchTerm(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <span className="admin-count">

                                    {
                                        filteredCandidates.length
                                    }

                                    {" "}

                                    {
                                        filteredCandidates.length ===
                                        1
                                            ? "Candidate"
                                            : "Candidates"
                                    }

                                </span>


                            </div>

                        )}

                    </div>


                    {!selectedElection ? (

                        <div className="admin-empty">

                            <div className="admin-empty-icon">
                                !
                            </div>

                            <h3>
                                Select an election
                            </h3>

                            <p>
                                Select an election above to
                                view its candidates.
                            </p>

                        </div>

                    ) : filteredCandidates.length === 0 ? (

                        <div className="admin-empty">

                            <div className="admin-empty-icon">
                                {searchTerm
                                    ? "⌕"
                                    : "+"}
                            </div>


                            <h3>

                                {searchTerm
                                    ? "No candidates found"
                                    : "No candidates yet"}

                            </h3>


                            <p>

                                {searchTerm
                                    ? "Try a different candidate, party or symbol name."
                                    : "Add your first candidate using the form above."}

                            </p>

                        </div>

                    ) : (

                        <div className="admin-candidate-list">

                            {filteredCandidates.map(
                                (
                                    candidate,
                                    index
                                ) => {

                                    const photo =
                                        getImageUrl(
                                            candidate.photo
                                        );


                                    const symbolImg =
                                        getImageUrl(
                                            candidate.symbolImage
                                        );


                                    return (

                                        <div
                                            className="admin-candidate-item"
                                            key={
                                                candidate._id
                                            }
                                        >


                                            <div className="admin-candidate-number">

                                                {String(
                                                    index + 1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}

                                            </div>


                                            <div className="admin-candidate-photo">

                                                {photo ? (

                                                    <img
                                                        src={
                                                            photo
                                                        }
                                                        alt={
                                                            candidate.name
                                                        }
                                                        onError={(e) => {

                                                            e.currentTarget.style.display =
                                                                "none";


                                                            const fallback =
                                                                e.currentTarget
                                                                    .nextElementSibling;


                                                            if (
                                                                fallback
                                                            ) {

                                                                fallback.style.display =
                                                                    "flex";

                                                            }

                                                        }}
                                                    />

                                                ) : null}


                                                <span
                                                    style={{
                                                        display:
                                                            photo
                                                                ? "none"
                                                                : "flex"
                                                    }}
                                                >

                                                    {candidate.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        ?.toUpperCase()}

                                                </span>

                                            </div>


                                            <div className="admin-candidate-info">

                                                <h3>
                                                    {
                                                        candidate.name
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        candidate.party
                                                    }
                                                </p>

                                            </div>


                                            <div className="admin-symbol-preview">

                                                {symbolImg ? (

                                                    <img
                                                        src={
                                                            symbolImg
                                                        }
                                                        alt={
                                                            candidate.symbol
                                                        }
                                                        onError={(e) => {

                                                            e.currentTarget.style.display =
                                                                "none";


                                                            const fallback =
                                                                e.currentTarget
                                                                    .nextElementSibling;


                                                            if (
                                                                fallback
                                                            ) {

                                                                fallback.style.display =
                                                                    "block";

                                                            }

                                                        }}
                                                    />

                                                ) : null}


                                                <span
                                                    style={{
                                                        display:
                                                            symbolImg
                                                                ? "none"
                                                                : "block"
                                                    }}
                                                >

                                                    {
                                                        candidate.symbol
                                                    }

                                                </span>

                                            </div>


                                            {electionStatus !==
                                                "ended" && (

                                                <button
                                                    className="admin-edit-button"
                                                    onClick={() =>
                                                        openEditCandidate(
                                                            candidate
                                                        )
                                                    }
                                                >

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

                                                        <path d="M12 20h9" />

                                                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />

                                                    </svg>

                                                    Edit

                                                </button>

                                            )}

                                        </div>

                                    );

                                }
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