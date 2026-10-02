import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

const HomePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    const cleanCode = code.trim();

    if (/^\d{6}$/.test(cleanCode)) {
      navigate(`/join/${cleanCode}`);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-6xl font-bold tracking-tight mb-2">
          QUIZZY
        </h1>
        <p className="text-white/80 mb-8">Live quizzes, powered by AI</p>

        <form
          onSubmit={handleJoin}
          className="bg-white rounded-3xl p-6 shadow-2xl space-y-4"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Room code"
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-2xl text-center font-bold tracking-widest text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none"
          />
          <Button
            type="submit"
            variant="brand"
            className="w-full"
            disabled={code.length !== 6}
          >
            Join quiz
          </Button>
        </form>

        <p className="mt-8 text-white/80">
          Hosting a quiz?{" "}
          <Link
            to="/host"
            className="font-bold text-white underline underline-offset-4"
          >
            Go to your dashboard
          </Link>
        </p>
      </div>
    </main>
  );
};

export default HomePage;
