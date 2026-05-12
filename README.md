# Bn10 Quiz

Bn10 Quiz is a Next.js quiz platform for revising Machine Learning and Neural Networks topics. It turns extracted PDF/QCM material into interactive quizzes with timed sessions, progress tracking, final scoring, and full answer correction.

## Features

- Home dashboard with ML and RN quiz sections
- 11 quiz sets and 311 questions
- Combined random-style ML and RN review sets
- Quiz flow with previous/next navigation, timer, progress bar, score, and correction
- Search command for finding quizzes quickly
- Light/dark theme toggle saved in `localStorage`
- Zustand-powered quiz state
- PWA manifest and favicon
- Netlify deployment configuration

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

```bash
npm run dev
```

Starts the local Next.js development server.

```bash
npm run build
```

Builds the production app.

```bash
npm run start
```

Starts the production server after a build.

```bash
npm run lint
```

Runs ESLint on the app, components, library, store, scripts, and config files.

## Project Structure

```text
app/
  layout.tsx              Global metadata, manifest, theme bootstrapping
  page.tsx                Home route
  quiz/[slug]/page.tsx    Dynamic quiz route

components/
  AppShell.tsx            Shared app shell
  HomeExperience.tsx      Homepage quiz dashboard
  QuizExperience.tsx      Quiz player, timer, scoring, correction
  SearchCommand.tsx       Quiz search UI
  ThemeToggle.tsx         Light/dark theme switcher
  ParticleField.tsx       Decorative interactive background

lib/
  data.ts                 Quiz registry consumed by the UI
  quizBank.ts             Generated quiz questions
  types.ts                Shared quiz types

store/
  useQuizStore.ts         Zustand quiz state

scripts/
  build-quiz-bank.mjs     Builds lib/quizBank.ts from extracted text

extracted-text/
  *.txt                   Extracted source text from quiz PDFs

public/
  manifest.json           PWA metadata
  favicon.png             App icon
  sounds/                 Result feedback sounds
```

## Quiz Data Workflow

The UI reads quiz metadata from `lib/data.ts`. The actual question bank is generated in `lib/quizBank.ts` from the text files in `extracted-text/`.

To regenerate the quiz bank after editing extracted text or parser rules:

```bash
node scripts/build-quiz-bank.mjs
```

The script parses ML quiz files with marked answer symbols and RN quiz files with answer sections/manual answer keys. It writes a TypeScript module that satisfies the shared `QuizSection` type.

## Deployment

The project includes `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

On Netlify, make sure dependencies are installed from `package-lock.json` and that the Next.js plugin is available.

## Notes

- The app language is French.
- Source PDF paths in `scripts/build-quiz-bank.mjs` point to the original local files used during extraction; the app itself runs from the generated `lib/quizBank.ts`.
- Quiz progress is held in client state and resets when switching quizzes or clicking restart.
