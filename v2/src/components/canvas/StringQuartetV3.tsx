"use client";

/**
 * String Quartet V3 - Particle & Music Notes Effect
 * 떠다니는 음표 파티클, 반짝이는 효과, 음파 시각화
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetV3Props {
  className?: string;
}

// Open string notes: Cello-G, Viola-D, Violin2-A, Violin1-E
const INSTRUMENT_SOUNDS = {
  violin1: { frequencies: [659.25, 493.88, 392, 329.63], duration: 0.5 }, // E5 based
  violin2: { frequencies: [440, 329.63, 261.63, 220], duration: 0.5 }, // A4 based
  viola: { frequencies: [293.66, 220, 174.61, 146.83], duration: 0.6 }, // D4 based
  cello: { frequencies: [196, 146.83, 110, 98], duration: 0.7 }, // G3 based
};

const MUSIC_SYMBOLS = ["♩", "♪", "♫", "♬", "𝄞", "♭", "♯"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  symbol: string;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface InstrumentState {
  hover: boolean;
  stringVibration: number[];
  particles: Particle[];
}

const COLORS = {
  bg: "#0a0a12",
  instruments: {
    violin1: "#FFD700",
    violin2: "#FFA500",
    viola: "#9B59B6",
    cello: "#E74C3C",
  },
};

export default function StringQuartetV3({ className = "" }: StringQuartetV3Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [hoveredInstrument, setHoveredInstrument] = useState<string | null>(null);
  const prevHoveredRef = useRef<string | null>(null);
  const globalParticles = useRef<Particle[]>([]);

  const instrumentStates = useRef<Record<string, InstrumentState>>({
    violin1: { hover: false, stringVibration: [0, 0, 0, 0], particles: [] },
    violin2: { hover: false, stringVibration: [0, 0, 0, 0], particles: [] },
    viola: { hover: false, stringVibration: [0, 0, 0, 0], particles: [] },
    cello: { hover: false, stringVibration: [0, 0, 0, 0], particles: [] },
  });

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      globalParticles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        maxLife: 60 + Math.random() * 60,
        size: 12 + Math.random() * 16,
        symbol: MUSIC_SYMBOLS[Math.floor(Math.random() * MUSIC_SYMBOLS.length)],
        color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
    }
  }, []);

  const playInstrumentSound = useCallback(async (name: string) => {
    await audioManager.init();
    if (audioManager.isMuted()) return;
    const sound = INSTRUMENT_SOUNDS[name as keyof typeof INSTRUMENT_SOUNDS];
    if (!sound) return;
    const ctx = (audioManager as any).audioContext;
    if (!ctx || ctx.state === "suspended") return;
    sound.frequencies.forEach((freq, i) => {
      setTimeout(() => playPizzicato(ctx, freq, sound.duration, 0.15), i * 60);
    });
  }, []);

  useEffect(() => {
    if (hoveredInstrument && hoveredInstrument !== prevHoveredRef.current) {
      playInstrumentSound(hoveredInstrument);
      // Spawn particles on hover
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const pos = getPositions(rect.width, rect.height);
        const p = pos[hoveredInstrument as keyof typeof pos];
        const color = COLORS.instruments[hoveredInstrument as keyof typeof COLORS.instruments];
        spawnParticles(p.x, p.y, color, 15);
      }
    }
    prevHoveredRef.current = hoveredInstrument;
  }, [hoveredInstrument, playInstrumentSound, spawnParticles]);

  const getPositions = useCallback((w: number, h: number) => {
    const cx = w / 2, cy = h / 2, s = Math.min(w, h) / 800;
    return {
      violin1: { x: cx - 180 * s, y: cy - 40 * s, scale: s * 0.65, rot: -0.12 },
      violin2: { x: cx + 180 * s, y: cy - 40 * s, scale: s * 0.65, rot: 0.12 },
      viola: { x: cx - 60 * s, y: cy + 40 * s, scale: s * 0.75, rot: -0.08 },
      cello: { x: cx + 90 * s, y: cy + 90 * s, scale: s * 1.0, rot: 0.04 },
    };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const time = timeRef.current;

    // Dark gradient background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, "#1a1a2e");
    bgGrad.addColorStop(1, COLORS.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Starfield background
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137 + time * 5) % w;
      const sy = (i * 73) % h;
      const brightness = 0.3 + Math.sin(time * 2 + i) * 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.fill();
    }

    // Sound wave rings from center
    for (let i = 0; i < 5; i++) {
      const radius = ((time * 30 + i * 80) % 400);
      const alpha = 0.15 * (1 - radius / 400);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const pos = getPositions(w, h);

    // Draw instruments with color auras
    Object.entries(pos).forEach(([name, p]) => {
      const state = instrumentStates.current[name];
      const isViola = name === "viola";
      const isCello = name === "cello";
      const color = COLORS.instruments[name as keyof typeof COLORS.instruments];

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + Math.sin(time * 1.5) * 0.02 * (state.hover ? 2 : 1));
      ctx.scale(p.scale * (isCello ? 1 : isViola ? 1.1 : 1), p.scale * (isCello ? 1 : isViola ? 1.1 : 1));

      // Colored aura
      if (state.hover) {
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, isCello ? 160 : 120);
        auraGrad.addColorStop(0, `${color}40`);
        auraGrad.addColorStop(0.5, `${color}20`);
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.fillRect(-180, -220, 360, 440);

        // Sparkle effect
        for (let i = 0; i < 8; i++) {
          const angle = (time * 2 + i * Math.PI / 4) % (Math.PI * 2);
          const dist = 80 + Math.sin(time * 3 + i) * 20;
          const sx = Math.cos(angle) * dist;
          const sy = Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${Math.floor(150 + Math.sin(time * 5 + i) * 50).toString(16)}`;
          ctx.fill();
        }
      }

      // Soft shadow
      ctx.save();
      ctx.translate(4, 8);
      ctx.globalAlpha = 0.15;
      if (isCello) drawCelloShape(ctx);
      else drawViolinShape(ctx);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.restore();

      // Body with color tint
      if (isCello) {
        drawCelloWithColor(ctx, color, state, time);
      } else {
        drawViolinWithColor(ctx, color, state, time, isViola);
      }

      ctx.restore();
    });

    // Update and draw global particles
    globalParticles.current = globalParticles.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // Slight gravity
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.life -= 1 / p.maxLife;

      if (p.life <= 0) return false;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.life;
      ctx.font = `${p.size}px 'Playfair Display', serif`;
      ctx.fillStyle = p.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillText(p.symbol, 0, 0);
      ctx.restore();

      return true;
    });

    // Ambient floating notes
    for (let i = 0; i < 8; i++) {
      const nx = w * 0.1 + (i * w * 0.8) / 8 + Math.sin(time + i) * 30;
      const ny = h * 0.2 + Math.sin(time * 0.5 + i * 0.7) * h * 0.3;
      const alpha = 0.15 + Math.sin(time * 2 + i) * 0.1;

      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(Math.sin(time + i) * 0.3);
      ctx.font = "20px 'Playfair Display', serif";
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.textAlign = "center";
      ctx.fillText(MUSIC_SYMBOLS[i % MUSIC_SYMBOLS.length], 0, 0);
      ctx.restore();
    }

    // Label with particles
    if (hoveredInstrument) {
      const p = pos[hoveredInstrument as keyof typeof pos];
      const labels: Record<string, string> = {
        violin1: "1st Violin (E)", violin2: "2nd Violin (A)", viola: "Viola (D)", cello: "Cello (G)",
      };
      const color = COLORS.instruments[hoveredInstrument as keyof typeof COLORS.instruments];

      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.font = "bold 14px 'Playfair Display', serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(labels[hoveredInstrument], p.x, p.y - 115 * p.scale);
      ctx.restore();
    }
  }, [getPositions, hoveredInstrument]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const pos = getPositions(rect.width, rect.height);
      let hovered: string | null = null;

      Object.entries(pos).forEach(([name, p]) => {
        const dx = mx - p.x, dy = my - p.y;
        const r = name === "cello" ? 90 * p.scale : 60 * p.scale;
        instrumentStates.current[name].hover = Math.sqrt(dx * dx + dy * dy) < r;
        if (instrumentStates.current[name].hover) hovered = name;
      });
      setHoveredInstrument(hovered);
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      Object.values(instrumentStates.current).forEach((s) => {
        s.stringVibration = s.stringVibration.map((v, i) =>
          s.hover ? Math.sin(timeRef.current * (8 + i * 2)) * 2.5 : v * 0.92
        );
      });
      draw(ctx, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draw, getPositions]);

  return <canvas ref={canvasRef} className={`w-full h-full min-h-[400px] cursor-pointer ${className}`} />;
}

function drawViolinShape(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -110);
  ctx.bezierCurveTo(42, -110, 55, -75, 50, -38);
  ctx.bezierCurveTo(45, -12, 36, 8, 44, 28);
  ctx.bezierCurveTo(55, 55, 65, 92, 46, 115);
  ctx.bezierCurveTo(22, 135, -22, 135, -46, 115);
  ctx.bezierCurveTo(-65, 92, -55, 55, -44, 28);
  ctx.bezierCurveTo(-36, 8, -45, -12, -50, -38);
  ctx.bezierCurveTo(-55, -75, -42, -110, 0, -110);
  ctx.closePath();
}

function drawCelloShape(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -140);
  ctx.bezierCurveTo(55, -140, 72, -92, 68, -46);
  ctx.bezierCurveTo(63, -18, 50, 9, 58, 42);
  ctx.bezierCurveTo(72, 78, 86, 120, 63, 152);
  ctx.bezierCurveTo(36, 180, -36, 180, -63, 152);
  ctx.bezierCurveTo(-86, 120, -72, 78, -58, 42);
  ctx.bezierCurveTo(-50, 9, -63, -18, -68, -46);
  ctx.bezierCurveTo(-72, -92, -55, -140, 0, -140);
  ctx.closePath();
}

function drawViolinWithColor(
  ctx: CanvasRenderingContext2D,
  color: string,
  state: InstrumentState,
  time: number,
  isViola: boolean
) {
  drawViolinShape(ctx);

  const bodyGrad = ctx.createRadialGradient(-12, -25, 0, 0, 0, 90);
  bodyGrad.addColorStop(0, "#DEB887");
  bodyGrad.addColorStop(0.5, isViola ? "#6B4423" : "#CD853F");
  bodyGrad.addColorStop(1, "#5D3A1A");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Color overlay on hover
  if (state.hover) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Shine
  const shine = ctx.createRadialGradient(-12, -25, 0, 0, 0, 90);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // F-holes
  ctx.strokeStyle = state.hover ? color : "#2F1810";
  ctx.lineWidth = 2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 18, -22);
    ctx.bezierCurveTo(side * 22, -4, side * 22, 22, side * 18, 40);
    ctx.stroke();
  });

  // Bridge & Neck
  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-20, 48, 40, 6);
  ctx.fillRect(-7, -175, 14, 75);
  ctx.fillStyle = "#2F1810";
  ctx.fillRect(-9, -165, 18, 60);

  // Strings with color
  const stringX = [-6, -2, 2, 6];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;
    ctx.strokeStyle = state.hover
      ? `${color}${Math.floor(200 + Math.sin(time * 10 + i) * 55).toString(16)}`
      : `rgba(180, 180, 180, ${0.9 - i * 0.1})`;
    ctx.lineWidth = state.hover ? 1.5 : 1 - i * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, -130);
    ctx.bezierCurveTo(x + vib * 0.3, -50, x + vib, 20, x, 100);
    ctx.stroke();
  });
}

function drawCelloWithColor(
  ctx: CanvasRenderingContext2D,
  color: string,
  state: InstrumentState,
  time: number
) {
  drawCelloShape(ctx);

  const bodyGrad = ctx.createRadialGradient(-18, -35, 0, 0, 0, 130);
  bodyGrad.addColorStop(0, "#DEB887");
  bodyGrad.addColorStop(0.5, "#B8860B");
  bodyGrad.addColorStop(1, "#6B4423");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  if (state.hover) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const shine = ctx.createRadialGradient(-18, -35, 0, 0, 0, 130);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  ctx.strokeStyle = state.hover ? color : "#2F1810";
  ctx.lineWidth = 2.5;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 25, -28);
    ctx.bezierCurveTo(side * 30, 0, side * 30, 35, side * 25, 62);
    ctx.stroke();
  });

  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-28, 68, 56, 8);
  ctx.fillRect(-10, -230, 20, 100);
  ctx.fillStyle = "#2F1810";
  ctx.fillRect(-12, -220, 24, 75);

  ctx.strokeStyle = "#A9A9A9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 165);
  ctx.lineTo(0, 210);
  ctx.stroke();

  const stringX = [-9, -3, 3, 9];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;
    ctx.strokeStyle = state.hover
      ? `${color}${Math.floor(200 + Math.sin(time * 8 + i) * 55).toString(16)}`
      : `rgba(160, 160, 160, ${0.9 - i * 0.1})`;
    ctx.lineWidth = state.hover ? 1.8 : 1.4 - i * 0.15;
    ctx.beginPath();
    ctx.moveTo(x, -210);
    ctx.bezierCurveTo(x + vib * 0.4, -80, x + vib * 1.1, 40, x, 140);
    ctx.stroke();
  });
}

function playPizzicato(ctx: AudioContext, freq: number, dur: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.1);
}
