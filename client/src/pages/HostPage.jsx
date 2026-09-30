import Lobby from "../components/Lobby";
import { useState, useEffect } from "react";
import socket from "../socket/socket";
const HostPage = () => {
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleRoomCreated = ({ code }) => {
      setRoomCode(code);
    };

    const handlePlayers = (players) => {
      setPlayers(players);
    };
    const handleQuestion = (data) => {
      console.log("Host received question:", data);
    };
    const handleQuizError = ({ message }) => {
      alert(message);
    };
    socket.on("room:created", handleRoomCreated);
    socket.on("room:players", handlePlayers);
    socket.on("quiz:question", handleQuestion);
    socket.on("quiz:error", handleQuizError);
    socket.connect();

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:players", handlePlayers);
      socket.off("quiz:question", handleQuestion);
      socket.off("quiz:error", handleQuizError);
      socket.disconnect();
    };
  }, []);
  const handleCreateRoom = () => {
    socket.emit("host:create-room");
  };
  const handleStartQuiz = () => {
    socket.emit("quiz:start", { roomCode });
  };
  const joinLink = `${window.location.origin}/join/${roomCode}`;
  return (
    <div>
      <h2>Host dashboard</h2>

      {!roomCode ? (
        <button onClick={handleCreateRoom}>Create room</button>
      ) : (
        <>
          <p>
            Room code: <strong>{roomCode}</strong>
          </p>
          <p>Share this link: {joinLink}</p>
          <Lobby players={players} />
          <button onClick={handleStartQuiz} disabled={players.length === 0}>
            Start quiz
          </button>
        </>
      )}
    </div>
  );
};

export default HostPage;
