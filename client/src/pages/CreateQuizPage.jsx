import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/config";
import { apiFetch } from "../api";

const emptyQuestion = () => ({
  id: crypto.randomUUID(),
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

const CreateQuizPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiCount, setAiCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const updateQuestion = (questionId, changes) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...changes } : q)),
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) =>
                i === optionIndex ? value : opt,
              ),
            }
          : q,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiFetch("/api/quizzes", {
        method: "POST",
        body: JSON.stringify({ title, questions }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save quiz");
        return;
      }

      navigate("/host");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server");
    } finally {
      setSaving(false);
    }
  };
  const handleGenerate = async (e) => {
    e.preventDefault();

    const hasContent = questions.some(
      (q) => q.text.trim() || q.options.some((opt) => opt.trim()),
    );

    if (
      hasContent &&
      !window.confirm("Replace your current questions with AI-generated ones?")
    ) {
      return;
    }

    setGenerating(true);
    setAiError("");

    try {
      const res = await apiFetch("/api/quizzes/generate", {
        method: "POST",
        body: JSON.stringify({
          topic: aiTopic,
          difficulty: aiDifficulty,
          count: Number(aiCount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || "Could not generate questions");
        return;
      }

      setQuestions(
        data.questions.map((q) => ({ ...q, id: crypto.randomUUID() })),
      );

      if (!title.trim()) {
        setTitle(aiTopic.trim());
      }
    } catch (err) {
      console.error(err);
      setAiError("Could not reach the server");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h2>Create a quiz</h2>

      <form onSubmit={handleGenerate}>
        <h3>Generate with AI</h3>

        <input
          value={aiTopic}
          onChange={(e) => setAiTopic(e.target.value)}
          placeholder="Topic, e.g. JavaScript basics"
          maxLength={100}
        />

        <select
          value={aiDifficulty}
          onChange={(e) => setAiDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <input
          type="number"
          value={aiCount}
          onChange={(e) => setAiCount(e.target.value)}
          min={1}
          max={15}
        />

        <button type="submit" disabled={generating || saving}>
          {generating ? "Generating..." : "Generate"}
        </button>

        {generating && <p>This can take a few seconds.</p>}
        {aiError && <p>{aiError}</p>}
      </form>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz title"
          maxLength={100}
        />

        {questions.map((q, qIndex) => (
          <fieldset key={q.id}>
            <legend>Question {qIndex + 1}</legend>

            <input
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              placeholder="Question text"
              maxLength={300}
            />

            {q.options.map((opt, optIndex) => (
              <div key={optIndex}>
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.correctIndex === optIndex}
                  onChange={() =>
                    updateQuestion(q.id, { correctIndex: optIndex })
                  }
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                  placeholder={`Option ${optIndex + 1}`}
                  maxLength={100}
                />
              </div>
            ))}

            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(q.id)}>
                Remove question
              </button>
            )}
          </fieldset>
        ))}

        <button type="button" onClick={addQuestion}>
          Add question
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save quiz"}
        </button>

        {error && <p>{error}</p>}

        <p>
          <Link to="/host">Cancel</Link>
        </p>
      </form>
    </div>
  );
};

export default CreateQuizPage;
