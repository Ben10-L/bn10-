"use client";

const dots = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  x: `${(index * 37) % 100}%`,
  y: `${(index * 53) % 100}%`,
  delay: (index % 7) * 0.35
}));

export function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_1px)] [background-size:28px_28px]" />
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="absolute h-1.5 w-1.5 animate-pulseRing rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
          style={{ left: dot.x, top: dot.y, animationDelay: `${dot.delay}s` }}
        />
      ))}
    </div>
  );
}
