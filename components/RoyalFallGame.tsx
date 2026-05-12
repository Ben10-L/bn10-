"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Crown, Gauge, Home, Pause, Play, RotateCcw, Shield, Sparkles, Trophy, Volume2, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GamePhase = "menu" | "playing" | "paused" | "over";
type ObstacleKind = "spike" | "enemy" | "laser" | "wall";
type PowerKind = "slow" | "shield" | "dash";

type Runner = {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  jumps: number;
  dashTime: number;
  shieldTime: number;
  slowTime: number;
  shadowDashTime: number;
  grounded: boolean;
};

type Platform = { x: number; y: number; width: number; height: number };
type Obstacle = { x: number; y: number; width: number; height: number; kind: ObstacleKind };
type Relic = { x: number; y: number; radius: number; pulse: number };
type PowerUp = { x: number; y: number; radius: number; kind: PowerKind };
type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number };
type GameWorld = {
  runner: Runner;
  platforms: Platform[];
  obstacles: Obstacle[];
  relics: Relic[];
  powers: PowerUp[];
  particles: Particle[];
  score: number;
  relicsCollected: number;
  speed: number;
  distanceUntilPlatform: number;
  distanceUntilObstacle: number;
  distanceUntilRelic: number;
  distanceUntilPower: number;
  shake: number;
  startedAt: number;
};


const initialRunner = (): Runner => ({
  x: 92,
  y: 330,
  width: 34,
  height: 70,
  velocityY: 0,
  jumps: 0,
  dashTime: 0,
  shieldTime: 0,
  slowTime: 0,
  shadowDashTime: 0,
  grounded: false
});

const createWorld = (): GameWorld => ({
  runner: initialRunner(),
  platforms: [
    { x: 0, y: 420, width: 360, height: 20 },
    { x: 430, y: 372, width: 180, height: 18 },
    { x: 690, y: 430, width: 260, height: 18 }
  ],
  obstacles: [
    { x: 530, y: 334, width: 42, height: 38, kind: "spike" },
    { x: 840, y: 378, width: 30, height: 52, kind: "enemy" }
  ],
  relics: [
    { x: 350, y: 310, radius: 10, pulse: 0 },
    { x: 760, y: 320, radius: 10, pulse: 1.8 }
  ],
  powers: [{ x: 1080, y: 305, radius: 12, kind: "shield" }],
  particles: Array.from({ length: 46 }, () => ({
    x: Math.random() * 1200,
    y: Math.random() * 520,
    vx: -0.3 - Math.random() * 0.8,
    vy: -0.1 + Math.random() * 0.2,
    size: 1 + Math.random() * 2.5,
    alpha: 0.18 + Math.random() * 0.45
  })),
  score: 0,
  relicsCollected: 0,
  speed: 3.8,
  distanceUntilPlatform: 260,
  distanceUntilObstacle: 440,
  distanceUntilRelic: 240,
  distanceUntilPower: 780,
  shake: 0,
  startedAt: performance.now()
});

