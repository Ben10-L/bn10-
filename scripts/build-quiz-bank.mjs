import { readFileSync, writeFileSync } from "node:fs";

const sources = [
  {
    slug: "quiz-1",
    section: "ML quiz",
    title: "QUIZ 1",
    topic: "Machine Learning",
    source: "/Users/macbook/Desktop/master/S1/S1/Machine learning‬‏/QUIZ/QUIZ 1.pdf",
    text: "extracted-text/ml-quiz-1.txt",
    parser: "marked"
  },
  {
    slug: "quiz-2",
    section: "ML quiz",
    title: "QUIZ 2",
    topic: "Prétraitement des données",
    source: "/Users/macbook/Desktop/master/S1/S1/Machine learning‬‏/QUIZ/QUIZ 2.pdf",
    text: "extracted-text/ml-quiz-2.txt",
    parser: "marked"
  },
  {
    slug: "quiz-3",
    section: "ML quiz",
    title: "QUIZ 3",
    topic: "Évaluation des modèles",
    source: "/Users/macbook/Desktop/master/S1/S1/Machine learning‬‏/QUIZ/QUIZ 3.pdf",
    text: "extracted-text/ml-quiz-3.txt",
    parser: "marked"
  },
  {
    slug: "quiz-4",
    section: "ML quiz",
    title: "QUIZ 4",
    topic: "Machine Learning",
    source: "/Users/macbook/Desktop/master/S1/S1/Machine learning‬‏/QUIZ/QUIZ 4.pdf",
    text: "extracted-text/ml-quiz-4.txt",
    parser: "marked"
  },
  {
    slug: "qcm-unsupervised",
    section: "ML quiz",
    title: "QUIZ - Apprentissage Non Supervisé",
    topic: "Apprentissage Non Supervisé",
    source: "/Users/macbook/Desktop/master/S1/S1/Machine learning‬‏/QUIZ/QCM_Apprentissage_Non_Supervise.pdf",
    text: "extracted-text/ml-qcm-unsupervised.txt",
    parser: "marked"
  },
  {
    slug: "perceptron",
    section: "RN quiz",
    title: "QCM: Le Perceptron",
    topic: "Perceptron",
    source: "/Users/macbook/Desktop/master/S1/S1/Reseaux de Reuronnes/quiz/perceptron.pdf",
    text: "extracted-text/rn-perceptron.txt",
    parser: "answers"
  },
  {
    slug: "neural-networks",
    section: "RN quiz",
    title: "QCM Réseaux de Neurones",
    topic: "Réseaux de Neurones",
    source: "/Users/macbook/Desktop/master/S1/S1/Reseaux de Reuronnes/quiz/Qcm Reseaux Neurones.pdf",
    text: "extracted-text/rn-qcm-reseaux-neurones.txt",
    parser: "answers"
  },
  {
    slug: "mlp",
    section: "RN quiz",
    title: "QCM: MLP",
    topic: "MLP",
    source: "/Users/macbook/Desktop/master/S1/S1/Reseaux de Reuronnes/quiz/MLP.pdf",
    text: "extracted-text/rn-mlp.txt",
    parser: "answers"
  },
  {
    slug: "keras",
    section: "RN quiz",
    title: "QCM: Keras",
    topic: "Keras",
    source: "/Users/macbook/Desktop/master/S1/S1/Reseaux de Reuronnes/quiz/keras.pdf",
    text: "extracted-text/rn-keras.txt",
    parser: "answers"
  },
  {
    slug: "historique-rn",
    section: "RN quiz",
    title: "Historique de réseaux de neurones",
    topic: "Réseaux de Neurones",
    source: "/Users/macbook/Desktop/master/S1/S1/Reseaux de Reuronnes/quiz/Hestorique de réseux de neuron.pdf",
    text: "extracted-text/rn-historique.txt",
    parser: "answers"
  }
];

const manualAnswerKeys = {
  perceptron: [1, 1, 0, 1, 2, 2, 0, 3, 2, 0, 1, 2, 0, 0, 1, 1, 0, 1, 0],
  "neural-networks": [0, 1, 2, 3, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0],
  mlp: [1, 0, 1, 1, 1, 3, 2, 1, 1, 2, 1, 1, 0, 0, 1, 0],
  keras: [0, 1, 2, 0, 0, 2, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 2],
  "historique-rn": [1, 0, 1, 1, 2, 1, 1, 0, 3, 2, 0, 0, 0, 0, 0, 0, 0]
};

const clean = (value) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([?.!,;:])/g, "$1")
    .replace(/昀椀/g, "fi")
    .replace(/昀昀/g, "ff")
    .replace(/昀케/g, "ffi")
    .trim();

const skipLine = (line) =>
  !line ||
  /^\d+$/.test(line) ||
  /^Questions$/i.test(line) ||
  /^R[´é]ponses$/i.test(line) ||
  /^QUIZ\s*\d*$/i.test(line) ||
  /^QCM[:\s]/i.test(line) ||
  /^Partie\s+\d+/i.test(line);

