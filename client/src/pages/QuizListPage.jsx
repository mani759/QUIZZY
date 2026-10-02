import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/config";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api";

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
    return <p>Loading quizzes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <p>
        Logged in as {user.email}{" "}
        <button type="button" onClick={signOut}>
          Log out
        </button>
      </p>
      <h2>Your quizzes</h2>
      <p>
        <Link to="/host/new">+ Create a new quiz</Link>
      </p>

      {quizzes.length === 0 ? (
        <p>No quizzes yet.</p>
      ) : (
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <strong>{quiz.title}</strong> ({quiz.questionCount} questions){" "}
              <Link to={`/host/${quiz.id}`}>Host</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuizListPage;
