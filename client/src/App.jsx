import { useEffect } from "react";
import { io } from "socket.io-client";

import "./App.css";
const App = () => {
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });
    socket.emit("player:join", {
      roomCode: "876151",
      nickname: "Mani",
    });

    socket.on("room:players", (players) => {
      console.log("Players:", players);
    });

    socket.on("player:join:error", (error) => {
      console.log("Join failed:", error);
    });

    return () => {
      socket.off("room:players");
      socket.off("player:join:error");
      socket.disconnect();
    };
  }, []);
  return (
    <>
      <h1>QUIZZY</h1>
    </>
  );
};

export default App;
