import { useEffect, useState } from "react";

import Lobby from "../components/Lobby";
import { useNavigate, useParams } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";

import { QRCodeSVG } from "qrcode.react";
import socket from "../hostSocket";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import Card from "../components/Card";
import CenteredPage from "../components/CenteredPage";

const HostPage = () => {
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const { quizId } = useParams();
  const [quizTitle, setQuizTitle] = useState("");
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomCreated = ({ code, quizTitle }) => {
      setRoomCode(code);
      setQuizTitle(quizTitle);
    };

    const handlePlayers = (players) => {
      setPlayers(players);
    };

    const handleLeaderboard = (data) => {
      setLeaderboard(data);
    };

    const handleQuizError = ({ message }) => {
      alert(message);
    };
    const handleHostError = ({ message }) => {
      setChecking(false);
      alert(message);
    };
    const handleConnect = () => {
      socket.emit("host:resume");
    };

    const handleResumed = ({ code, quizTitle, players }) => {
      setRoomCode(code);
      setQuizTitle(quizTitle);
      setPlayers(players);
      setChecking(false);
    };

    const handleNoRoom = () => {
      setChecking(false);
    };

    socket.on("room:created", handleRoomCreated);
    socket.on("room:players", handlePlayers);
    socket.on("leaderboard:update", handleLeaderboard);
    socket.on("quiz:error", handleQuizError);
    socket.on("host:error", handleHostError);
    socket.on("connect", handleConnect);
    socket.on("room:resumed", handleResumed);
    socket.on("host:no-room", handleNoRoom);
    socket.connect();

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:players", handlePlayers);
      socket.off("leaderboard:update", handleLeaderboard);
      socket.off("quiz:error", handleQuizError);
      socket.off("host:error", handleHostError);
      socket.off("connect", handleConnect);
      socket.off("room:resumed", handleResumed);
      socket.off("host:no-room", handleNoRoom);
      socket.disconnect();
    };
  }, []);
  const handleCreateRoom = () => {
    socket.emit("host:create-room", { quizId });
  };

  const handleStartQuiz = () => {
    socket.emit("quiz:start", { roomCode });
  };
  const handleEndQuiz = () => {
    if (!window.confirm("End the quiz for everyone?")) return;

    socket.emit("quiz:end", { roomCode });
  };

  const handleCloseRoom = () => {
    socket.timeout(3000).emit("host:close-room", () => {
      navigate("/host");
    });
  };

  const joinLink = `${window.location.origin}/join/${roomCode}`;
  if (checking) {
    return (
      <CenteredPage className="gap-6 text-center">
        <Spinner className="size-16 border-8 border-white/25 border-t-white" />
        <p role="status" className="text-2xl font-semibold">
          Checking for a running session...
        </p>
      </CenteredPage>
    );
  }
  if (!roomCode) {
    return (
      <CenteredPage className="gap-8 text-center">
        <p className="font-display text-3xl font-semibold text-white/80">
          QUIZZY
        </p>
        <h1 className="text-4xl font-bold wrap-anywhere sm:text-5xl lg:text-7xl">
          {quizTitle || "Host dashboard"}
        </h1>
        <Button size="xl" onClick={handleCreateRoom}>
          Create room
        </Button>
      </CenteredPage>
    );
  }

  if (leaderboard) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[96rem] flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-white/20 pb-6">
          <div>
            <p className="font-display text-xl font-semibold text-white/80 sm:text-2xl">
              QUIZZY · Room {roomCode}
            </p>
            <h1 className="text-3xl font-bold wrap-anywhere sm:text-4xl">
              Quiz: <strong>{quizTitle}</strong>
            </h1>
          </div>

          {leaderboard.status === "playing" && (
            <Button variant="ghost" onClick={handleEndQuiz}>
              ⏹ End quiz
            </Button>
          )}
          {leaderboard.status === "finished" && (
            <Button onClick={handleCloseRoom}>Back to my quizzes</Button>
          )}
        </header>

        <Leaderboard data={leaderboard} />
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-[96rem] items-start gap-10 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-12">
      <Card
        as="section"
        className="flex flex-col items-center gap-6 p-6 text-center sm:p-8"
      >
        <h1 className="text-3xl font-bold text-brand wrap-anywhere">
          {quizTitle}
        </h1>

        <div>
          <p className="text-2xl font-bold">Join at</p>
          <p className="font-display text-2xl font-semibold break-all text-brand sm:text-3xl">
            {joinLink}
          </p>
        </div>

        <div>
          <p className="text-2xl font-bold">Room code</p>
          {/* Sized so all 6 digits fit the card at every width; pl-[0.1em]
              balances the extra space tracking adds after the last digit. */}
          <p className="pl-[0.1em] font-display text-6xl leading-none font-bold tracking-widest sm:text-7xl 2xl:text-8xl">
            {roomCode}
          </p>
        </div>

        <QRCodeSVG
          value={joinLink}
          title={`QR code for ${joinLink}`}
          size={256}
          level="M"
          marginSize={2}
          className="h-auto w-full max-w-72"
        />
      </Card>

      <section className="flex flex-col items-center gap-10">
        <Lobby players={players} />

        <div className="flex flex-col items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              if (
                window.confirm(
                  "Close this room? Students in the lobby will be sent away.",
                )
              ) {
                handleCloseRoom();
              }
            }}
          >
            Close room
          </Button>
          <Button
            size="xl"
            onClick={handleStartQuiz}
            disabled={players.length === 0}
          >
            Start quiz
          </Button>
          {players.length === 0 && (
            <p className="text-xl font-semibold">
              Start unlocks when the first player joins
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default HostPage;
