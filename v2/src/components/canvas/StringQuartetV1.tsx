"use client";

/**
 * String Quartet V1 - Light/Bright Theme
 * 밝은 아이보리 배경의 우아한 주간 콘서트 분위기
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetV1Props {
  className?: string;
}

// Open string notes: Cello-G(Sol), Viola-D(Re), Violin2-A(La), Violin1-E(Mi)
const INSTRUMENT_SOUNDS = {
  violin1: { frequencies: [659.25, 493.88, 392, 329.63], duration: 0.5 }, // E5 (Mi)
  violin2: { frequencies: [440, 329.63, 261.63, 220], duration: 0.5 }, // A4 (La)
  viola: { frequencies: [293.66, 220, 174.61, 146.83], duration: 0.6 }, // D4 (Re)
  cello: { frequencies: [196, 146.83, 110, 98], duration: 0.7 }, // G3 (Sol)
};

// Light theme colors
const COLORS = {
  bg: {
    primary: "#FFFFF0", // Ivory
    secondary: "#FFF8DC", // Cornsilk
    accent: "#FAF0E6", // Linen
  },
  wood: {
    light: "#DEB887", // Burlywood
    medium: "#CD853F", // Peru
    dark: "#8B4513", // SaddleBrown
    varnish: "#D2691E", // Chocolate
  },
  accent: {
    gold: "#DAA520", // Goldenrod
    silver: "#A9A9A9",
    rosewood: "#8B0000",
    ebony: "#2F1810",
  },
  shadow: "rgba(139, 69, 19, 0.15)",
};

interface InstrumentState {
  hover: boolean;
  stringVibration: number[];
}

export default function StringQuartetV1({ className = "" }: StringQuartetV1Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [hoveredInstrument, setHoveredInstrument] = useState<string | null>(null);
  const prevHoveredRef = useRef<string | null>(null);

  const instrumentStates = useRef<Record<string, InstrumentState>>({
    violin1: { hover: false, stringVibration: [0, 0, 0, 0] },
    violin2: { hover: false, stringVibration: [0, 0, 0, 0] },
    viola: { hover: false, stringVibration: [0, 0, 0, 0] },
    cello: { hover: false, stringVibration: [0, 0, 0, 0] },
  });

  const playInstrumentSound = useCallback(async (name: string) => {
    await audioManager.init();
    if (audioManager.isMuted()) return;
    const sound = INSTRUMENT_SOUNDS[name as keyof typeof INSTRUMENT_SOUNDS];
    if (!sound) return;
    const ctx = (audioManager as any).audioContext;
    if (!ctx || ctx.state === "suspended") return;
    sound.frequencies.forEach((freq, i) => {
      setTimeout(() => playPizzicato(ctx, freq, sound.duration, 0.12), i * 40);
    });
  }, []);

  useEffect(() => {
    if (hoveredInstrument && hoveredInstrument !== prevHoveredRef.current) {
      playInstrumentSound(hoveredInstrument);
    }
    prevHoveredRef.current = hoveredInstrument;
  }, [hoveredInstrument, playInstrumentSound]);

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

    // Light gradient background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, COLORS.bg.primary);
    bgGrad.addColorStop(0.5, COLORS.bg.secondary);
    bgGrad.addColorStop(1, COLORS.bg.accent);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle floor
    ctx.fillStyle = "rgba(139, 69, 19, 0.08)";
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Warm sunlight effect
    const sunlight = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, w * 0.5);
    sunlight.addColorStop(0, "rgba(255, 223, 150, 0.2)");
    sunlight.addColorStop(1, "rgba(255, 223, 150, 0)");
    ctx.fillStyle = sunlight;
    ctx.fillRect(0, 0, w, h);

    const pos = getPositions(w, h);

    // Draw instruments with soft shadows
    Object.entries(pos).forEach(([name, p]) => {
      const state = instrumentStates.current[name];
      const isViola = name === "viola";
      const isCello = name === "cello";

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + Math.sin(time * 1.5) * 0.015 * (state.hover ? 2 : 1));
      ctx.scale(p.scale * (isCello ? 1 : isViola ? 1.1 : 1), p.scale * (isCello ? 1 : isViola ? 1.1 : 1));

      // Soft shadow
      ctx.save();
      ctx.translate(6, 10);
      ctx.globalAlpha = 0.12;
      if (isCello) drawCelloBody(ctx, "#000");
      else drawViolinBody(ctx, "#000");
      ctx.restore();

      // Body
      if (isCello) {
        drawCelloBody(ctx, COLORS.wood.varnish);
        drawCelloDetails(ctx, state, time);
      } else {
        drawViolinBody(ctx, isViola ? COLORS.wood.dark : COLORS.wood.medium);
        drawViolinDetails(ctx, state, time);
      }

      ctx.restore();
    });

    // Instrument label
    if (hoveredInstrument) {
      const p = pos[hoveredInstrument as keyof typeof pos];
      const labels: Record<string, string> = {
        violin1: "1st Violin", violin2: "2nd Violin", viola: "Viola", cello: "Cello",
      };
      ctx.font = "bold 13px 'Playfair Display', serif";
      ctx.fillStyle = COLORS.accent.rosewood;
      ctx.textAlign = "center";
      ctx.fillText(labels[hoveredInstrument], p.x, p.y - 110 * p.scale);
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

// Shared drawing functions (simplified)
function drawViolinBody(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
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
  ctx.fill();

  // Shine
  const shine = ctx.createRadialGradient(-12, -25, 0, 0, 0, 90);
  shine.addColorStop(0, "rgba(255, 240, 220, 0.4)");
  shine.addColorStop(0.5, "rgba(200, 150, 100, 0.15)");
  shine.addColorStop(1, "rgba(100, 60, 30, 0.2)");
  ctx.fillStyle = shine;
  ctx.fill();
}

function drawViolinDetails(ctx: CanvasRenderingContext2D, state: InstrumentState, time: number) {
  // F-holes
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, -22);
  ctx.bezierCurveTo(-22, -4, -22, 22, -18, 40);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, -22);
  ctx.bezierCurveTo(22, -4, 22, 22, 18, 40);
  ctx.stroke();

  // Bridge
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-20, 48, 40, 6);

  // Neck
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-7, -175, 14, 75);
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.fillRect(-9, -165, 18, 60);

  // Strings with vibration
  const stringX = [-6, -2, 2, 6];
  stringX.forEach((x, i) => {
    ctx.strokeStyle = `rgba(180, 180, 180, ${0.9 - i * 0.1})`;
    ctx.lineWidth = 1 - i * 0.1;
    ctx.beginPath();
    const vib = state.stringVibration[i] || 0;
    ctx.moveTo(x, -130);
    ctx.bezierCurveTo(x + vib * 0.3, -50, x + vib, 20, x, 100);
    ctx.stroke();
  });

  // Hover glow
  if (state.hover) {
    ctx.strokeStyle = "rgba(218, 165, 32, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawCelloBody(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
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
  ctx.fill();

  const shine = ctx.createRadialGradient(-18, -35, 0, 0, 0, 130);
  shine.addColorStop(0, "rgba(255, 240, 220, 0.35)");
  shine.addColorStop(1, "rgba(100, 60, 30, 0.2)");
  ctx.fillStyle = shine;
  ctx.fill();
}

function drawCelloDetails(ctx: CanvasRenderingContext2D, state: InstrumentState, time: number) {
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-25, -28);
  ctx.bezierCurveTo(-30, 0, -30, 35, -25, 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(25, -28);
  ctx.bezierCurveTo(30, 0, 30, 35, 25, 62);
  ctx.stroke();

  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-28, 68, 56, 8);

  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-10, -230, 20, 100);
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.fillRect(-12, -220, 24, 75);

  // Endpin
  ctx.strokeStyle = COLORS.accent.silver;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 165);
  ctx.lineTo(0, 210);
  ctx.stroke();

  const stringX = [-9, -3, 3, 9];
  stringX.forEach((x, i) => {
    ctx.strokeStyle = `rgba(160, 160, 160, ${0.9 - i * 0.1})`;
    ctx.lineWidth = 1.4 - i * 0.15;
    ctx.beginPath();
    const vib = state.stringVibration[i] || 0;
    ctx.moveTo(x, -210);
    ctx.bezierCurveTo(x + vib * 0.4, -80, x + vib * 1.1, 40, x, 140);
    ctx.stroke();
  });

  if (state.hover) {
    ctx.strokeStyle = "rgba(218, 165, 32, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
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