export function RoyalFallGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<GameWorld>(createWorld());
  const phaseRef = useRef<GamePhase>("menu");
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const lastFrameRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [score, setScore] = useState(0);
  const [relics, setRelics] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem("royal-fall-best");
    setBestScore(stored ? Number(stored) : 0);
  }, []);

  const playTone = useCallback((type: "start" | "jump" | "dash" | "relic" | "impact") => {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return;
    }

    const context = audioRef.current ?? new AudioCtor();
    audioRef.current = context;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const now = context.currentTime;
    const config = {
      start: [96, 132, 0.12],
      jump: [180, 260, 0.08],
      dash: [70, 42, 0.1],
      relic: [420, 720, 0.09],
      impact: [52, 26, 0.18]
    }[type];

    oscillator.type = type === "relic" ? "triangle" : "sawtooth";
    oscillator.frequency.setValueAtTime(config[0], now);
    oscillator.frequency.exponentialRampToValueAtTime(config[1], now + config[2]);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "impact" ? 420 : 1200, now);
    gain.gain.setValueAtTime(type === "start" ? 0.035 : 0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + config[2]);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + config[2]);
  }, []);

  const changePhase = useCallback((nextPhase: GamePhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const startRun = useCallback(() => {
    worldRef.current = createWorld();
    setScore(0);
    setRelics(0);
    playTone("start");
    changePhase("playing");
  }, [changePhase, playTone]);

  const endRun = useCallback(() => {
    const finalScore = Math.floor(worldRef.current.score);
    const nextBest = Math.max(bestScore, finalScore);
    setScore(finalScore);
    setBestScore(nextBest);
    window.localStorage.setItem("royal-fall-best", String(nextBest));
    playTone("impact");
    changePhase("over");
  }, [bestScore, changePhase, playTone]);

  const jump = useCallback(() => {
    if (phaseRef.current !== "playing") {
      return;
    }

    const runner = worldRef.current.runner;
    const wallSliding = runner.x < 42 && runner.velocityY > 0;
    if (runner.grounded || runner.jumps < 2 || wallSliding) {
      runner.velocityY = wallSliding ? -14 : -13.2;
      runner.jumps += 1;
      runner.grounded = false;
      playTone("jump");
    }
  }, [playTone]);

  const dash = useCallback(() => {
    if (phaseRef.current !== "playing") {
      return;
    }

    const runner = worldRef.current.runner;
    runner.dashTime = 220;
    runner.shadowDashTime = Math.max(runner.shadowDashTime, 420);
    playTone("dash");
  }, [playTone]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        event.preventDefault();
        if (phaseRef.current === "menu" || phaseRef.current === "over") {
          startRun();
        } else {
          jump();
        }
      }

      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        event.preventDefault();
        dash();
      }

      if (event.code === "Escape" && phaseRef.current === "playing") {
        changePhase("paused");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changePhase, dash, jump, startRun]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = (timestamp: number) => {
      const dt = Math.min(timestamp - (lastFrameRef.current || timestamp), 32);
      lastFrameRef.current = timestamp;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (phaseRef.current === "playing") {
        updateWorld(worldRef.current, dt, width, height, playTone, endRun);
        if (timestamp - lastUiUpdateRef.current > 160) {
          lastUiUpdateRef.current = timestamp;
          setScore(Math.floor(worldRef.current.score));
          setRelics(worldRef.current.relicsCollected);
        }
      }

      drawWorld(context, worldRef.current, width, height, phaseRef.current);
      animationRef.current = window.requestAnimationFrame(loop);
    };

    animationRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [endRun, playTone]);

  const statusCards = useMemo(
    () => [
      { label: "Daily challenge", value: "Gate VII", icon: Gauge },
      { label: "Relics target", value: "25 orbs", icon: Sparkles },
      { label: "Local best", value: bestScore.toLocaleString(), icon: Trophy }
    ],
    [bestScore]
  );

  return (
    <section className="royal-fall-theme min-h-[calc(100vh-4rem)] pb-24 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_19rem] lg:px-8">
        <div className="nothing-panel relative overflow-hidden rounded-[1.35rem] p-3 sm:p-4">
          <div ref={wrapperRef} className="relative h-[68vh] min-h-[520px] overflow-hidden rounded-[1rem] border border-white/15 bg-black shadow-2xl">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-5">
              <div>
                <p className="dot-title text-xs text-red-300">Royal Fall</p>
                <h1 className="dot-title text-xl font-semibold text-white sm:text-3xl">KING BN10</h1>
              </div>
              <div className="pointer-events-auto flex items-center gap-2">
                <Stat label="Score" value={score.toLocaleString()} />
                <Stat label="Relics" value={String(relics)} />
                <button
                  onClick={() => changePhase(phaseRef.current === "paused" ? "playing" : "paused")}
                  className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/55 text-gray-200 backdrop-blur-xl transition hover:border-red-500/50 hover:text-white"
                  aria-label={phase === "paused" ? "Reprendre" : "Pause"}
                  title={phase === "paused" ? "Reprendre" : "Pause"}
                >
                  {phase === "paused" ? <Play size={17} /> : <Pause size={17} />}
                </button>
              </div>
            </div>

            

            <div className="absolute inset-0 z-20 grid grid-cols-2 md:hidden">
              <button onPointerDown={jump} className="focus-ring" aria-label="Jump" />
              <button onPointerDown={dash} className="focus-ring" aria-label="Dash" />
            </div>

            <AnimatePresence>
              {phase === "menu" ? (
                <GameOverlay key="menu">
                  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="max-w-2xl text-center">
                    <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-red-400/45 bg-red-500/10 shadow-glow">
                      <Crown className="text-red-200" size={30} />
                    </div>
                    <p className="dot-title text-sm text-red-300">The kingdom collapses behind him.</p>
                    <h2 className="dot-title mt-3 text-5xl font-semibold leading-none text-white sm:text-7xl">Royal Fall</h2>
                    <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
                      A minimal cinematic endless runner hidden inside BN10. Run, jump, dash, and keep King BN10 ahead of the collapsing castle.
                    </p>
                    <button onClick={startRun} className="neon-border focus-ring mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-6 font-semibold text-white transition hover:scale-[1.02]">
                      <Play size={17} />
                      Begin descent
                    </button>
                  </motion.div>
                </GameOverlay>
              ) : null}

              {phase === "paused" ? (
                <GameOverlay key="paused">
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="nothing-panel max-w-md rounded-[1.25rem] p-6 text-center">
                    <p className="dot-title text-sm text-red-300">Castle paused</p>
                    <h2 className="dot-title mt-3 text-3xl font-semibold text-white">Hold the throne road</h2>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <button onClick={() => changePhase("playing")} className="neon-border focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-5 font-semibold text-white">
                        <Play size={17} />
                        Resume
                      </button>
                      <button onClick={startRun} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-gray-200 transition hover:border-red-500/45 hover:text-white">
                        <RotateCcw size={17} />
                        Restart
                      </button>
                    </div>
                  </motion.div>
                </GameOverlay>
              ) : null}

              {phase === "over" ? (
                <GameOverlay key="over">
                  <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="nothing-panel max-w-lg rounded-[1.25rem] p-6 text-center">
                    <p className="dot-title text-sm text-red-300">Royal line broken</p>
                    <h2 className="dot-title mt-3 text-5xl font-semibold text-white">{score.toLocaleString()}</h2>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Metric label="Final score" value={score.toLocaleString()} />
                      <Metric label="Best score" value={bestScore.toLocaleString()} />
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <button onClick={startRun} className="neon-border focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-black px-5 font-semibold text-white">
                        <RotateCcw size={17} />
                        Restart
                      </button>
                      <Link href="/" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-gray-200 transition hover:border-red-500/45 hover:text-white">
                        <Home size={17} />
                        Return home
                      </Link>
                    </div>
                  </motion.div>
                </GameOverlay>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

    
      </div>
    </section>
  );
}

function GameOverlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 grid place-items-center bg-black/72 p-5 backdrop-blur-md"
    >
      {children}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/15 bg-black/55 px-3 py-2 text-right backdrop-blur-xl">
      <p className="dot-title text-[10px] text-gray-500">{label}</p>
      <p className="font-mono text-sm text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/35 p-3">
      <p className="dot-title text-[10px] text-gray-500">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{value}</p>
    </div>
  );
}

