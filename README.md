# BN10

BN10 is a futuristic study platform for Machine Learning and Neural Networks revision. It combines PDF-based quiz practice with a hidden cinematic runner game called **Royal Fall**.

The interface uses a black/red visual identity, grid backgrounds, glass panels, glowing accents, rounded borders, and a mobile-first layout.

## Features

- Home dashboard for Machine Learning and Réseaux de Neurones quiz sections
- 11 quiz sets with 311 questions
- Random ML and RN review routes
- Timed quiz experience with progress tracking
- Previous/next navigation, final score, and full correction
- Search command for quickly finding quiz sets
- Light/dark theme toggle saved in `localStorage`
- Mobile bottom navigation with quiz and game access
- Result feedback sounds
- PWA manifest and favicon
- Netlify deployment configuration

## Royal Fall

**Royal Fall** is a minimal cinematic endless runner built into the BN10 universe.

Game concept:

- Title: `ROYAL FALL`
- Tagline: `The kingdom collapses behind him.`
- Character: King BN10
- Style: dark kingdom, red glow, futuristic grid, minimal silhouette
- Gameplay: jump, double jump, dash, collect relics, avoid obstacles
- Controls:
  - Desktop: `Space` to jump, `Shift` to dash
  - Mobile: left side tap to jump, right side tap to dash

Royal Fall includes:

- Full-screen responsive game view for laptop and phone
- Canvas-based gameplay
- Framer Motion menu and modal transitions
- Pause menu
- Game over modal
- Best score saved locally
- Relics, power-ups, obstacles, red fog particles, parallax grid, and screen shake
- Minimal procedural audio using the Web Audio API

Route:

```text
/royal-fall
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Lucide React
- Canvas API

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal. Usually:

```text
http://localhost:3000
```

If port `3000` is already used, Next.js will automatically choose another port such as `3002` or `3003`.

## Scripts

Start the development server:

```bash
npm run dev
```

Build the production app:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

Run ESLint:

```bash
npm run lint
```

## Project Structure

```text
app/
  layout.tsx              Global layout, metadata, theme bootstrapping
  page.tsx                Home route
  globals.css             Global Tailwind and BN10 theme styles
  quiz/[slug]/page.tsx    Dynamic quiz routes
  royal-fall/page.tsx     Royal Fall game route

components/
  AppShell.tsx            Shared shell, desktop nav, mobile nav
  HomeExperience.tsx      Homepage dashboard
  QuizExperience.tsx      Quiz player, timer, scoring, correction
  RoyalFallGame.tsx       Full-screen Royal Fall canvas game
  SearchCommand.tsx       Quiz search UI
  ThemeToggle.tsx         Light/dark theme switcher
  ParticleField.tsx       Decorative animated background

lib/
  data.ts                 Quiz metadata and route registry
  quizBank.ts             Generated question bank
  types.ts                Shared quiz types

store/
  useQuizStore.ts         Zustand quiz state

scripts/
  build-quiz-bank.mjs     Generates quizBank.ts from extracted text

extracted-text/
  *.txt                   Extracted source text from quiz PDFs

public/
  manifest.json           PWA metadata
  favicon.png             App icon
  sounds/                 Quiz result sounds
```

## Quiz Data Workflow

Quiz metadata lives in:

```text
lib/data.ts
```

The question bank lives in:

```text
lib/quizBank.ts
```

To regenerate the question bank after changing extracted text or parser rules:

```bash
node scripts/build-quiz-bank.mjs
```

## Deployment On Netlify

The project includes `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Netlify settings:

- Build command: `npm run build`
- Publish directory: `.next`
- Framework: Next.js
- Install command: `npm install`

Make sure these files are pushed to GitHub before deploying:

- `app/royal-fall/page.tsx`
- `components/RoyalFallGame.tsx`
- `components/AppShell.tsx`
- `app/globals.css`
- `package.json`
- `package-lock.json`
- `netlify.toml`

## GitHub Upload

If this folder is not already connected to GitHub:

```bash
git init
git remote add origin https://github.com/Ben10-L/bn10-.git
git add .
git commit -m "Update BN10 with Royal Fall"
git branch -M main
git push -u origin main
```

If the GitHub repository already has commits:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Notes

- The app content is mainly French.
- Royal Fall is designed to stay dark even when the global site theme is set to light mode.
- Quiz progress is stored in client state and resets when switching quiz routes or restarting.
- Royal Fall best score is stored in `localStorage`.
- Do not run `npm run build` while a Next.js dev server is running in the same folder, because both can write to `.next`.
