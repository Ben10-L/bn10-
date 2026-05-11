export type QuizSectionLabel = "ML quiz" | "RN quiz" | "ML random" | "RN random";

export type QuizQuestion = {
  number: number;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type QuizBankItem = {
  slug: string;
  title: string;
  section: QuizSectionLabel;
  topic: string;
  source: string;
  questions: QuizQuestion[];
};

export type QuizSection = {
  label: QuizSectionLabel;
  quizzes: QuizBankItem[];
};
