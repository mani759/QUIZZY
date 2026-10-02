import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import Lobby from "../components/Lobby";
import QuestionView from "../components/QuestionView";
import Button from "../components/Button";
import WaitingDots from "../components/WaitingDots";
import Card from "../components/Card";
import Input from "../components/Input";
import ErrorMessage from "../components/ErrorMessage";
import CenteredPage from "../components/CenteredPage";
import { medals } from "../components/theme";

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
    const medal = medals[finalResult.rank];

    return (
      <CenteredPage className="gap-2 text-center">
        <h1 className="text-4xl font-bold">Quiz over!</h1>

        {medal && (
          <span
            role="img"
            aria-label={medal.label}
            className="mt-4 text-8xl animate-pop motion-reduce:animate-none"
          >
            {medal.emoji}
          </span>
        )}

        <p className="mt-4 text-xl font-semibold">
          You ranked{" "}
          <strong className="block font-display text-9xl leading-none font-bold animate-pop motion-reduce:animate-none">
            #{finalResult.rank}
          </strong>
          of {finalResult.totalPlayers}
        </p>

        <p className="mt-6 rounded-full bg-white px-6 py-2 font-display text-2xl font-semibold text-ink">
          Your score: {finalResult.score}
        </p>
      </CenteredPage>
    );
  }
  if (closedMessage) {
    return (
      <CenteredPage>
        <div className="w-full max-w-sm rounded-3xl bg-white/10 p-6 text-center ring-2 ring-white/25 sm:p-8">
          <span role="img" aria-label="Waving hand" className="text-5xl">
            👋
          </span>
          <h1 className="mt-3 text-3xl font-semibold">Session ended</h1>
          <p className="mt-2 text-lg">{closedMessage}</p>
          <p className="mt-4 text-white/80">You can close this tab now.</p>
        </div>
      </CenteredPage>
    );
  }

  if (finished) {
    return (
      <CenteredPage className="gap-4 text-center">
        <span
          role="img"
          aria-label="Party popper"
          className="text-7xl animate-pop motion-reduce:animate-none"
        >
          🎉
        </span>
        <h1 className="text-5xl font-bold">You finished!</h1>
        <p className="rounded-full bg-white px-6 py-2 font-display text-3xl font-semibold text-ink">
          Your score: {score}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <WaitingDots />
          <p className="text-lg font-semibold">
            Waiting for the others to finish...
          </p>
        </div>
      </CenteredPage>
    );
  }

  if (currentQuestion) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 py-4 sm:py-8">
        <QuestionView
          data={currentQuestion}
          selectedOption={selectedOption}
          correctOption={result ? result.correctOption : null}
          disabled={submitting || result !== null}
          onAnswer={handleAnswer}
        />

        <div aria-live="polite" className="flex flex-col gap-3">
          {result &&
            (result.correct ? (
              <p className="rounded-2xl bg-correct px-4 py-3 text-center font-display text-3xl font-bold text-ink animate-pop motion-reduce:animate-none">
                ✓ Correct!
              </p>
            ) : (
              <p className="rounded-2xl bg-wrong px-4 py-3 text-center font-display text-3xl font-bold text-white animate-shake motion-reduce:animate-none">
                ✕ Wrong answer
              </p>
            ))}

          <div className="flex flex-wrap items-center gap-3">
            <p className="shrink-0 rounded-full bg-white/15 px-4 py-2 font-display text-xl font-semibold">
              Score: {score}
            </p>
            {result && (
              <Button onClick={handleNext} className="grow">
                {result.nextQuestion ? "Next question" : "See my score"}
              </Button>
            )}
          </div>

          {error && <ErrorMessage className="text-center">{error}</ErrorMessage>}
        </div>
      </main>
    );
  }

  if (joined) {
    return <Lobby players={players} nickname={nickname.trim()} />;
  }

  return (
    <CenteredPage>
      <Card
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleJoin();
        }}
        className="w-full max-w-sm p-6 text-center sm:p-8"
      >
        <h1 className="text-5xl font-bold tracking-wide text-brand">QUIZZY</h1>

        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-ink/70">
          Room code
        </p>
        <p className="pl-[0.2em] font-display text-3xl font-semibold tracking-[0.2em]">
          {code}
        </p>

        <label htmlFor="nickname" className="sr-only">
          Your nickname
        </label>
        <Input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Your nickname"
          maxLength={20}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "join-error" : undefined}
          className="mt-6 text-center text-2xl font-bold"
        />

        <Button type="submit" variant="brand" size="lg" className="mt-4 w-full">
          Join
        </Button>

        {error && (
          <ErrorMessage id="join-error" className="mt-4">
            {error}
          </ErrorMessage>
        )}
      </Card>
    </CenteredPage>
  );
};

export default PlayerPage;
