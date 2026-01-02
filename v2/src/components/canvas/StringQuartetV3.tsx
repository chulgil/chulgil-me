"use client";

/**
 * String Quartet V3 - Geometric Style
 * 기하학적 다각형으로 표현된 현악기들
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetV3Props {
  className?: string;
}

// Open string notes: Cello-G(Sol), Viola-D(Re), Violin2-A(La), Violin1-E(Mi)
const INSTRUMENT_SOUNDS = {
  violin1: { frequencies: [659.25, 493.88, 392, 329.63], duration: 0.5 },
  violin2: { frequencies: [440, 329.63, 261.63, 220], duration: 0.5 },
  viola: { frequencies: [293.66, 220, 174.61, 146.83], duration: 0.6 },
  cello: { frequencies: [196, 146.83, 110, 98], duration: 0.7 },
};

const COLORS = {
  bg: { dark: "#0a0612", purple: "#1a0a2e", accent: "#2d1b4e" },
  wood: { warm: "#8B4513", glow: "#CD853F", highlight: "#DEB887" },
  neon: { purple: "#9B59B6", pink: "#E91E63", cyan: "#00BCD4", gold: "#FFD700" },
};

interface InstrumentState {
  hover: boolean;
  stringVibration: number[];
  breathPhase: number;
  pulseIntensity: number;
}

export default function StringQuartetV3({ className = "" }: StringQuartetV3Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [hoveredInstrument, setHoveredInstrument] = useState<string | null>(null);
  const prevHoveredRef = useRef<string | null>(null);

  const instrumentStates = useRef<Record<string, InstrumentState>>({
    violin1: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: 0, pulseIntensity: 0 },
    violin2: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: Math.PI * 0.5, pulseIntensity: 0 },
    viola: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: Math.PI, pulseIntensity: 0 },
    cello: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: Math.PI * 1.5, pulseIntensity: 0 },
  });

  const playInstrumentSound = useCallback(async (name: string) => {
    await audioManager.init();
    if (audioManager.isMuted()) return;
    const sound = INSTRUMENT_SOUNDS[name as keyof typeof INSTRUMENT_SOUNDS];
    if (!sound) return;
    const ctx = (audioManager as unknown as { audioContext: AudioContext }).audioContext;
    if (!ctx || ctx.state === "suspended") return;
    sound.frequencies.forEach((freq, i) => {
      setTimeout(() => playPizzicato(ctx, freq, sound.duration, 0.12), i * 40);
    });
  }, []);

  useEffect(() => {
    if (hoveredInstrument && hoveredInstrument !== prevHoveredRef.current) {
      playInstrumentSound(hoveredInstrument);
      instrumentStates.current[hoveredInstrument].pulseIntensity = 1;
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

    // Animated gradient background
    const bgGrad = ctx.createRadialGradient(
      w / 2 + Math.sin(time * 0.5) * 50,
      h / 2 + Math.cos(time * 0.3) * 30,
      0, w / 2, h / 2, w * 0.8
    );
    bgGrad.addColorStop(0, COLORS.bg.accent);
    bgGrad.addColorStop(0.5, COLORS.bg.purple);
    bgGrad.addColorStop(1, COLORS.bg.dark);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Geometric grid pattern
    ctx.strokeStyle = "rgba(155, 89, 182, 0.05)";
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(time + x * 0.01) * 5, 0);
      ctx.lineTo(x + Math.sin(time + x * 0.01) * 5, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.cos(time + y * 0.01) * 5);
      ctx.lineTo(w, y + Math.cos(time + y * 0.01) * 5);
      ctx.stroke();
    }

    // Wave pattern on floor
    ctx.beginPath();
    for (let x = 0; x < w; x += 5) {
      const waveY = h * 0.7 + Math.sin(x * 0.02 + time * 2) * 10;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = "rgba(155, 89, 182, 0.08)";
    ctx.fill();

    const pos = getPositions(w, h);

    // Draw connecting energy lines
    const posArr = Object.entries(pos);
    ctx.strokeStyle = "rgba(255, 215, 0, " + (0.1 + Math.sin(time * 2) * 0.05) + ")";
    ctx.lineWidth = 1;
    for (let i = 0; i < posArr.length; i++) {
      for (let j = i + 1; j < posArr.length; j++) {
        const [, p1] = posArr[i];
        const [, p2] = posArr[j];
        ctx.beginPath();
        ctx.setLineDash([5, 10]);
        ctx.moveTo(p1.x, p1.y);
        const cpX = (p1.x + p2.x) / 2 + Math.sin(time * 3 + i + j) * 20;
        const cpY = (p1.y + p2.y) / 2 - 30;
        ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Draw instruments
    Object.entries(pos).forEach(([name, p]) => {
      const state = instrumentStates.current[name];
      const isViola = name === "viola";
      const isCello = name === "cello";

      state.breathPhase += 0.02;
      const breathScale = 1 + Math.sin(state.breathPhase) * 0.02;
      state.pulseIntensity *= 0.95;

      ctx.save();
      ctx.translate(p.x, p.y);

      const wobble = Math.sin(time * 2 + state.breathPhase) * 0.02;
      ctx.rotate(p.rot + wobble * (state.hover ? 2 : 1));

      const scale = p.scale * breathScale * (isCello ? 1 : isViola ? 1.1 : 1);
      ctx.scale(scale, scale);

      if (state.hover || state.pulseIntensity > 0.1) {
        const glowIntensity = state.hover ? 0.5 : state.pulseIntensity * 0.3;
        ctx.shadowColor = COLORS.neon.gold;
        ctx.shadowBlur = 30 * glowIntensity;
      }

      if (isCello) {
        drawGeometricCello(ctx, time, state);
      } else {
        drawGeometricViolin(ctx, time, state, isViola);
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Animated label
    if (hoveredInstrument) {
      const p = pos[hoveredInstrument as keyof typeof pos];
      const labels: Record<string, string> = {
        violin1: "1st Violin", violin2: "2nd Violin", viola: "Viola", cello: "Cello",
      };

      const labelY = p.y - 115 * p.scale + Math.sin(time * 3) * 3;

      ctx.shadowColor = COLORS.neon.gold;
      ctx.shadowBlur = 15;
      ctx.font = "bold 14px 'Playfair Display', serif";
      ctx.fillStyle = COLORS.neon.gold;
      ctx.textAlign = "center";
      ctx.fillText(labels[hoveredInstrument], p.x, labelY);
      ctx.shadowBlur = 0;
    }

    // Floating geometric particles
    for (let i = 0; i < 20; i++) {
      const px = (w * 0.2 + (i * w * 0.6) / 20 + Math.sin(time + i * 0.5) * 20) % w;
      const py = h * 0.3 + Math.sin(time * 0.5 + i) * h * 0.3;
      const size = 4 + Math.sin(time * 2 + i) * 2;
      const alpha = 0.3 + Math.sin(time + i) * 0.2;
      const rotation = time * 2 + i;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rotation);
      ctx.fillStyle = "rgba(255, 215, 0, " + alpha + ")";

      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.866, size * 0.5);
        ctx.lineTo(-size * 0.866, size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (i % 3 === 1) {
        ctx.fillRect(-size / 2, -size / 2, size, size);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
      }
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
          s.hover ? Math.sin(timeRef.current * (10 + i * 3)) * 3 : v * 0.9
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

  return <canvas ref={canvasRef} className={"w-full h-full min-h-[400px] cursor-pointer " + className} />;
}

function drawGeometricViolin(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState,
  isViola: boolean
) {
  const scale = isViola ? 1.1 : 1;
  const wave = Math.sin(time * 4) * (state.hover ? 3 : 1);

  // Octagonal body
  ctx.beginPath();
  const sides = 8;
  const bodyWidth = (45 + wave) * scale;
  const bodyHeight = 85 * scale;

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? bodyWidth : bodyWidth * 0.85;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * bodyHeight;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(-50, -80, 50, 80);
  bodyGrad.addColorStop(0, COLORS.wood.highlight);
  bodyGrad.addColorStop(0.5, isViola ? "#6B4423" : COLORS.wood.glow);
  bodyGrad.addColorStop(1, COLORS.wood.warm);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = state.hover ? COLORS.neon.gold : "rgba(255, 215, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const r = 25 * scale;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = state.hover ? COLORS.neon.cyan : "#2F1810";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Diamond F-holes
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 16, -15);
    ctx.lineTo(side * 22, 10);
    ctx.lineTo(side * 16, 35);
    ctx.lineTo(side * 10, 10);
    ctx.closePath();
    ctx.strokeStyle = state.hover ? COLORS.neon.gold : "#2F1810";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Bridge
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.moveTo(-18, 42);
  ctx.lineTo(-15, 38);
  ctx.lineTo(15, 38);
  ctx.lineTo(18, 42);
  ctx.lineTo(18, 47);
  ctx.lineTo(-18, 47);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.moveTo(-8, -155);
  ctx.lineTo(8, -155);
  ctx.lineTo(10, -90);
  ctx.lineTo(-10, -90);
  ctx.closePath();
  ctx.fill();

  // Fingerboard
  ctx.fillStyle = "#2F1810";
  ctx.beginPath();
  ctx.moveTo(-7, -145);
  ctx.lineTo(7, -145);
  ctx.lineTo(9, -95);
  ctx.lineTo(-9, -95);
  ctx.closePath();
  ctx.fill();

  // Pegbox
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.moveTo(0, -175);
  ctx.lineTo(10, -165);
  ctx.lineTo(8, -150);
  ctx.lineTo(-8, -150);
  ctx.lineTo(-10, -165);
  ctx.closePath();
  ctx.fill();

  // Strings
  const stringX = [-5, -2, 2, 5];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    if (Math.abs(vib) > 0.5) {
      ctx.strokeStyle = "rgba(255, 215, 0, " + (Math.abs(vib) * 0.15) + ")";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, -120);
      for (let y = -120; y <= 90; y += 10) {
        const w = Math.sin((y + time * 50) * 0.1) * vib;
        ctx.lineTo(x + w, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(200, 200, 200, " + (0.9 - i * 0.1) + ")";
    ctx.lineWidth = 1 - i * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, -120);
    for (let y = -120; y <= 90; y += 5) {
      const w = Math.sin((y + time * 30) * 0.15) * vib * 0.5;
      ctx.lineTo(x + w, y);
    }
    ctx.stroke();
  });
}

function drawGeometricCello(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState
) {
  const wave = Math.sin(time * 3) * (state.hover ? 4 : 1.5);

  // Decagonal body
  ctx.beginPath();
  const sides = 10;
  const bodyWidth = 58 + wave;
  const bodyHeight = 115;

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? bodyWidth : bodyWidth * 0.9;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * bodyHeight;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(-60, -100, 60, 100);
  bodyGrad.addColorStop(0, COLORS.wood.highlight);
  bodyGrad.addColorStop(0.5, "#B8860B");
  bodyGrad.addColorStop(1, "#8B4513");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = state.hover ? COLORS.neon.gold : "rgba(255, 215, 0, 0.3)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner octagon
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const r = 35;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = state.hover ? COLORS.neon.cyan : "#2F1810";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Diamond F-holes
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 22, -22);
    ctx.lineTo(side * 30, 15);
    ctx.lineTo(side * 22, 52);
    ctx.lineTo(side * 14, 15);
    ctx.closePath();
    ctx.strokeStyle = state.hover ? COLORS.neon.gold : "#2F1810";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  // Bridge
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.moveTo(-25, 62);
  ctx.lineTo(-20, 56);
  ctx.lineTo(20, 56);
  ctx.lineTo(25, 62);
  ctx.lineTo(25, 69);
  ctx.lineTo(-25, 69);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.moveTo(-12, -210);
  ctx.lineTo(12, -210);
  ctx.lineTo(14, -125);
  ctx.lineTo(-14, -125);
  ctx.closePath();
  ctx.fill();

  // Fingerboard
  ctx.fillStyle = "#2F1810";
  ctx.beginPath();
  ctx.moveTo(-10, -200);
  ctx.lineTo(10, -200);
  ctx.lineTo(12, -130);
  ctx.lineTo(-12, -130);
  ctx.closePath();
  ctx.fill();

  // Pegbox hexagon
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 12;
    const y = -225 + Math.sin(angle) * 15;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Endpin
  ctx.strokeStyle = "#A9A9A9";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 155);
  ctx.lineTo(-5, 175);
  ctx.lineTo(5, 175);
  ctx.lineTo(0, 195);
  ctx.stroke();

  // Strings
  const stringX = [-8, -3, 3, 8];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    if (Math.abs(vib) > 0.5) {
      ctx.strokeStyle = "rgba(255, 215, 0, " + (Math.abs(vib) * 0.12) + ")";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, -195);
      for (let y = -195; y <= 130; y += 15) {
        const w = Math.sin((y + time * 40) * 0.08) * vib * 1.2;
        ctx.lineTo(x + w, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(180, 180, 180, " + (0.9 - i * 0.1) + ")";
    ctx.lineWidth = 1.3 - i * 0.12;
    ctx.beginPath();
    ctx.moveTo(x, -195);
    for (let y = -195; y <= 130; y += 8) {
      const w = Math.sin((y + time * 25) * 0.1) * vib * 0.6;
      ctx.lineTo(x + w, y);
    }
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
