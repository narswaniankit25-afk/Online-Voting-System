
import { useEffect, useRef, useState } from "react";
import "./AIChat.css";

function AIChat({ electionId, electionTitle }) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm your AI Election Assistant. Ask me about candidates, election dates, or other available election information."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const sendMessage = async (event) => {
        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || isLoading) {
            return;
        }

        if (!electionId) {
            setError(
                "Please select one of your assigned elections first."
            );
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        setError("");
        setQuestion("");

        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: trimmedQuestion
            }
        ]);

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/ai/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        question: trimmedQuestion,
                        electionId
                    })
                }
            );

            const data = await response.json().catch(
                () => ({})
            );

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Unable to get an AI response."
                );
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        data.answer ||
                        "I couldn't generate an answer. Please try again."
                }
            ]);
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to contact the AI service. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
        }
    };

    const clearChat = () => {
        if (isLoading) {
            return;
        }

        setMessages([
            {
                role: "assistant",
                content:
                    "Chat cleared! What would you like to know about your election?"
            }
        ]);

        setError("");
    };

    return (
        <div className="ai-chat-widget">
            {isOpen && (
                <section
                    className="ai-chat-panel"
                    aria-label="AI Election Assistant"
                >
                    <header className="ai-chat-header">
                        <div className="ai-chat-heading">
                            <div className="ai-chat-avatar">
                                AI
                            </div>

                            <div>
                                <h2>Election Assistant</h2>
                                <p>
                                    {electionTitle ||
                                        "Your election guide"}
                                </p>
                            </div>
                        </div>

                        <div className="ai-chat-header-actions">
                            <button
                                type="button"
                                onClick={clearChat}
                                disabled={isLoading}
                                title="Clear chat"
                                aria-label="Clear chat"
                            >
                                ↻
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                title="Close assistant"
                                aria-label="Close assistant"
                            >
                                ×
                            </button>
                        </div>
                    </header>

                    <div className="ai-chat-notice">
                        AI-generated answers may be inaccurate.
                        Verify important election information.
                    </div>

                    {!electionId && (
                        <div className="ai-chat-select-notice">
                            Select an assigned election on your
                            dashboard to start asking questions.
                        </div>
                    )}

                    <div
                        className="ai-chat-messages"
                        aria-live="polite"
                    >
                        {messages.map((message, index) => (
                            <div
                                key={`${index}-${message.role}`}
                                className={`ai-chat-message ${message.role}`}
                            >
                                <div className="ai-chat-message-label">
                                    {message.role === "user"
                                        ? "You"
                                        : "AI Assistant"}
                                </div>

                                <div className="ai-chat-bubble">
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="ai-chat-message assistant">
                                <div className="ai-chat-message-label">
                                    AI Assistant
                                </div>

                                <div className="ai-chat-bubble ai-chat-loading">
                                    Thinking
                                    <span className="ai-chat-dots">
                                        ...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {error && (
                        <div
                            className="ai-chat-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <form
                        className="ai-chat-form"
                        onSubmit={sendMessage}
                    >
                        <textarea
                            ref={inputRef}
                            value={question}
                            onChange={(event) =>
                                setQuestion(event.target.value)
                            }
                            placeholder={
                                electionId
                                    ? "Ask about this election..."
                                    : "Select an election first"
                            }
                            rows={2}
                            maxLength={1000}
                            disabled={!electionId || isLoading}
                            aria-label="Your question"
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" &&
                                    !event.shiftKey
                                ) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                        />

                        <button
                            type="submit"
                            disabled={
                                !electionId ||
                                !question.trim() ||
                                isLoading
                            }
                            aria-label="Send message"
                            title="Send message"
                        >
                            {isLoading ? "…" : "➤"}
                        </button>
                    </form>

                    <div className="ai-chat-footer">
                        Answers are informational and do not affect votes.
                    </div>
                </section>
            )}

            <button
                type="button"
                className="ai-chat-launcher"
                onClick={() => setIsOpen((previous) => !previous)}
                aria-label={
                    isOpen
                        ? "Close AI Election Assistant"
                        : "Open AI Election Assistant"
                }
                aria-expanded={isOpen}
            >
                {isOpen ? "×" : "✦"}
                {!isOpen && (
                    <span>Ask AI</span>
                )}
            </button>
        </div>
    );
}

export default AIChat;