function pushQuestion(list, current) {
  if (!current) return;
  const prompt = clean(current.prompt);
  const choices = current.choices.map(clean).filter(Boolean);
  if (!prompt || choices.length < 2) return;
  list.push({
    number: current.number || list.length + 1,
    prompt,
    choices,
    answer: Number.isInteger(current.answer) ? current.answer : 0,
    explanation: `Réponse correcte: ${choices[Number.isInteger(current.answer) ? current.answer : 0] || choices[0]}`
  });
}

function parseMarked(text) {
  const questions = [];
  let current = null;
  const lines = text.split(/\r?\n/).map((line) => line.trim());

  for (const raw of lines) {
    const line = raw.replace(/\u000c/g, "").trim();
    if (skipLine(line)) continue;

    const numbered = line.match(/^(\d+)\.\s*(.+)$/);
    const choice = line.match(/^([67])\s+(.+)$/);

    if (numbered && !choice) {
      pushQuestion(questions, current);
      current = { number: Number(numbered[1]), prompt: numbered[2], choices: [], answer: 0 };
      continue;
    }

    if (choice) {
      if (!current) current = { number: questions.length + 1, prompt: "", choices: [], answer: 0 };
      const marker = choice[1];
      current.choices.push(choice[2]);
      if (marker === "" || marker === "7") current.answer = current.choices.length - 1;
      continue;
    }

    if (!current) {
      current = { number: questions.length + 1, prompt: line, choices: [], answer: 0 };
      continue;
    }

    if (current.choices.length >= 2 && /[?؟:]$/.test(line)) {
      pushQuestion(questions, current);
      current = { number: questions.length + 1, prompt: line, choices: [], answer: 0 };
    } else if (current.choices.length > 0) {
      current.choices[current.choices.length - 1] += ` ${line}`;
    } else {
      current.prompt += ` ${line}`;
    }
  }

  pushQuestion(questions, current);
  return questions;
}

function parseAnswers(text) {
  const splitMatch = text.match(/\n\s*R[^\s]{0,4}ponses\s*\n/i);
  const questionText = splitMatch ? text.slice(0, splitMatch.index) : text;
  const answerText = splitMatch ? text.slice((splitMatch.index || 0) + splitMatch[0].length) : "";
  const answerMap = new Map();

  for (const line of answerText.split(/\r?\n/)) {
    const match = clean(line).match(/^(\d+)\.\s*([a-d])\)/i);
    if (match) answerMap.set(Number(match[1]), match[2].toLowerCase().charCodeAt(0) - 97);
  }

  const questions = [];
  let current = null;

  for (const raw of questionText.split(/\r?\n/)) {
    const line = raw.replace(/\u000c/g, "").trim();
    if (skipLine(line)) continue;

    const question = clean(line).match(/^(\d+)\.\s*(.+)$/);
    const choice = clean(line).match(/^(?:o|•)?\s*([a-d])\)\s*(.+)$/i);

    if (question) {
      pushQuestion(questions, current);
      current = {
        number: Number(question[1]),
        prompt: question[2].replace(/^[a-d]\)\s*/i, ""),
        choices: [],
        answer: answerMap.get(Number(question[1])) ?? 0
      };
      continue;
    }

    if (choice) {
      if (!current) continue;
      current.choices.push(choice[2]);
      continue;
    }

    if (!current) continue;
    if (current.choices.length >= 4 && /[?؟:]$/.test(line)) {
      pushQuestion(questions, current);
      const nextNumber = questions[questions.length - 1]?.number + 1 || questions.length + 1;
      current = { number: nextNumber, prompt: line, choices: [], answer: answerMap.get(nextNumber) ?? 0 };
    } else if (current.choices.length > 0) {
      current.choices[current.choices.length - 1] += ` ${line}`;
    } else {
      current.prompt += ` ${line}`;
    }
  }

  pushQuestion(questions, current);
  return questions;
}

const quizSections = ["ML quiz", "RN quiz"].map((label) => ({
  label,
  quizzes: sources
    .filter((source) => source.section === label)
    .map((source) => {
      const text = readFileSync(source.text, "utf8");
      const questions = source.parser === "answers" ? parseAnswers(text) : parseMarked(text);
      const manualAnswers = manualAnswerKeys[source.slug];
      const normalizedQuestions = manualAnswers
        ? questions.map((question, index) => ({
            ...question,
            answer: manualAnswers[index] ?? question.answer,
            explanation: `Réponse correcte: ${question.choices[manualAnswers[index] ?? question.answer] || question.choices[question.answer] || ""}`
          }))
        : questions;
      return {
        slug: source.slug,
        title: source.title,
        section: source.section,
        topic: source.topic,
        source: source.source,
        questions: normalizedQuestions
      };
    })
}));

const output = `import type { QuizSection } from "./types";

export const quizSections = ${JSON.stringify(quizSections, null, 2)} satisfies QuizSection[];
`;

writeFileSync("lib/quizBank.ts", output);

for (const section of quizSections) {
  for (const quiz of section.quizzes) {
    console.log(`${section.label} / ${quiz.title}: ${quiz.questions.length} questions`);
  }
}
