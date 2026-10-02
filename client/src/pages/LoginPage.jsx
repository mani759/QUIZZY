import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    <form onSubmit={handleSubmit}>
      <h2>{isSignup ? "Create a host account" : "Host login"}</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (at least 6 characters)"
        minLength={6}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
      </button>

      {error && <p>{error}</p>}

      <p>
        <button
          type="button"
          onClick={() => setMode(isSignup ? "signin" : "signup")}
        >
          {isSignup
            ? "Already have an account? Log in"
            : "New here? Create an account"}
        </button>
      </p>
    </form>
  );
};

export default LoginPage;
