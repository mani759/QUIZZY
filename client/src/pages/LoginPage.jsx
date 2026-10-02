import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import Card from "../components/Card";
import Input from "../components/Input";
import ErrorMessage from "../components/ErrorMessage";
import CenteredPage from "../components/CenteredPage";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const redirectTo = location.state?.from ?? "/host";

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate(redirectTo, { replace: true });
  };
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <CenteredPage>
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 sm:p-8"
      >
        <p className="text-center font-display text-4xl font-bold tracking-wide text-brand">
          QUIZZY
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold">
          {isSignup ? "Create a host account" : "Host login"}
        </h1>

        <label htmlFor="email" className="mt-6 block font-bold">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          className="mt-1 text-lg"
        />

        <label htmlFor="password" className="mt-4 block font-bold">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (at least 6 characters)"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={6}
          required
          className="mt-1 text-lg"
        />

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={loading}
          className="mt-6 w-full"
        >
          {loading && (
            <Spinner className="size-5 border-4 border-white/40 border-t-white" />
          )}
          {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </Button>

        {error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

        <div className="mt-6 border-t-2 border-ink/10 pt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(isSignup ? "signin" : "signup")}
            className="rounded-lg px-2 py-1 font-bold text-brand underline decoration-2 underline-offset-4 hover:decoration-4 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {isSignup
              ? "Already have an account? Log in"
              : "New here? Create an account"}
          </button>
        </div>
      </Card>
    </CenteredPage>
  );
};

export default LoginPage;
