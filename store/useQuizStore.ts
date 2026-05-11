"use client";

import { create } from "zustand";

type Answer = {
  questionId: string;
  selected: number;
  correct: boolean;
};

type QuizState = {
  mode: "quiz" | "revision" | "challenge";
  currentIndex: number;
  answers: Answer[];
  setMode: (mode: QuizState["mode"]) => void;
  selectAnswer: (answer: Answer) => void;
  next: () => void;
  previous: () => void;
  reset: () => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  mode: "quiz",
  currentIndex: 0,
  answers: [],
  setMode: (mode) => set({ mode }),
  selectAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers.filter((item) => item.questionId !== answer.questionId), answer]
    })),
  next: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
  previous: () => set((state) => ({ currentIndex: Math.max(0, state.currentIndex - 1) })),
  reset: () => set({ currentIndex: 0, answers: [] })
}));
