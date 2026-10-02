import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import Lobby from "../components/Lobby";
import QuestionView from "../components/QuestionView";

const PlayerPage = () => {
  const { code } = useParams();

  // Joining
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState([]);

  // Quiz
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [closedMessage, setClosedMessage] = useState("");
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    const handlePlayers = (players) => {
      setPlayers(players);
      setJoined(true);
    };

    const handleJoinError = ({ message }) => {
      setError(message);
    };

    const handleConnectError = (err) => {
      console.error("Socket connection failed:", err.message);
    };

    const handleQuestion = (data) => {
      setCurrentQuestion(data);
      setSelectedOption(null);
      setResult(null);
      setError("");
    };

    const handleAnswerResult = (data) => {
      setResult(data);
      setScore(data.score);
      setSubmitting(false);
    };

    const handleAnswerError = ({ message }) => {
      setError(message);
      setSelectedOption(null);
      setSubmitting(false);
    };
    const handleRoomClosed = ({ message }) => {
      setClosedMessage(message);
    };
    const handleQuizEnded = (data) => {
      setFinalResult(data);
    };

    socket.on("room:players", handlePlayers);
    socket.on("player:join:error", handleJoinError);
    socket.on("connect_error", handleConnectError);
    socket.on("quiz:question", handleQuestion);
    socket.on("quiz:answer:result", handleAnswerResult);
    socket.on("quiz:answer:error", handleAnswerError);
    socket.on("room:closed", handleRoomClosed);
    socket.on("quiz:ended", handleQuizEnded);
    socket.connect();

    return () => {
      socket.off("room:players", handlePlayers);
      socket.off("player:join:error", handleJoinError);
      socket.off("connect_error", handleConnectError);
      socket.off("quiz:question", handleQuestion);
      socket.off("quiz:answer:result", handleAnswerResult);
      socket.off("quiz:answer:error", handleAnswerError);

      socket.off("room:closed", handleRoomClosed);
      socket.off("quiz:ended", handleQuizEnded);
      socket.disconnect();
    };
  }, []);

  const handleJoin = () => {
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError("Please enter a nickname");
      return;
    }

    setError("");
    socket.emit("player:join", { roomCode: code, nickname: trimmed });
  };

  const handleAnswer = (optionIndex) => {
    if (submitting || result) return;

    setSelectedOption(optionIndex);
    setSubmitting(true);
    setError("");

    socket.emit("quiz:answer", {
      roomCode: code,
      questionIndex: currentQuestion.index,
      optionIndex,
    });
  };

  const handleNext = () => {
    if (result.nextQuestion) {
      setCurrentQuestion(result.nextQuestion);
      setSelectedOption(null);
      setResult(null);
    } else {
      setFinished(true);
    }
  };
  if (finalResult) {
    return (
      <div>
        <h2>Quiz over!</h2>
        <p>
          You ranked <strong>#{finalResult.rank}</strong> of{" "}
          {finalResult.totalPlayers}
        </p>
        <p>Your score: {finalResult.score}</p>
      </div>
    );
  }
  if (closedMessage) {
    return (
      <div>
        <h2>Session ended</h2>
        <p>{closedMessage}</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div>
        <h2>You finished!</h2>
        <p>Your score: {score}</p>
        <p>Waiting for the others to finish...</p>
      </div>
    );
  }

  if (currentQuestion) {
    return (
      <div>
        <p>Score: {score}</p>

        <QuestionView
          data={currentQuestion}
          selectedOption={selectedOption}
          correctOption={result ? result.correctOption : null}
          disabled={submitting || result !== null}
          onAnswer={handleAnswer}
        />

        {result && (
          <div>
            <p>{result.correct ? "Correct!" : "Wrong answer"}</p>
            <button onClick={handleNext}>
              {result.nextQuestion ? "Next question" : "See my score"}
            </button>
          </div>
        )}

        {error && <p>{error}</p>}
      </div>
    );
  }

  if (joined) {
    return <Lobby players={players} />;
  }

  return (
    <div>
      <h2>Join room {code}</h2>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Your nickname"
        maxLength={20}
      />
      <button onClick={handleJoin}>Join</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default PlayerPage;
