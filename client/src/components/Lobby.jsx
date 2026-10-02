import WaitingDots from "./WaitingDots";
import { answerStyles } from "./theme";

// Pills cycle through the answer colors.
const pillColors = answerStyles.map((style) => style.color);

// `large` = projector size. Each pill pops in once, when it first mounts.
const PlayerPills = ({ players, nickname, large = false }) => {
  const size = large
    ? "px-5 py-2 text-2xl lg:px-6 lg:py-3 lg:text-3xl animate-pop motion-reduce:animate-none"
    : "px-4 py-2 text-lg";

  return (
    <ul className={`flex flex-wrap justify-center ${large ? "gap-4" : "gap-2"}`}>
      {players.map((player, i) => {
        const isMe = nickname && player.nickname === nickname;

        return (
          <li
            key={player.id}
            className={`rounded-full font-display font-semibold ${size} shadow-[0_4px_0_rgb(0_0_0/0.25)] ${pillColors[i % pillColors.length]} ${isMe ? "ring-4 ring-white" : ""}`}
          >
            {player.nickname}
            {isMe && <span className="ml-1 font-body text-sm">(you)</span>}
          </li>
        );
      })}
    </ul>
  );
};

// `nickname` is only passed by PlayerPage: it switches on the student view.
const Lobby = ({ players, nickname }) => {
  if (nickname) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-4 py-8 text-center">
        <div>
          <p className="font-display text-2xl font-semibold">You're in!</p>
          <h1 className="mt-1 text-5xl font-bold wrap-anywhere sm:text-6xl">
            {nickname}
          </h1>
        </div>

        <div className="flex flex-col items-center gap-3">
          <WaitingDots />
          <p className="text-lg font-semibold">
            Waiting for the host to start…
          </p>
        </div>

        <section className="w-full">
          <h2 className="mb-3 text-xl font-semibold">
            Players ({players.length})
          </h2>
          <PlayerPills players={players} nickname={nickname} />
        </section>
      </main>
    );
  }

  return (
    <section className="text-center">
      <h2 className="mb-6 text-4xl font-semibold lg:text-5xl">
        Players{" "}
        <span className="ml-2 inline-block rounded-full bg-white px-5 py-1 text-ink tabular-nums">
          {players.length}
        </span>
      </h2>

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-10">
          <WaitingDots />
          <p className="text-2xl font-semibold lg:text-3xl">Waiting for players to join…</p>
        </div>
      ) : (
        <PlayerPills players={players} large />
      )}
    </section>
  );
};

export default Lobby;
