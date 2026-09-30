const Lobby = ({ players }) => {
  return (
    <div>
      <h1>QUIZZY</h1>

      <h2>Players ({players.length})</h2>

      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.nickname}</li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
