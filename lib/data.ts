import { quizSections as extractedQuizSections } from "./quizBank";
import type { QuizBankItem, QuizQuestion, QuizSection, QuizSectionLabel } from "./types";

export { extractedQuizSections as quizSections };

export type QuizSet = {
  slug: string;
  title: string;
  source: string;
  section: QuizSectionLabel;
  topic: string;
  questions: number;
  bankQuestions: QuizQuestion[];
  duration: number;
  accuracy: number;
  weakSignals: string[];
  accent: string;
  icon: "brain" | "chart" | "database" | "timer" | "branch" | "target" | "network" | "layers" | "code";
};

const typedSections = extractedQuizSections as readonly QuizSection[];
const quizBank: QuizBankItem[] = typedSections.flatMap((section) => section.quizzes);
const randomizeQuestions = (items: QuizQuestion[]) =>
  [...items]
    .map((question, index) => ({ question, score: (question.prompt.length * 31 + question.number * 17 + index * 13) % 997 }))
    .sort((a, b) => a.score - b.score)
    .map((item, index) => ({ ...item.question, number: index + 1 }));
const mlRandomQuestions = randomizeQuestions(quizBank.filter((quiz) => quiz.section === "ML quiz").flatMap((quiz) => quiz.questions));
const rnRandomQuestions = randomizeQuestions(quizBank.filter((quiz) => quiz.section === "RN quiz").flatMap((quiz) => quiz.questions));

function sourceQuiz(slug: string) {
  const quiz = quizBank.find((item) => item.slug === slug);

  if (!quiz) {
    throw new Error(`Missing extracted quiz bank for ${slug}`);
  }

  return quiz;
}