function updateWorld(world: GameWorld, dt: number, width: number, height: number, playTone: (type: "start" | "jump" | "dash" | "relic" | "impact") => void, endRun: () => void) {
  const runner = world.runner;
  const seconds = dt / 1000;
  const speedBoost = runner.dashTime > 0 ? 1.9 : 1;
  const slowFactor = runner.slowTime > 0 ? 0.55 : 1;
  const scroll = world.speed * speedBoost * slowFactor * (dt / 16.67);

  world.score += scroll * 2.6;
  world.speed = Math.min(8.5, world.speed + seconds * 0.035);
  world.shake = Math.max(0, world.shake - dt);
  runner.dashTime = Math.max(0, runner.dashTime - dt);
  runner.shieldTime = Math.max(0, runner.shieldTime - dt);
  runner.slowTime = Math.max(0, runner.slowTime - dt);
  runner.shadowDashTime = Math.max(0, runner.shadowDashTime - dt);
  runner.velocityY += 0.74 * (dt / 16.67);
  runner.y += runner.velocityY * (dt / 16.67);
  runner.grounded = false;

  for (const list of [world.platforms, world.obstacles, world.relics, world.powers]) {
    for (const item of list) {
      item.x -= scroll;
    }
  }

  for (const platform of world.platforms) {
    const descending = runner.velocityY >= 0;
    const feet = runner.y + runner.height;
    const previousFeet = feet - runner.velocityY * (dt / 16.67);
    const horizontallyAligned = runner.x + runner.width > platform.x && runner.x < platform.x + platform.width;
    if (descending && horizontallyAligned && previousFeet <= platform.y && feet >= platform.y) {
      runner.y = platform.y - runner.height;
      runner.velocityY = 0;
      runner.grounded = true;
      runner.jumps = 0;
    }
  }

  if (runner.y > height + 90) {
    endRun();
    return;
  }

  world.distanceUntilPlatform -= scroll;
  world.distanceUntilObstacle -= scroll;
  world.distanceUntilRelic -= scroll;
  world.distanceUntilPower -= scroll;

  if (world.distanceUntilPlatform <= 0) {
    const lastX = Math.max(width, ...world.platforms.map((platform) => platform.x + platform.width));
    world.platforms.push({
      x: lastX + 74 + Math.random() * 90,
      y: height * (0.62 + Math.random() * 0.16),
      width: 150 + Math.random() * 170,
      height: 18
    });
    world.distanceUntilPlatform = 210 + Math.random() * 160;
  }

  if (world.distanceUntilObstacle <= 0) {
    const kinds: ObstacleKind[] = ["spike", "enemy", "laser", "wall"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    world.obstacles.push(makeObstacle(kind, width, height));
    world.distanceUntilObstacle = 300 + Math.random() * Math.max(170, 460 - world.speed * 20);
  }

  if (world.distanceUntilRelic <= 0) {
    world.relics.push({ x: width + 80, y: height * (0.38 + Math.random() * 0.24), radius: 9, pulse: Math.random() * 6 });
    world.distanceUntilRelic = 160 + Math.random() * 190;
  }

  if (world.distanceUntilPower <= 0) {
    const kinds: PowerKind[] = ["slow", "shield", "dash"];
    world.powers.push({ x: width + 120, y: height * (0.35 + Math.random() * 0.24), radius: 12, kind: kinds[Math.floor(Math.random() * kinds.length)] });
    world.distanceUntilPower = 820 + Math.random() * 840;
  }

  world.platforms = world.platforms.filter((item) => item.x + item.width > -80);
  world.obstacles = world.obstacles.filter((item) => item.x + item.width > -80);
  world.relics = world.relics.filter((item) => item.x > -50);
  world.powers = world.powers.filter((item) => item.x > -50);

  for (const relic of [...world.relics]) {
    relic.pulse += seconds * 5;
    if (circleHitsRunner(relic, runner)) {
      world.relics = world.relics.filter((item) => item !== relic);
      world.relicsCollected += 1;
      world.score += 180;
      playTone("relic");
    }
  }

  for (const power of [...world.powers]) {
    if (circleHitsRunner(power, runner)) {
      world.powers = world.powers.filter((item) => item !== power);
      if (power.kind === "shield") {
        runner.shieldTime = 5200;
      }
      if (power.kind === "slow") {
        runner.slowTime = 4200;
      }
      if (power.kind === "dash") {
        runner.shadowDashTime = 5000;
      }
      playTone("relic");
    }
  }

  for (const obstacle of world.obstacles) {
    if (rectsOverlap(runner, obstacle)) {
      if (runner.shieldTime > 0 || runner.shadowDashTime > 0 || runner.dashTime > 0) {
        world.obstacles = world.obstacles.filter((item) => item !== obstacle);
        runner.shieldTime = Math.max(0, runner.shieldTime - 900);
        world.shake = 160;
        world.score += 220;
        playTone("dash");
        break;
      }

      world.shake = 260;
      endRun();
      return;
    }
  }

  for (const particle of world.particles) {
    particle.x += particle.vx * (dt / 16.67) - scroll * 0.18;
    particle.y += particle.vy * (dt / 16.67);
    if (particle.x < -20) {
      particle.x = width + Math.random() * 180;
      particle.y = Math.random() * height;
    }
  }
}

function makeObstacle(kind: ObstacleKind, width: number, height: number): Obstacle {
  if (kind === "laser") {
    return { x: width + 90, y: height * 0.18, width: 22, height: height * 0.52, kind };
  }

  if (kind === "wall") {
    return { x: width + 80, y: height * 0.48, width: 34, height: height * 0.25, kind };
  }

  if (kind === "enemy") {
    return { x: width + 80, y: height * 0.6 - 54, width: 34, height: 54, kind };
  }

  return { x: width + 80, y: height * 0.66 - 36, width: 46, height: 36, kind };
}

function drawWorld(context: CanvasRenderingContext2D, world: GameWorld, width: number, height: number, phase: GamePhase) {
  const shakeX = world.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  const shakeY = world.shake > 0 ? (Math.random() - 0.5) * 5 : 0;
  context.save();
  context.translate(shakeX, shakeY);
  context.clearRect(-20, -20, width + 40, height + 40);

  const background = context.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#020202");
  background.addColorStop(0.48, "#090607");
  background.addColorStop(1, "#020202");
  context.fillStyle = background;
  context.fillRect(-20, -20, width + 40, height + 40);

  drawGrid(context, world, width, height);
  drawParallax(context, world, width, height);

  for (const particle of world.particles) {
    context.fillStyle = `rgba(255, 46, 46, ${particle.alpha})`;
    context.shadowColor = "rgba(255, 46, 46, 0.85)";
    context.shadowBlur = 12;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  }
  context.shadowBlur = 0;

  for (const platform of world.platforms) {
    drawPlatform(context, platform);
  }

  for (const relic of world.relics) {
    drawRelic(context, relic);
  }

  for (const power of world.powers) {
    drawPower(context, power);
  }

  for (const obstacle of world.obstacles) {
    drawObstacle(context, obstacle);
  }

  drawRunner(context, world.runner, phase);
  context.restore();
}

function drawGrid(context: CanvasRenderingContext2D, world: GameWorld, width: number, height: number) {
  const offset = -(world.score * 0.13) % 36;
  context.strokeStyle = "rgba(255,255,255,0.05)";
  context.lineWidth = 1;
  for (let x = offset; x < width; x += 36) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x - 90, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 34) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawParallax(context: CanvasRenderingContext2D, world: GameWorld, width: number, height: number) {
  context.strokeStyle = "rgba(255,46,46,0.22)";
  context.lineWidth = 1;
  for (let i = 0; i < 9; i += 1) {
    const x = (i * 170 - world.score * 0.08) % (width + 220);
    context.beginPath();
    context.moveTo(x, height * 0.16);
    context.lineTo(x, height * 0.72);
    context.stroke();
  }

  context.fillStyle = "rgba(255,46,46,0.08)";
  for (let i = 0; i < 6; i += 1) {
    const x = (i * 230 - world.score * 0.2) % (width + 260);
    context.fillRect(x, height * 0.22 + (i % 3) * 30, 18 + i * 5, 3);
  }
}

function drawPlatform(context: CanvasRenderingContext2D, platform: Platform) {
  const gradient = context.createLinearGradient(platform.x, platform.y, platform.x + platform.width, platform.y);
  gradient.addColorStop(0, "rgba(255,255,255,0.08)");
  gradient.addColorStop(0.5, "rgba(255,46,46,0.28)");
  gradient.addColorStop(1, "rgba(255,255,255,0.08)");
  context.fillStyle = "rgba(3,3,3,0.92)";
  context.fillRect(platform.x, platform.y, platform.width, platform.height);
  context.fillStyle = gradient;
  context.fillRect(platform.x, platform.y, platform.width, 2);
  context.strokeStyle = "rgba(255,255,255,0.16)";
  context.strokeRect(platform.x, platform.y, platform.width, platform.height);
}

function drawObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  context.save();
  context.shadowColor = "rgba(255, 46, 46, 0.75)";
  context.shadowBlur = obstacle.kind === "laser" ? 22 : 12;
  context.strokeStyle = "rgba(255,46,46,0.7)";
  context.fillStyle = obstacle.kind === "enemy" ? "rgba(0,0,0,0.86)" : "rgba(255,46,46,0.14)";

  if (obstacle.kind === "spike") {
    context.beginPath();
    context.moveTo(obstacle.x, obstacle.y + obstacle.height);
    context.lineTo(obstacle.x + obstacle.width * 0.5, obstacle.y);
    context.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
    context.closePath();
    context.fill();
    context.stroke();
  } else if (obstacle.kind === "enemy") {
    context.beginPath();
    context.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 12);
    context.fill();
    context.stroke();
    context.fillStyle = "rgba(255,255,255,0.88)";
    context.fillRect(obstacle.x + 9, obstacle.y + 17, 4, 2);
    context.fillRect(obstacle.x + 21, obstacle.y + 17, 4, 2);
  } else {
    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    context.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }

  context.restore();
}

