"use client";

/**
 * String Quartet V2 - Animation Enhanced
 * 호흡하는 악기들, 물결치는 현, 동적 조명
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetV2Props {
  className?: string;
}

// Open string notes: Cello-G(Sol), Viola-D(Re), Violin2-A(La), Violin1-E(Mi)
const INSTRUMENT_SOUNDS = {
  violin1: { frequencies: [659.25, 493.88, 392, 329.63], duration: 0.5 }, // E5 (Mi)
  violin2: { frequencies: [440, 329.63, 261.63, 220], duration: 0.5 }, // A4 (La)
  viola: { frequencies: [293.66, 220, 174.61, 146.83], duration: 0.6 }, // D4 (Re)
  cello: { frequencies: [196, 146.83, 110, 98], duration: 0.7 }, // G3 (Sol)
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

export default function StringQuartetV2({ className = "" }: StringQuartetV2Props) {
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
    const ctx = (audioManager as any).audioContext;
    if (!ctx || ctx.state === "suspended") return;
    sound.frequencies.forEach((freq, i) => {
      setTimeout(() => playPizzicato(ctx, freq, sound.duration, 0.12), i * 40);
    });
  }, []);

  useEffect(() => {
    if (hoveredInstrument && hoveredInstrument !== prevHoveredRef.current) {
      playInstrumentSound(hoveredInstrument);
      // Trigger pulse on hover
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
      0,
      w / 2,
      h / 2,
      w * 0.8
    );
    bgGrad.addColorStop(0, COLORS.bg.accent);
    bgGrad.addColorStop(0.5, COLORS.bg.purple);
    bgGrad.addColorStop(1, COLORS.bg.dark);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Moving light rays
    for (let i = 0; i < 5; i++) {
      const angle = time * 0.2 + (i * Math.PI * 2) / 5;
      const rayGrad = ctx.createLinearGradient(
        w / 2,
        0,
        w / 2 + Math.cos(angle) * w,
        h
      );
      rayGrad.addColorStop(0, `rgba(155, 89, 182, ${0.03 + Math.sin(time + i) * 0.02})`);
      rayGrad.addColorStop(1, "transparent");
      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, 0, w, h);
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

    // Draw connecting energy lines between instruments
    const posArr = Object.entries(pos);
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 + Math.sin(time * 2) * 0.05})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < posArr.length; i++) {
      for (let j = i + 1; j < posArr.length; j++) {
        const [, p1] = posArr[i];
        const [, p2] = posArr[j];
        ctx.beginPath();
        ctx.setLineDash([5, 10]);
        ctx.moveTo(p1.x, p1.y);
        // Curved connection
        const cpX = (p1.x + p2.x) / 2 + Math.sin(time * 3 + i + j) * 20;
        const cpY = (p1.y + p2.y) / 2 - 30;
        ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Draw instruments with breathing effect
    Object.entries(pos).forEach(([name, p]) => {
      const state = instrumentStates.current[name];
      const isViola = name === "viola";
      const isCello = name === "cello";

      // Update breath phase
      state.breathPhase += 0.02;
      const breathScale = 1 + Math.sin(state.breathPhase) * 0.02;

      // Decay pulse
      state.pulseIntensity *= 0.95;

      ctx.save();
      ctx.translate(p.x, p.y);

      // Wobble animation
      const wobble = Math.sin(time * 2 + state.breathPhase) * 0.02;
      ctx.rotate(p.rot + wobble * (state.hover ? 2 : 1));

      const scale = p.scale * breathScale * (isCello ? 1 : isViola ? 1.1 : 1);
      ctx.scale(scale, scale);

      // Glow effect on hover/pulse
      if (state.hover || state.pulseIntensity > 0.1) {
        const glowIntensity = state.hover ? 0.5 : state.pulseIntensity * 0.3;
        ctx.shadowColor = COLORS.neon.gold;
        ctx.shadowBlur = 30 * glowIntensity;
      }

      // Body with gradient
      if (isCello) {
        drawAnimatedCelloBody(ctx, time, state);
      } else {
        drawAnimatedViolinBody(ctx, time, state, isViola);
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Animated label
    if (hoveredInstrument) {
      const p = pos[hoveredInstrument as keyof typeof pos];
      const labels: Record<string, string> = {
        violin1: "1st Violin ♪", violin2: "2nd Violin ♫", viola: "Viola ♩", cello: "Cello ♬",
      };

      const labelY = p.y - 115 * p.scale + Math.sin(time * 3) * 3;

      // Glow behind text
      ctx.shadowColor = COLORS.neon.gold;
      ctx.shadowBlur = 15;
      ctx.font = "bold 14px 'Playfair Display', serif";
      ctx.fillStyle = COLORS.neon.gold;
      ctx.textAlign = "center";
      ctx.fillText(labels[hoveredInstrument], p.x, labelY);
      ctx.shadowBlur = 0;
    }

    // Floating particles
    for (let i = 0; i < 20; i++) {
      const px = (w * 0.2 + (i * w * 0.6) / 20 + Math.sin(time + i * 0.5) * 20) % w;
      const py = (h * 0.3 + Math.sin(time * 0.5 + i) * h * 0.3);
      const size = 2 + Math.sin(time * 2 + i) * 1;
      const alpha = 0.3 + Math.sin(time + i) * 0.2;

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.fill();
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

  return <canvas ref={canvasRef} className={`w-full h-full min-h-[400px] cursor-pointer ${className}`} />;
}

function drawAnimatedViolinBody(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState,
  isViola: boolean
) {
  // Animated outline with wave effect
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const wave = Math.sin(time * 4 + t * 8) * (state.hover ? 2 : 0.5);

    let r: number;
    if (t < -Math.PI * 0.3 || t > Math.PI * 0.3) {
      r = 45 + Math.cos(t * 2) * 15 + wave;
    } else {
      r = 35 + wave;
    }

    const x = Math.cos(t) * r;
    const y = Math.sin(t) * 85 + (t > 0 ? 20 : -20);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Gradient fill
  const bodyGrad = ctx.createRadialGradient(-10, -20, 0, 0, 0, 100);
  bodyGrad.addColorStop(0, COLORS.wood.highlight);
  bodyGrad.addColorStop(0.5, isViola ? "#6B4423" : COLORS.wood.glow);
  bodyGrad.addColorStop(1, COLORS.wood.warm);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Animated shine
  const shineX = -15 + Math.sin(time) * 5;
  const shine = ctx.createRadialGradient(shineX, -25, 0, 0, 0, 80);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  shine.addColorStop(0.5, "rgba(255, 200, 150, 0.1)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // F-holes with glow
  ctx.strokeStyle = state.hover ? COLORS.neon.gold : "#2F1810";
  ctx.lineWidth = 2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 16, -18);
    ctx.bezierCurveTo(side * 20, 0, side * 20, 25, side * 16, 38);
    ctx.stroke();
  });

  // Bridge
  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-18, 42, 36, 5);

  // Neck
  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-6, -160, 12, 70);
  ctx.fillStyle = "#2F1810";
  ctx.fillRect(-8, -150, 16, 55);

  // Animated strings
  const stringX = [-5, -2, 2, 5];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    // String glow when vibrating
    if (Math.abs(vib) > 0.5) {
      ctx.strokeStyle = `rgba(255, 215, 0, ${Math.abs(vib) * 0.15})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, -120);
      for (let y = -120; y <= 90; y += 10) {
        const wave = Math.sin((y + time * 50) * 0.1) * vib;
        ctx.lineTo(x + wave, y);
      }
      ctx.stroke();
    }

    // Main string
    ctx.strokeStyle = `rgba(200, 200, 200, ${0.9 - i * 0.1})`;
    ctx.lineWidth = 1 - i * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, -120);
    for (let y = -120; y <= 90; y += 5) {
      const wave = Math.sin((y + time * 30) * 0.15) * vib * 0.5;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
  });
}

function drawAnimatedCelloBody(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState
) {
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const wave = Math.sin(time * 3 + t * 6) * (state.hover ? 3 : 1);

    let r: number;
    if (t < -Math.PI * 0.3 || t > Math.PI * 0.3) {
      r = 58 + Math.cos(t * 2) * 18 + wave;
    } else {
      r = 45 + wave;
    }

    const x = Math.cos(t) * r;
    const y = Math.sin(t) * 115 + (t > 0 ? 25 : -25);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const bodyGrad = ctx.createRadialGradient(-15, -30, 0, 0, 0, 130);
  bodyGrad.addColorStop(0, COLORS.wood.highlight);
  bodyGrad.addColorStop(0.5, "#B8860B");
  bodyGrad.addColorStop(1, "#8B4513");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  const shineX = -18 + Math.sin(time * 0.8) * 8;
  const shine = ctx.createRadialGradient(shineX, -35, 0, 0, 0, 110);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.25)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // F-holes
  ctx.strokeStyle = state.hover ? COLORS.neon.gold : "#2F1810";
  ctx.lineWidth = 2.5;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 22, -25);
    ctx.bezierCurveTo(side * 28, 0, side * 28, 40, side * 22, 58);
    ctx.stroke();
  });

  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-25, 62, 50, 7);

  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-9, -215, 18, 90);
  ctx.fillStyle = "#2F1810";
  ctx.fillRect(-11, -205, 22, 70);

  // Endpin
  ctx.strokeStyle = "#A9A9A9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 155);
  ctx.lineTo(0, 195);
  ctx.stroke();

  // Animated strings
  const stringX = [-8, -3, 3, 8];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    if (Math.abs(vib) > 0.5) {
      ctx.strokeStyle = `rgba(255, 215, 0, ${Math.abs(vib) * 0.12})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, -195);
      for (let y = -195; y <= 130; y += 15) {
        const wave = Math.sin((y + time * 40) * 0.08) * vib * 1.2;
        ctx.lineTo(x + wave, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(180, 180, 180, ${0.9 - i * 0.1})`;
    ctx.lineWidth = 1.3 - i * 0.12;
    ctx.beginPath();
    ctx.moveTo(x, -195);
    for (let y = -195; y <= 130; y += 8) {
      const wave = Math.sin((y + time * 25) * 0.1) * vib * 0.6;
      ctx.lineTo(x + wave, y);
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