export const quizSets: QuizSet[] = [
  {
    slug: "ml-random",
    title: "All quiz ML (random)",
    source: "ML quiz collection",
    section: "ML random",
    topic: "Machine Learning",
    questions: mlRandomQuestions.length,
    bankQuestions: mlRandomQuestions,
    duration: 45,
    accuracy: 0,
    weakSignals: ["Quiz 1", "Quiz 2", "Non supervisé"],
    accent: "from-signal-cyan to-signal-purple",
    icon: "branch"
  },
  {
    slug: "rn-random",
    title: "All quiz RN (random)",
    source: "RN quiz collection",
    section: "RN random",
    topic: "Réseaux de Neurones",
    questions: rnRandomQuestions.length,
    bankQuestions: rnRandomQuestions,
    duration: 45,
    accuracy: 0,
    weakSignals: ["Perceptron", "MLP", "Keras"],
    accent: "from-signal-coral to-signal-purple",
    icon: "network"
  },
  {
    slug: "quiz-1",
    title: sourceQuiz("quiz-1").title,
    source: sourceQuiz("quiz-1").source,
    section: "ML quiz",
    topic: sourceQuiz("quiz-1").topic,
    questions: sourceQuiz("quiz-1").questions.length,
    bankQuestions: sourceQuiz("quiz-1").questions,
    duration: 18,
    accuracy: 86,
    weakSignals: ["bias variance", "feature scaling", "train/test split"],
    accent: "from-signal-purple to-signal-blue",
    icon: "brain"
  },
  {
    slug: "quiz-2",
    title: sourceQuiz("quiz-2").title,
    source: sourceQuiz("quiz-2").source,
    section: "ML quiz",
    topic: sourceQuiz("quiz-2").topic,
    questions: sourceQuiz("quiz-2").questions.length,
    bankQuestions: sourceQuiz("quiz-2").questions,
    duration: 22,
    accuracy: 79,
    weakSignals: ["F1 score", "confusion matrix", "ROC"],
    accent: "from-signal-blue to-signal-cyan",
    icon: "chart"
  },
  {
    slug: "quiz-3",
    title: sourceQuiz("quiz-3").title,
    source: sourceQuiz("quiz-3").source,
    section: "ML quiz",
    topic: sourceQuiz("quiz-3").topic,
    questions: sourceQuiz("quiz-3").questions.length,
    bankQuestions: sourceQuiz("quiz-3").questions,
    duration: 16,
    accuracy: 82,
    weakSignals: ["normalization", "SMOTE", "missing values"],
    accent: "from-signal-mint to-signal-cyan",
    icon: "database"
  },
  {
    slug: "quiz-4",
    title: sourceQuiz("quiz-4").title,
    source: sourceQuiz("quiz-4").source,
    section: "ML quiz",
    topic: sourceQuiz("quiz-4").topic,
    questions: sourceQuiz("quiz-4").questions.length,
    bankQuestions: sourceQuiz("quiz-4").questions,
    duration: 30,
    accuracy: 74,
    weakSignals: ["model selection", "regularization", "validation"],
    accent: "from-signal-amber to-signal-coral",
    icon: "timer"
  },
  {
    slug: "qcm-unsupervised",
    title: sourceQuiz("qcm-unsupervised").title,
    source: sourceQuiz("qcm-unsupervised").source,
    section: "ML quiz",
    topic: sourceQuiz("qcm-unsupervised").topic,
    questions: sourceQuiz("qcm-unsupervised").questions.length,
    bankQuestions: sourceQuiz("qcm-unsupervised").questions,
    duration: 24,
    accuracy: 68,
    weakSignals: ["PCA", "K-Means", "DBSCAN"],
    accent: "from-signal-purple to-signal-cyan",
    icon: "branch"
  },
  {
    slug: "revision-ml",
    title: sourceQuiz("revision-ml").title,
    source: sourceQuiz("revision-ml").source,
    section: "ML quiz",
    topic: sourceQuiz("revision-ml").topic,
    questions: sourceQuiz("revision-ml").questions.length,
    bankQuestions: sourceQuiz("revision-ml").questions,
    duration: 60,
    accuracy: 0,
    weakSignals: ["Prétraitement", "Supervisé", "Non supervisé"],
    accent: "from-signal-cyan to-signal-coral",
    icon: "database"
  },
  {
    slug: "perceptron",
    title: sourceQuiz("perceptron").title,
    source: sourceQuiz("perceptron").source,
    section: "RN quiz",
    topic: sourceQuiz("perceptron").topic,
    questions: sourceQuiz("perceptron").questions.length,
    bankQuestions: sourceQuiz("perceptron").questions,
    duration: 14,
    accuracy: 83,
    weakSignals: ["linear separability", "activation", "weights"],
    accent: "from-signal-coral to-signal-purple",
    icon: "target"
  },
  {
    slug: "neural-networks",
    title: sourceQuiz("neural-networks").title,
    source: sourceQuiz("neural-networks").source,
    section: "RN quiz",
    topic: sourceQuiz("neural-networks").topic,
    questions: sourceQuiz("neural-networks").questions.length,
    bankQuestions: sourceQuiz("neural-networks").questions,
    duration: 25,
    accuracy: 77,
    weakSignals: ["backpropagation", "loss function", "epochs"],
    accent: "from-signal-blue to-signal-mint",
    icon: "network"
  },
  {
    slug: "mlp",
    title: sourceQuiz("mlp").title,
    source: sourceQuiz("mlp").source,
    section: "RN quiz",
    topic: sourceQuiz("mlp").topic,
    questions: sourceQuiz("mlp").questions.length,
    bankQuestions: sourceQuiz("mlp").questions,
    duration: 22,
    accuracy: 71,
    weakSignals: ["hidden layers", "ReLU", "gradient descent"],
    accent: "from-signal-purple to-signal-mint",
    icon: "layers"
  },
  {
    slug: "keras",
    title: sourceQuiz("keras").title,
    source: sourceQuiz("keras").source,
    section: "RN quiz",
    topic: sourceQuiz("keras").topic,
    questions: sourceQuiz("keras").questions.length,
    bankQuestions: sourceQuiz("keras").questions,
    duration: 15,
    accuracy: 88,
    weakSignals: ["Sequential API", "compile", "callbacks"],
    accent: "from-signal-cyan to-signal-blue",
    icon: "code"
  },
  {
    slug: "historique-rn",
    title: sourceQuiz("historique-rn").title,
    source: sourceQuiz("historique-rn").source,
    section: "RN quiz",
    topic: sourceQuiz("historique-rn").topic,
    questions: sourceQuiz("historique-rn").questions.length,
    bankQuestions: sourceQuiz("historique-rn").questions,
    duration: 14,
    accuracy: 80,
    weakSignals: ["Rosenblatt", "Hopfield", "Deep Learning"],
    accent: "from-signal-amber to-signal-blue",
    icon: "brain"
  },
  {
    slug: "revision-finale",
    title: sourceQuiz("revision-finale").title,
    source: sourceQuiz("revision-finale").source,
    section: "RN quiz",
    topic: sourceQuiz("revision-finale").topic,
    questions: sourceQuiz("revision-finale").questions.length,
    bankQuestions: sourceQuiz("revision-finale").questions,
    duration: 80,
    accuracy: 0,
    weakSignals: ["Revision finale", "Deep Learning", "RN"],
    accent: "from-signal-coral to-signal-cyan",
    icon: "network"
  }
];