function drawRelic(context: CanvasRenderingContext2D, relic: Relic) {
  const radius = relic.radius + Math.sin(relic.pulse) * 2;
  context.save();
  context.shadowColor = "rgba(255,46,46,0.9)";
  context.shadowBlur = 22;
  context.strokeStyle = "rgba(255,210,210,0.8)";
  context.fillStyle = "rgba(255,46,46,0.32)";
  context.beginPath();
  context.arc(relic.x, relic.y, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function drawPower(context: CanvasRenderingContext2D, power: PowerUp) {
  context.save();
  context.translate(power.x, power.y);
  context.rotate(Math.PI / 4);
  context.shadowColor = "rgba(255,255,255,0.8)";
  context.shadowBlur = 18;
  context.strokeStyle = power.kind === "shield" ? "rgba(255,255,255,0.8)" : "rgba(255,46,46,0.86)";
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.strokeRect(-power.radius, -power.radius, power.radius * 2, power.radius * 2);
  context.fillRect(-power.radius, -power.radius, power.radius * 2, power.radius * 2);
  context.restore();
}

function drawRunner(context: CanvasRenderingContext2D, runner: Runner, phase: GamePhase) {
  const cloakWave = Math.sin(performance.now() / 120) * 4;
  context.save();
  context.translate(runner.x, runner.y);

  if (runner.dashTime > 0 || runner.shadowDashTime > 0) {
    context.fillStyle = "rgba(255,46,46,0.16)";
    context.fillRect(-48, 18, 52, 12);
    context.fillRect(-72, 34, 62, 7);
  }

  if (runner.shieldTime > 0) {
    context.strokeStyle = "rgba(255,255,255,0.42)";
    context.shadowColor = "rgba(255,46,46,0.55)";
    context.shadowBlur = 18;
    context.beginPath();
    context.arc(runner.width / 2, runner.height / 2, 48, 0, Math.PI * 2);
    context.stroke();
  }

  context.shadowColor = "rgba(255,46,46,0.55)";
  context.shadowBlur = 12;
  context.fillStyle = "#030303";
  context.beginPath();
  context.moveTo(17, 5);
  context.lineTo(35, 24);
  context.lineTo(31 + cloakWave, 70);
  context.lineTo(5 - cloakWave, 70);
  context.lineTo(0, 24);
  context.closePath();
  context.fill();
  context.strokeStyle = "rgba(255,255,255,0.16)";
  context.stroke();

  context.fillStyle = "rgba(255,255,255,0.92)";
  context.fillRect(11, 24, 4, 2);
  context.fillRect(22, 24, 4, 2);

  context.fillStyle = "rgba(255,46,46,0.9)";
  context.shadowColor = "rgba(255,46,46,0.92)";
  context.shadowBlur = 14;
  context.beginPath();
  context.moveTo(8, 6);
  context.lineTo(13, -5);
  context.lineTo(17, 5);
  context.lineTo(22, -5);
  context.lineTo(27, 6);
  context.closePath();
  context.fill();

  if (phase !== "playing") {
    context.globalAlpha = 0.7;
  }

  context.restore();
}

function circleHitsRunner(circle: Relic | PowerUp, runner: Runner) {
  const closestX = Math.max(runner.x, Math.min(circle.x, runner.x + runner.width));
  const closestY = Math.max(runner.y, Math.min(circle.y, runner.y + runner.height));
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;
  return distanceX * distanceX + distanceY * distanceY < circle.radius * circle.radius;
}

function rectsOverlap(runner: Runner, obstacle: Obstacle) {
  return (
    runner.x < obstacle.x + obstacle.width &&
    runner.x + runner.width > obstacle.x &&
    runner.y < obstacle.y + obstacle.height &&
    runner.y + runner.height > obstacle.y
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
