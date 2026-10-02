import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/config";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import Card from "../components/Card";
import CenteredPage from "../components/CenteredPage";

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, signOut } = useAuth();

  useEffect(() => {
    let ignore = false;

    const loadQuizzes = async () => {
      try {
        const res = await apiFetch("/api/quizzes");

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        if (!ignore) {
          setQuizzes(data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError("Could not load quizzes");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadQuizzes();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <CenteredPage className="gap-6 text-center">
        <Spinner className="size-16 border-8 border-white/25 border-t-white" />
        <p role="status" className="text-2xl font-semibold">
          Loading quizzes...
        </p>
      </CenteredPage>
    );
  }

  if (error) {
    return (
      <CenteredPage>
        <Card className="w-full max-w-sm p-6 text-center sm:p-8">
          <span role="img" aria-label="Warning" className="text-5xl">
            ⚠️
          </span>
          <p role="alert" className="mt-3 text-xl font-bold text-red-700">
            {error}
          </p>
          <p className="mt-2 text-ink/70">
            Check that the server is running, then refresh the page.
          </p>
        </Card>
      </CenteredPage>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b-2 border-white/15 bg-brand-dark/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <p className="font-display text-3xl font-bold tracking-wide">QUIZZY</p>
          <div className="flex min-w-0 items-center gap-4">
            <p className="hidden min-w-0 truncate text-white/85 sm:block">
              Logged in as <strong className="text-white">{user.email}</strong>
            </p>
            <Button variant="ghost" onClick={signOut}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="mb-1 truncate text-sm text-white/85 sm:hidden">
          Logged in as <strong className="text-white">{user.email}</strong>
        </p>
        <h1 className="text-4xl font-bold">Your quizzes</h1>

        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <Link
              to="/host/new"
              className="flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed border-white/60 bg-white/10 p-6 text-center transition-colors hover:bg-white/20 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none"
            >
              <span aria-hidden="true" className="font-display text-6xl leading-none">
                +
              </span>
              <span className="font-display text-2xl font-semibold">
                Create a new quiz
              </span>
              <span className="text-white/85">Write it yourself or use AI</span>
            </Link>
          </li>

          {quizzes.map((quiz) => (
            <Card
              as="li"
              key={quiz.id}
              className="flex min-h-48 flex-col gap-4 p-6"
            >
              <h2 className="line-clamp-2 text-2xl font-semibold wrap-anywhere">
                {quiz.title}
              </h2>
              <p className="w-fit rounded-full bg-brand/10 px-3 py-1 font-bold text-brand">
                {quiz.questionCount} questions
              </p>
              <Button
                as={Link}
                to={`/host/${quiz.id}`}
                variant="brand"
                className="mt-auto w-full"
              >
                Host<span className="sr-only"> {quiz.title}</span>
              </Button>
            </Card>
          ))}
        </ul>

        {quizzes.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white/10 p-6 text-center">
            <p className="font-display text-2xl font-semibold">No quizzes yet.</p>
            <p className="mt-1 text-white/85">
              Create your first one with the card above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizListPage;
