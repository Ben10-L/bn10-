"use client";

import Link from "next/link";
import {
  BarChart3,
  BrainCircuit,
  Code2,
  DatabaseZap,
  GitBranch,
  Layers3,
  Network,
  Play,
  Sparkles,
  Target,
  Timer
} from "lucide-react";
import { ParticleField } from "@/components/ParticleField";
import { SearchCommand } from "@/components/SearchCommand";
import { quizSets } from "@/lib/data";

const quizIcons = {
  brain: BrainCircuit,
  chart: BarChart3,
  database: DatabaseZap,
  timer: Timer,
  branch: GitBranch,
  target: Target,
  network: Network,
  layers: Layers3,
  code: Code2
};

export function HomeExperience() {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
        <div className="animate-reveal">
          <div className="nothing-chip mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm">
            <Sparkles size={16} />
            Quiz PDF / ordre original
          </div>
          <h1 className="dot-title max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Révision Machine Learning & Réseaux de Neurones
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Une interface simple pour réviser les QCM de Machine Learning, Perceptron, MLP, Keras, apprentissage non supervisé, prétraitement et métriques d’évaluation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/quiz/quiz-1" className="neon-border focus-ring rounded-full bg-black px-5 py-4 font-semibold transition hover:scale-[1.02]">
              <span className="flex items-center justify-center gap-2">
                <Play size={18} />
                Commencer
              </span>
            </Link>
            <Link href="/quiz/quiz-4" className="focus-ring rounded-full border border-white/20 bg-white/[0.035] px-5 py-4 font-semibold text-gray-300 transition hover:border-white/45 hover:text-white">
              Simulation
            </Link>
          </div>
          <div className="mt-9 grid grid-cols-3 gap-3 sm:max-w-xl">
            {[
              ["11", "quiz"],
              ["311", "questions"],
              ["2", "sections"]
            ].map(([value, label]) => (
              <div key={label} className="nothing-panel rounded-[1.15rem] p-4">
                <div className="dot-title text-2xl text-white">{value}</div>
                <div className="mt-1 text-xs uppercase text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="nothing-panel relative min-h-[520px] animate-reveal rounded-[1.75rem] p-4 [animation-delay:120ms]">
          <ParticleField />
          <div className="relative grid h-full gap-4">
            <div className="glass animate-float rounded-[1.25rem] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Révision rapide</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Questions originales</h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black">
                  <BrainCircuit size={24} />
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-2 w-[72%] rounded-full bg-accent-gradient shadow-glow" />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                <span>ML + RN</span>
                <span className="font-mono text-red-300">PDF</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.25rem] border border-white/15 bg-white/[0.045] p-5">
                <BrainCircuit className="text-white" size={22} />
                <div className="mt-4 font-mono text-3xl">ML</div>
                <p className="text-sm text-gray-300">Machine Learning</p>
              </div>
              <div className="rounded-[1.25rem] border border-red-500/30 bg-red-500/[0.08] p-5">
                <Network className="text-red-300" size={22} />
                <div className="mt-4 font-mono text-3xl">RN</div>
                <p className="text-sm text-gray-300">Réseaux de neurones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SearchCommand />

      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase text-gray-500">Quiz originaux</p>
            <h2 className="dot-title text-3xl font-semibold">ML quiz et RN quiz</h2>
          </div>
        </div>
        <div className="space-y-8">
          {(["ML random", "RN random", "ML quiz", "RN quiz"] as const).map((section) => (
            <div key={section}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="dot-title text-2xl font-semibold">
                  {section === "ML random" ? "Tous les quiz ML (aléatoire)" : section === "RN random" ? "Tous les quiz RN (aléatoire)" : section}
                </h3>
                <span className="font-mono text-sm text-gray-500">
                  {quizSets.filter((quiz) => quiz.section === section).reduce((total, quiz) => total + quiz.questions, 0)} questions
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quizSets.filter((quiz) => quiz.section === section).map((quiz) => {
                  const Icon = quizIcons[quiz.icon];
                  return (
                    <Link key={quiz.slug} href={`/quiz/${quiz.slug}`} className="nothing-panel group rounded-[1.25rem] p-5 transition hover:-translate-y-1 hover:border-red-500/45">
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black">
                          <Icon size={22} />
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-gray-300">{quiz.questions} Q</span>
                      </div>
                      <h4 className="mt-5 font-display text-xl font-semibold">{quiz.title}</h4>
                      <p className="mt-2 text-sm text-gray-400">{quiz.questions} questions · {quiz.duration} min · {quiz.topic}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {quiz.weakSignals.map((signal) => (
                          <span key={signal} className="rounded-full bg-white/[0.07] px-2.5 py-1 text-xs text-gray-300">{signal}</span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </section>
    </>
  );
}
