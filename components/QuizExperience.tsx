"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, RotateCcw, X } from "lucide-react";
import { QuizSet } from "@/lib/data";
import { useQuizStore } from "@/store/useQuizStore";

export function QuizExperience({ quiz }: { quiz: QuizSet }) {
  const { currentIndex, answers, selectAnswer, next, previous, reset } = useQuizStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finishedEarly, setFinishedEarly] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const resultSoundPlayedRef = useRef(false);
  const questions = quiz.bankQuestions;
  const completed = finishedEarly || currentIndex >= questions.length;
  const question = questions[Math.min(currentIndex, Math.max(questions.length - 1, 0))];
  const questionId = question ? `${quiz.slug}-${question.number}` : "";
  const quizAnswers = useMemo(() => answers.filter((item) => item.questionId.startsWith(`${quiz.slug}-`)), [answers, quiz.slug]);
  const answeredQuestionIds = useMemo(() => new Set(quizAnswers.map((item) => item.questionId)), [quizAnswers]);
  const progress = questions.length === 0 ? 0 : finishedEarly ? (quizAnswers.length / questions.length) * 100 : completed ? 100 : ((currentIndex + 1) / questions.length) * 100;
  const selected = answers.find((item) => item.questionId === questionId);
  const canContinue = Boolean(selected);

  useEffect(() => {
    setElapsedSeconds(0);
    setFinishedEarly(false);
    setShowFinishConfirm(false);
    resultSoundPlayedRef.current = false;
    reset();
  }, [quiz.slug, reset]);

  useEffect(() => {
    if (completed) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [completed, quiz.slug]);

  const score = useMemo(() => quizAnswers.filter((item) => item.correct).length, [quizAnswers]);
  const scoreBase = finishedEarly ? quizAnswers.length : questions.length;
  const resultLabel = `${score}/${scoreBase}`;
  const scorePercent = scoreBase === 0 ? 0 : Math.round((score / scoreBase) * 100);
  const resultQuestions = finishedEarly ? questions.filter((item) => answeredQuestionIds.has(`${quiz.slug}-${item.number}`)) : questions;
  const elapsedLabel = formatTime(elapsedSeconds);

  function restartQuiz() {
    setFinishedEarly(false);
    setShowFinishConfirm(false);
    resultSoundPlayedRef.current = false;
    reset();
  }

  function finishNow() {
    setShowFinishConfirm(false);
    setFinishedEarly(true);
  }

  useEffect(() => {
    if (!completed || resultSoundPlayedRef.current || questions.length === 0 || typeof window === "undefined") {
      return;
    }

    resultSoundPlayedRef.current = true;
    const audio = new Audio(getResultSound(scorePercent));
    audio.play().catch(() => {
      resultSoundPlayedRef.current = false;
    });
  }, [completed, questions.length, scorePercent]);

  if (!question) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="nothing-panel rounded-[1.35rem] p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft size={16} />
            Retour aux quiz
          </Link>
          <h1 className="mt-6 dot-title text-3xl font-semibold">Aucune question disponible</h1>
          <p className="mt-3 text-gray-400">Ce quiz ne contient pas encore de questions extractibles.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] pb-24 lg:pb-0">
      <div className="fixed left-0 right-0 top-16 z-30 h-1 bg-white/10">
        <div className="h-full bg-accent-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
              <ArrowLeft size={16} />
              Retour aux quiz
            </Link>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase text-gray-500">{quiz.section}</p>
              <h1 className="mt-2 font-display text-2xl font-semibold">{quiz.title}</h1>
              <p className="mt-2 text-sm text-gray-400">{quiz.topic} · {quiz.questions} questions</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label={completed ? "Score" : "Répondu"} value={completed ? resultLabel : `${quizAnswers.length}/${questions.length}`} />
                <Metric label="Questions" value={`${questions.length}`} />
              </div>
              <div className="mt-3">
                <Metric label="Chrono" value={elapsedLabel} />
              </div>
              {!completed ? (
                <button
                  onClick={() => setShowFinishConfirm(true)}
                  className="focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-red-500/35 bg-red-500/[0.08] px-4 font-semibold text-red-100 transition hover:border-red-400/70 hover:bg-red-500/[0.14]"
                >
                  <BarChart3 size={16} />
                  Résultats
                </button>
              ) : null}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="nothing-chip rounded-full px-4 py-2 text-sm">{quiz.title}</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="nothing-chip rounded-full px-4 py-2 font-mono text-sm">Chrono {elapsedLabel}</div>
              {!completed ? (
                <button
                  onClick={() => setShowFinishConfirm(true)}
                  className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-500/35 bg-red-500/[0.08] px-4 text-sm font-semibold text-red-100 transition hover:border-red-400/70 hover:bg-red-500/[0.14]"
                >
                  <BarChart3 size={16} />
                  Résultats
                </button>
              ) : null}
            </div>
          </div>

          <div className="nothing-panel relative overflow-hidden rounded-[1.35rem] p-4 sm:p-6 lg:p-8">
            <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-gray-300">
              {Math.round(progress)}%
            </div>

            {completed ? (
              <div className="animate-reveal">
                <p className="dot-title text-sm text-red-400">{finishedEarly ? "Résultats instantanés" : "Score final"}</p>
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="dot-title text-6xl font-semibold leading-none sm:text-8xl">{resultLabel}</h2>
                    <p className="mt-3 max-w-2xl text-gray-300">
                      {finishedEarly ? "Quiz arrêté. Les questions non répondues sont ignorées dans ce score." : `Correction complète pour ${quiz.title}.`} Temps total: {elapsedLabel}.
                    </p>
                  </div>
                  <button onClick={restartQuiz} className="neon-border focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-5 font-semibold transition hover:scale-[1.02]">
                    <RotateCcw size={17} />
                    Refaire le quiz
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Metric label="Correctes" value={`${score}`} />
                  <Metric label="Répondues" value={`${quizAnswers.length}/${questions.length}`} />
                  <Metric label="Pourcentage" value={`${scorePercent}%`} />
                </div>

                <div className="mt-8 space-y-3">
                  {resultQuestions.length === 0 ? (
                    <div className="rounded-[1rem] border border-white/15 bg-black/30 p-5 text-gray-300">
                      Aucune question répondue pour le moment.
                    </div>
                  ) : null}
                  {resultQuestions.map((item) => {
                    const id = `${quiz.slug}-${item.number}`;
                    const answer = answers.find((entry) => entry.questionId === id);
                    const isCorrect = answer?.correct === true;
                    const selectedChoice = typeof answer?.selected === "number" ? item.choices[answer.selected] : "Non répondu";
                    const correctChoice = item.choices[item.answer];

                    return (
                      <div key={id} className={`rounded-[1rem] border p-4 ${isCorrect ? "border-white/18 bg-white/[0.045]" : "border-red-500/45 bg-red-500/[0.08]"}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="dot-title text-xs text-gray-500">Question {item.number}</p>
                            <h3 className="mt-2 font-display text-lg font-semibold text-white">{item.prompt}</h3>
                          </div>
                          <span className={`w-fit rounded-full border px-3 py-1 font-mono text-xs ${isCorrect ? "border-white/20 text-white" : "border-red-400/50 text-red-300"}`}>
                            {isCorrect ? "Correct" : "Faux"}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                            <p className="dot-title text-[11px] text-gray-500">Votre réponse</p>
                            <p className="mt-1 text-gray-200">{selectedChoice}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
                            <p className="dot-title text-[11px] text-gray-500">Correction</p>
                            <p className="mt-1 text-white">{correctChoice}</p>
                          </div>
                        </div>
                        <section className="mt-3 rounded-xl border border-emerald-400/35 bg-emerald-500/[0.08] p-3 text-sm text-gray-100">
                          <p className="dot-title text-[11px] text-gray-500">Pourquoi c’est vrai ?</p>
                          <p className="mt-2 font-semibold">{correctChoice}</p>
                          <p className="mt-1 text-gray-300">{getCorrectExplanation(correctChoice, item.explanation)}</p>
                        </section>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div key={`${questionId}-${currentIndex}`} className="animate-slideIn">
                <p className="text-sm uppercase text-gray-500">
                  Question {question.number} / {questions.length}
                </p>
                <h2 className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  {question.prompt}
                </h2>

                <div className="mt-8 grid gap-3">
                  {question.choices.map((choice, index) => {
                    const isSelected = selected?.selected === index;
                    return (
                      <div key={choice}>
                        <button
                          onClick={() => selectAnswer({ questionId, selected: index, correct: index === question.answer })}
                          className={`focus-ring min-h-16 w-full rounded-[1.15rem] border p-4 text-left transition hover:scale-[1.01] sm:p-5 ${
                            isSelected ? "border-red-400/55 bg-red-500/[0.08]" : "border-white/15 bg-black/35 hover:border-white/35"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-black/50 font-mono text-sm text-gray-300">
                              {index + 1}
                            </span>
                            <span className="text-base text-gray-100">{choice}</span>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!completed ? (
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button onClick={restartQuiz} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-gray-300 transition hover:border-red-500/45 hover:text-white">
                  <RotateCcw size={17} />
                  Recommencer
                </button>
                <div className="flex gap-3">
                  <button onClick={previous} className="focus-ring min-h-12 rounded-full border border-white/15 px-5 text-gray-300 transition hover:border-white/35 hover:text-white">
                    Précédent
                  </button>
                  <button
                    onClick={next}
                    disabled={!canContinue}
                    className="neon-border focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-5 font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    {currentIndex >= questions.length - 1 ? "Voir le score" : "Suivant"} <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showFinishConfirm ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 px-4 backdrop-blur-md">
          <div className="nothing-panel w-full max-w-md animate-reveal rounded-[1.25rem] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="dot-title text-xs text-red-400">Voir les résultats</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Terminer le quiz ?</h2>
              </div>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-gray-300 transition hover:border-white/35 hover:text-white"
                aria-label="Annuler"
                title="Annuler"
              >
                <X size={17} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-300">
              Are you sure you want to finish the quiz and see your results?
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="Correctes" value={`${score}`} />
              <Metric label="Répondues" value={`${quizAnswers.length}`} />
              <Metric label="Progression" value={`${Math.round(progress)}%`} />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 font-semibold text-gray-300 transition hover:border-white/35 hover:text-white"
              >
                Resume Quiz
              </button>
              <button
                onClick={finishNow}
                className="neon-border focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-5 font-semibold text-white transition hover:scale-[1.02]"
              >
                <BarChart3 size={17} />
                See Results
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="font-mono text-xl text-white">{value}</div>
      <div className="text-xs uppercase text-gray-500">{label}</div>
    </div>
  );
}

function getCorrectExplanation(correctChoice: string, explanation: string) {
  const detail = explanation.replace(/^Réponse correcte:\s*/i, "").trim();

  if (detail && detail !== correctChoice) {
    return detail;
  }

  return `C’est la bonne réponse parce qu’elle correspond directement à la notion demandée dans la question.`;
}

function getResultSound(scorePercent: number) {
  if (scorePercent >= 80) {
    return "/sounds/WOOW.mp3";
  }

  if (scorePercent < 40) {
    return "/sounds/HAHAHAH.wav";
  }

  return "/sounds/MMMM.mp3";
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}
