import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/config";
import { apiFetch } from "../api";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import AnswerShape from "../components/AnswerShape";
import Card from "../components/Card";
import Input from "../components/Input";
import ErrorMessage from "../components/ErrorMessage";
import { answerStyles } from "../components/theme";

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
    <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <h1 className="text-4xl font-bold">Create a quiz</h1>

      <Card
        as="form"
        onSubmit={handleGenerate}
        aria-busy={generating}
        className="mt-6 p-5 ring-4 ring-answer-yellow sm:p-6"
      >
        <h2 className="flex items-center gap-2 text-2xl font-semibold">
          <span aria-hidden="true">✨</span> Generate with AI
        </h2>

        <label htmlFor="ai-topic" className="mt-4 block font-bold">
          Topic
        </label>
        <Input
          id="ai-topic"
          value={aiTopic}
          onChange={(e) => setAiTopic(e.target.value)}
          placeholder="Topic, e.g. JavaScript basics"
          maxLength={100}
          className="mt-1 text-lg"
        />

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="ai-difficulty" className="block font-bold">
              Difficulty
            </label>
            <Input
              as="select"
              id="ai-difficulty"
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(e.target.value)}
              className="mt-1 text-lg"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Input>
          </div>

          <div>
            <label htmlFor="ai-count" className="block font-bold">
              Questions
            </label>
            <Input
              id="ai-count"
              type="number"
              value={aiCount}
              onChange={(e) => setAiCount(e.target.value)}
              min={1}
              max={15}
              className="mt-1 text-lg"
            />
          </div>

          <Button
            type="submit"
            variant="brand"
            disabled={generating || saving}
            className="col-span-2 sm:col-span-1"
          >
            {generating && (
              <Spinner className="size-5 border-4 border-white/40 border-t-white" />
            )}
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>

        {generating && (
          <p role="status" className="mt-4 font-bold text-brand">
            This can take a few seconds.
          </p>
        )}
        {aiError && <ErrorMessage className="mt-4">{aiError}</ErrorMessage>}

        <p className="mt-4 flex gap-2 rounded-xl bg-brand/5 px-4 py-3 text-ink/80">
          <span aria-hidden="true">ℹ️</span>
          <span>
            AI can make mistakes. Review each question and its correct answer
            before saving.
          </span>
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <Card className="p-5 sm:p-6">
          <label
            htmlFor="quiz-title"
            className="block font-display text-2xl font-semibold"
          >
            Quiz title
          </label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
            maxLength={100}
            className="mt-1 text-2xl font-bold"
          />
        </Card>

        {questions.map((q, qIndex) => (
          <Card
            as="fieldset"
            key={q.id}
            className="relative min-w-0 p-5 sm:p-6"
          >
            <legend className="float-left font-display text-2xl font-semibold">
              Question {qIndex + 1}
            </legend>

            {questions.length > 1 && (
              <Button
                variant="outline"
                onClick={() => removeQuestion(q.id)}
                className="absolute top-4 right-4"
              >
                <span aria-hidden="true">🗑</span> Remove
                <span className="sr-only"> question {qIndex + 1}</span>
              </Button>
            )}

            <div className="clear-left pt-4">
              <label htmlFor={`text-${q.id}`} className="sr-only">
                Question {qIndex + 1} text
              </label>
              <Input
                id={`text-${q.id}`}
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                placeholder="Question text"
                maxLength={300}
                className="mt-1 text-xl font-semibold"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {q.options.map((opt, optIndex) => {
                  const stripe = answerStyles[optIndex % answerStyles.length];

                  return (
                    <div
                      key={optIndex}
                      className="flex overflow-hidden rounded-2xl border-4 border-ink/15 bg-white focus-within:border-brand has-checked:border-correct"
                    >
                      <span
                        className={`grid w-11 shrink-0 place-items-center ${stripe.color}`}
                      >
                        <AnswerShape shape={stripe.shape} className="size-5" />
                      </span>

                      <input
                        value={opt}
                        onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        aria-label={`Option ${optIndex + 1}`}
                        maxLength={100}
                        className="min-w-0 flex-1 px-3 py-3 text-lg text-ink placeholder:text-ink/40 focus:outline-none"
                      />

                      <label className="flex shrink-0 cursor-pointer items-center gap-2 border-l-2 border-ink/10 px-3 text-sm font-bold has-checked:bg-correct/20">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === optIndex}
                          onChange={() =>
                            updateQuestion(q.id, { correctIndex: optIndex })
                          }
                          className="size-5 accent-green-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        />
                        Correct
                        <span className="sr-only"> answer: option {optIndex + 1}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="rounded-3xl border-4 border-dashed border-white/60 bg-white/10 px-6 py-5 font-display text-2xl font-semibold transition-colors hover:bg-white/20 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none"
        >
          + Add question
        </button>

        <div className="sticky bottom-0 z-10 -mx-4 border-t-2 border-white/20 bg-brand-dark/90 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6">
          {error && <ErrorMessage className="mb-3">{error}</ErrorMessage>}
          <div className="flex items-center justify-between gap-4">
            <Button as={Link} to="/host" variant="ghost">
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Saving..." : "Save quiz"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default CreateQuizPage;
