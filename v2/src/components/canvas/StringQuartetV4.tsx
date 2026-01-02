"use client";

/**
 * String Quartet V4 - Futuristic Style
 * 미래적 미니멀리스트 현악기 - 네온 라인과 홀로그램 효과
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetV4Props {
  className?: string;
}

const INSTRUMENT_SOUNDS = {
  violin1: { frequencies: [659.25, 493.88, 392, 329.63], duration: 0.5 },
  violin2: { frequencies: [440, 329.63, 261.63, 220], duration: 0.5 },
  viola: { frequencies: [293.66, 220, 174.61, 146.83], duration: 0.6 },
  cello: { frequencies: [196, 146.83, 110, 98], duration: 0.7 },
};

const COLORS = {
  bg: { deep: "#030012", mid: "#0a0520", glow: "#150a30" },
  neon: { 
    cyan: "#00f5ff", 
    magenta: "#ff00ff", 
    gold: "#ffd700", 
    white: "#ffffff",
    blue: "#4169e1"
  },
};

interface InstrumentState {
  hover: boolean;
  stringVibration: number[];
  breathPhase: number;
  pulseIntensity: number;
  scanLine: number;
}

export default function StringQuartetV4({ className = "" }: StringQuartetV4Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [hoveredInstrument, setHoveredInstrument] = useState<string | null>(null);
  const prevHoveredRef = useRef<string | null>(null);

  const instrumentStates = useRef<Record<string, InstrumentState>>({
    violin1: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: 0, pulseIntensity: 0, scanLine: 0 },
    violin2: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: Math.PI * 0.5, pulseIntensity: 0, scanLine: 0 },
    viola: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: Math.PI, pulseIntensity: 0, scanLine: 0 },
    cello: { hover: false, stringVibration: [0, 0, 0, 0], breathPhase: Math.PI * 1.5, pulseIntensity: 0, scanLine: 0 },
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
      instrumentStates.current[hoveredInstrument].scanLine = 0;
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

    // Deep space background
    ctx.fillStyle = COLORS.bg.deep;
    ctx.fillRect(0, 0, w, h);

    // Animated grid lines
    ctx.strokeStyle = "rgba(0, 245, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      const offset = Math.sin(time * 0.5 + x * 0.01) * 3;
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      const offset = Math.cos(time * 0.5 + y * 0.01) * 3;
      ctx.beginPath();
      ctx.moveTo(0, y + offset);
      ctx.lineTo(w, y + offset);
      ctx.stroke();
    }

    // Radial glow from center
    const centerGlow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
    centerGlow.addColorStop(0, "rgba(0, 245, 255, 0.05)");
    centerGlow.addColorStop(0.5, "rgba(255, 0, 255, 0.02)");
    centerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, w, h);

    // Holographic wave floor
    ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      const waveY = h * 0.75 + Math.sin(x * 0.03 + time * 3) * 8 + Math.sin(x * 0.01 + time) * 15;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const floorGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
    floorGrad.addColorStop(0, "rgba(0, 245, 255, 0.1)");
    floorGrad.addColorStop(1, "rgba(255, 0, 255, 0.05)");
    ctx.fillStyle = floorGrad;
    ctx.fill();

    const pos = getPositions(w, h);

    // Laser connection lines
    const posArr = Object.entries(pos);
    for (let i = 0; i < posArr.length; i++) {
      for (let j = i + 1; j < posArr.length; j++) {
        const [, p1] = posArr[i];
        const [, p2] = posArr[j];
        
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, "rgba(0, 245, 255, " + (0.2 + Math.sin(time * 2 + i) * 0.1) + ")");
        gradient.addColorStop(0.5, "rgba(255, 0, 255, " + (0.15 + Math.sin(time * 2 + j) * 0.1) + ")");
        gradient.addColorStop(1, "rgba(0, 245, 255, " + (0.2 + Math.sin(time * 2 + i + j) * 0.1) + ")");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        
        // Curved laser beam
        const cpX = (p1.x + p2.x) / 2 + Math.sin(time * 2 + i + j) * 30;
        const cpY = (p1.y + p2.y) / 2 - 40 + Math.cos(time * 3) * 10;
        ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
        ctx.stroke();
        
        // Beam glow
        ctx.shadowColor = COLORS.neon.cyan;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Draw instruments
    Object.entries(pos).forEach(([name, p]) => {
      const state = instrumentStates.current[name];
      const isViola = name === "viola";
      const isCello = name === "cello";

      state.breathPhase += 0.015;
      state.scanLine = (state.scanLine + 2) % 300;
      const breathScale = 1 + Math.sin(state.breathPhase) * 0.015;
      state.pulseIntensity *= 0.96;

      ctx.save();
      ctx.translate(p.x, p.y);

      const wobble = Math.sin(time * 1.5 + state.breathPhase) * 0.015;
      ctx.rotate(p.rot + wobble);

      const scale = p.scale * breathScale * (isCello ? 1 : isViola ? 1.1 : 1);
      ctx.scale(scale, scale);

      if (isCello) {
        drawFuturisticCello(ctx, time, state);
      } else {
        drawFuturisticViolin(ctx, time, state, isViola);
      }

      ctx.restore();
    });

    // Holographic label
    if (hoveredInstrument) {
      const p = pos[hoveredInstrument as keyof typeof pos];
      const labels: Record<string, string> = {
        violin1: "[ VIOLIN-01 ]", violin2: "[ VIOLIN-02 ]", viola: "[ VIOLA ]", cello: "[ CELLO ]",
      };

      const labelY = p.y - 120 * p.scale + Math.sin(time * 4) * 2;

      // Glitch effect
      const glitchOffset = Math.random() > 0.95 ? (Math.random() - 0.5) * 4 : 0;

      ctx.shadowColor = COLORS.neon.cyan;
      ctx.shadowBlur = 20;
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillStyle = COLORS.neon.cyan;
      ctx.textAlign = "center";
      ctx.fillText(labels[hoveredInstrument], p.x + glitchOffset, labelY);
      
      // Secondary glitch layer
      if (glitchOffset !== 0) {
        ctx.fillStyle = COLORS.neon.magenta;
        ctx.globalAlpha = 0.5;
        ctx.fillText(labels[hoveredInstrument], p.x - glitchOffset, labelY);
        ctx.globalAlpha = 1;
      }
      ctx.shadowBlur = 0;
    }

    // Data stream particles
    for (let i = 0; i < 30; i++) {
      const px = (w * 0.1 + (i * w * 0.8) / 30 + time * 20 + i * 50) % w;
      const py = (h * 0.2 + Math.sin(time * 0.3 + i * 0.5) * h * 0.4);
      const alpha = 0.4 + Math.sin(time * 3 + i) * 0.3;

      ctx.fillStyle = i % 2 === 0 
        ? "rgba(0, 245, 255, " + alpha + ")" 
        : "rgba(255, 0, 255, " + alpha + ")";
      
      // Binary-like rectangles
      ctx.fillRect(px, py, 2, 4 + Math.sin(time + i) * 2);
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

function drawFuturisticViolin(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState,
  isViola: boolean
) {
  const scale = isViola ? 1.1 : 1;
  const glowIntensity = state.hover ? 1 : 0.4;
  const neonColor = isViola ? COLORS.neon.magenta : COLORS.neon.cyan;

  // Outer wireframe body - sleek angular shape
  ctx.beginPath();
  ctx.moveTo(0, -100 * scale); // Top point
  ctx.lineTo(35 * scale, -60 * scale); // Upper right
  ctx.lineTo(45 * scale, 0); // Right wide
  ctx.lineTo(40 * scale, 50 * scale); // Lower right curve
  ctx.lineTo(25 * scale, 90 * scale); // Bottom right
  ctx.lineTo(0, 100 * scale); // Bottom point
  ctx.lineTo(-25 * scale, 90 * scale); // Bottom left
  ctx.lineTo(-40 * scale, 50 * scale); // Lower left curve
  ctx.lineTo(-45 * scale, 0); // Left wide
  ctx.lineTo(-35 * scale, -60 * scale); // Upper left
  ctx.closePath();

  // Holographic fill
  const holoGrad = ctx.createLinearGradient(-50, -100, 50, 100);
  holoGrad.addColorStop(0, "rgba(0, 245, 255, " + (0.05 + state.pulseIntensity * 0.1) + ")");
  holoGrad.addColorStop(0.5, "rgba(255, 0, 255, " + (0.03 + state.pulseIntensity * 0.05) + ")");
  holoGrad.addColorStop(1, "rgba(0, 245, 255, " + (0.05 + state.pulseIntensity * 0.1) + ")");
  ctx.fillStyle = holoGrad;
  ctx.fill();

  // Neon outline
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = state.hover ? 2.5 : 1.5;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 15 * glowIntensity;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner tech pattern - circuit lines
  ctx.strokeStyle = "rgba(255, 255, 255, " + (0.2 + state.pulseIntensity * 0.3) + ")";
  ctx.lineWidth = 0.5;
  
  // Horizontal scan lines
  for (let y = -80; y <= 80; y += 15) {
    const width = 30 - Math.abs(y) * 0.3;
    ctx.beginPath();
    ctx.moveTo(-width * scale, y * scale);
    ctx.lineTo(width * scale, y * scale);
    ctx.stroke();
  }

  // Sound holes - angular slots
  ctx.fillStyle = neonColor;
  ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 12, -25);
    ctx.lineTo(side * 18, -15);
    ctx.lineTo(side * 18, 35);
    ctx.lineTo(side * 12, 45);
    ctx.lineTo(side * 12, -25);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Minimalist bridge - thin line
  ctx.strokeStyle = COLORS.neon.white;
  ctx.lineWidth = 2;
  ctx.shadowColor = COLORS.neon.white;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.moveTo(-20, 55);
  ctx.lineTo(20, 55);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Sleek neck - thin rectangle
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(-5, -180, 10, 90);
  
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 1;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 8;
  ctx.strokeRect(-5, -180, 10, 90);
  ctx.shadowBlur = 0;

  // LED indicators on neck
  for (let i = 0; i < 5; i++) {
    const y = -170 + i * 15;
    const active = (Math.floor(time * 5) + i) % 5 === 0;
    ctx.fillStyle = active ? COLORS.neon.cyan : "rgba(0, 245, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(0, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Minimal scroll - small triangle
  ctx.fillStyle = neonColor;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, -195);
  ctx.lineTo(8, -180);
  ctx.lineTo(-8, -180);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Energy strings
  const stringX = [-4, -1.5, 1.5, 4];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;
    const stringColor = i % 2 === 0 ? COLORS.neon.cyan : COLORS.neon.magenta;

    ctx.strokeStyle = stringColor;
    ctx.lineWidth = state.hover ? 1.5 : 1;
    ctx.shadowColor = stringColor;
    ctx.shadowBlur = state.hover ? 8 : 3;

    ctx.beginPath();
    ctx.moveTo(x, -130);
    for (let y = -130; y <= 90; y += 4) {
      const wave = Math.sin((y + time * 40) * 0.12) * vib * 0.6;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // Scan line effect on hover
  if (state.hover) {
    const scanY = -100 + (state.scanLine % 200);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, scanY);
    ctx.lineTo(50, scanY);
    ctx.stroke();
  }
}

function drawFuturisticCello(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState
) {
  const glowIntensity = state.hover ? 1 : 0.4;

  // Angular cello body
  ctx.beginPath();
  ctx.moveTo(0, -130); // Top
  ctx.lineTo(45, -90); // Upper right
  ctx.lineTo(60, -20); // Right shoulder
  ctx.lineTo(55, 40); // Right waist
  ctx.lineTo(65, 100); // Right hip
  ctx.lineTo(40, 140); // Lower right
  ctx.lineTo(0, 155); // Bottom
  ctx.lineTo(-40, 140); // Lower left
  ctx.lineTo(-65, 100); // Left hip
  ctx.lineTo(-55, 40); // Left waist
  ctx.lineTo(-60, -20); // Left shoulder
  ctx.lineTo(-45, -90); // Upper left
  ctx.closePath();

  // Holographic fill
  const holoGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
  holoGrad.addColorStop(0, "rgba(255, 0, 255, " + (0.08 + state.pulseIntensity * 0.1) + ")");
  holoGrad.addColorStop(0.5, "rgba(0, 245, 255, " + (0.04 + state.pulseIntensity * 0.05) + ")");
  holoGrad.addColorStop(1, "rgba(255, 0, 255, " + (0.06 + state.pulseIntensity * 0.1) + ")");
  ctx.fillStyle = holoGrad;
  ctx.fill();

  // Dual-color neon outline
  ctx.strokeStyle = COLORS.neon.magenta;
  ctx.lineWidth = state.hover ? 3 : 2;
  ctx.shadowColor = COLORS.neon.magenta;
  ctx.shadowBlur = 20 * glowIntensity;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner glow outline
  ctx.strokeStyle = "rgba(0, 245, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tech circuit pattern
  ctx.strokeStyle = "rgba(255, 255, 255, " + (0.15 + state.pulseIntensity * 0.2) + ")";
  ctx.lineWidth = 0.5;
  for (let y = -110; y <= 130; y += 20) {
    const width = 45 - Math.abs(y) * 0.25;
    ctx.beginPath();
    ctx.moveTo(-width, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Glowing sound holes - vertical slots
  ctx.fillStyle = COLORS.neon.cyan;
  ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 18, -35);
    ctx.lineTo(side * 26, -20);
    ctx.lineTo(side * 26, 50);
    ctx.lineTo(side * 18, 65);
    ctx.closePath();
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Minimalist bridge
  ctx.strokeStyle = COLORS.neon.white;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = COLORS.neon.white;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(-28, 80);
  ctx.lineTo(28, 80);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Angular neck
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.beginPath();
  ctx.moveTo(-8, -220);
  ctx.lineTo(8, -220);
  ctx.lineTo(10, -130);
  ctx.lineTo(-10, -130);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.neon.magenta;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = COLORS.neon.magenta;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // LED position markers
  for (let i = 0; i < 6; i++) {
    const y = -210 + i * 12;
    const active = (Math.floor(time * 4) + i) % 6 === 0;
    ctx.fillStyle = active ? COLORS.neon.magenta : "rgba(255, 0, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(0, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scroll - diamond shape
  ctx.fillStyle = COLORS.neon.magenta;
  ctx.shadowColor = COLORS.neon.magenta;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(0, -245);
  ctx.lineTo(10, -230);
  ctx.lineTo(0, -215);
  ctx.lineTo(-10, -230);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Futuristic endpin - laser point
  ctx.strokeStyle = COLORS.neon.cyan;
  ctx.lineWidth = 2;
  ctx.shadowColor = COLORS.neon.cyan;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(0, 160);
  ctx.lineTo(0, 200);
  ctx.stroke();
  
  // Endpin glow point
  ctx.fillStyle = COLORS.neon.cyan;
  ctx.beginPath();
  ctx.arc(0, 200, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Energy strings with glow
  const stringX = [-7, -2.5, 2.5, 7];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;
    const stringColor = i % 2 === 0 ? COLORS.neon.magenta : COLORS.neon.cyan;

    ctx.strokeStyle = stringColor;
    ctx.lineWidth = state.hover ? 1.8 : 1.2;
    ctx.shadowColor = stringColor;
    ctx.shadowBlur = state.hover ? 10 : 4;

    ctx.beginPath();
    ctx.moveTo(x, -200);
    for (let y = -200; y <= 140; y += 5) {
      const wave = Math.sin((y + time * 35) * 0.1) * vib * 0.7;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // Scan line effect
  if (state.hover) {
    const scanY = -130 + (state.scanLine % 290);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-70, scanY);
    ctx.lineTo(70, scanY);
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
