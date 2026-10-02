const Leaderboard = ({ data }) => {
  const { totalQuestions, players } = data;
  const allFinished =
    players.length > 0 && players.every((p) => p.finished || !p.connected);

  return (
    <div>
      <h2>
        {data.status === "finished" ? "Final results" : "Live leaderboard"}
      </h2>
      {allFinished && <p>Everyone has finished!</p>}

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => (
            <tr key={player.id}>
              <td>{i + 1}</td>
              <td>{player.nickname}</td>
              <td>{player.score}</td>
              <td>{player.rank}</td>

              <td>
                {player.answered} / {totalQuestions}
                {player.finished && " ✓"}
              </td>
              <td>
                {player.nickname}
                {!player.connected && " (disconnected)"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
