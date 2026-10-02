import { useEffect, useState } from "react";

import Lobby from "../components/Lobby";
import Leaderboard from "../components/Leaderboard";
import { useParams } from "react-router-dom";
import socket from "../hostSocket";

const HostPage = () => {
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const { quizId } = useParams();
  const [quizTitle, setQuizTitle] = useState("");
  const [checking, setChecking] = useState(true);

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

  const joinLink = `${window.location.origin}/join/${roomCode}`;
  if (checking) {
    return <p>Checking for a running session...</p>;
  }
  if (!roomCode) {
    return (
      <div>
        <h2>Host dashboard</h2>
        <button onClick={handleCreateRoom}>Create room</button>
      </div>
    );
  }

  if (leaderboard) {
    return (
      <div>
        <h2>Host dashboard · Room {roomCode}</h2>
        <p>
          Quiz: <strong>{quizTitle}</strong>
        </p>
        <Leaderboard data={leaderboard} />
        {leaderboard.status === "playing" && (
          <button onClick={handleEndQuiz}>End quiz</button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Host dashboard</h2>
      <p>
        Room code: <strong>{roomCode}</strong>
      </p>
      <p>Share this link: {joinLink}</p>
      <Lobby players={players} />
      <button onClick={handleStartQuiz} disabled={players.length === 0}>
        Start quiz
      </button>
    </div>
  );
};

export default HostPage;
