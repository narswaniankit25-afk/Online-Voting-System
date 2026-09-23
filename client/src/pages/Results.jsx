import { useEffect, useState } from "react";
import api from "../api/api";

function Results() {
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        getResults();
    }, []);

    const getResults = async () => {
        try {
            const response = await api.get("/results");

            setResults(response.data.results);
            setMessage("");

        } catch (error) {
            console.log(error);

            setMessage(
                error.response?.data?.message ||
                "Unable to load results"
            );
        }
    };

    const getWinners = () => {
        if (results.length === 0) {
            return [];
        }

        const highestVotes = Math.max(
            ...results.map((result) => result.votes)
        );

        return results.filter(
            (result) => result.votes === highestVotes
        );
    };

    const winners = getWinners();

    return (
        <div>

            <h1>Election Results</h1>

            {message && (
                <p>{message}</p>
            )}

            {results.map((result) => (
                <div key={result.candidate}>

                    <h2>{result.candidate}</h2>

                    <p>
                        Party: {result.party}
                    </p>

                    <p>
                        Symbol: {result.symbol}
                    </p>

                    <p>
                        Votes: {result.votes}
                    </p>

                    <hr />

                </div>
            ))}

            {winners.length > 0 && (
                <div>

                    <hr />

                    {winners.length === 1 ? (
                        <div>

                            <h2>🏆 Winner</h2>

                            <h3>
                                {winners[0].candidate}
                            </h3>

                            <p>
                                Party: {winners[0].party}
                            </p>

                            <p>
                                Votes: {winners[0].votes}
                            </p>

                        </div>
                    ) : (
                        <div>

                            <h2>🤝 Tie</h2>

                            <p>
                                The election has ended in a tie between:
                            </p>

                            {winners.map((winner) => (
                                <div key={winner.candidate}>

                                    <h3>
                                        {winner.candidate}
                                    </h3>

                                    <p>
                                        Party: {winner.party}
                                    </p>

                                    <p>
                                        Votes: {winner.votes}
                                    </p>

                                </div>
                            ))}

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default Results;