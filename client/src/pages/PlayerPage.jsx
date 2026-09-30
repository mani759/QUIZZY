import { useEffect, useState } from "react";
import socket from "../socket/socket";
import Lobby from "../components/Lobby";
import { useParams } from "react-router-dom";
import QuestionView from "../components/QuestionView";
const PlayerPage = () => {
  const { code } = useParams();
  const [players, setPlayers] = useState([]);
  const [nickName, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const handlePlayers = (players) => {
      console.log("Players:", players);
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
    };

    socket.on("room:players", handlePlayers);
    socket.on("player:join:error", handleJoinError);
    socket.on("connect_error", handleConnectError);
    socket.on("quiz:question", handleQuestion);
    socket.connect();
    return () => {
      socket.off("room:players", handlePlayers);
      socket.off("player:join:error", handleJoinError);
      socket.off("connect_error", handleConnectError);
      // in the cleanup:
      socket.off("quiz:question", handleQuestion);
      socket.disconnect();
    };
  }, []);
  const handleJoin = () => {
    const trimmed = nickName.trim();
    if (!trimmed) {
      setError("Please enter a nickname");
      return;
    }
    setError("");
    socket.emit("player:join", { roomCode: code, nickname: trimmed });
  };
  if (currentQuestion) {
    return <QuestionView data={currentQuestion} />;
  }
  if (joined) {
    return <Lobby players={players} />;
  }
  return (
    <div>
      <h2>Join room {code}</h2>
      <input
        value={nickName}
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
