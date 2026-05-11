"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { quizSets } from "@/lib/data";

const topics = ["PCA", "K-Means", "DBSCAN", "Perceptron", "Backpropagation", "CNN", "RNN", "Keras", "ReLU", "Overfitting", "SMOTE"];

export function SearchCommand() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return quizSets
      .filter((quiz) => {
        const haystack = [
          quiz.title,
          quiz.topic,
          quiz.section,
          ...quiz.weakSignals,
          ...quiz.bankQuestions.flatMap((question) => [question.prompt, ...question.choices])
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [normalizedQuery]);

  return (
    <section id="search" className="mx-auto scroll-mt-24 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="flex min-h-14 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4">
            <Search className="text-cyan-200" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-gray-500"
              placeholder="Rechercher PCA, K-Means, DBSCAN, Perceptron, Rétropropagation..."
              aria-label="Rechercher un quiz ou un sujet"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-xl">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setQuery(topic)}
                className="focus-ring min-h-10 shrink-0 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-gray-300 transition hover:border-cyan-300/40 hover:text-white"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {normalizedQuery ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {results.length > 0 ? (
              results.map((quiz) => (
                <Link
                  key={quiz.slug}
                  href={`/quiz/${quiz.slug}`}
                  className="focus-ring rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-red-500/45"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-gray-500">{quiz.section}</p>
                      <h3 className="mt-1 font-display text-lg font-semibold text-white">{quiz.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">{quiz.topic}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs text-gray-300">{quiz.questions} Q</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-400">
                Aucun quiz trouvé pour “{query.trim()}”.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
