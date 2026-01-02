"use client";

/**
 * String Quartet V1 - Classic Style
 * 클래식 사실적인 스타일 현악 4중주
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetV1Props {
  className?: string;
}

const INSTRUMENT_SOUNDS = {
  violin1: { frequencies: [659.25, 493.88, 392, 329.63], duration: 0.5 },
  violin2: { frequencies: [440, 329.63, 261.63, 220], duration: 0.5 },
  viola: { frequencies: [293.66, 220, 174.61, 146.83], duration: 0.6 },
  cello: { frequencies: [196, 146.83, 110, 98], duration: 0.7 },
};

const COLORS = {
  bg: { dark: "#0a0612", purple: "#1a0a2e", accent: "#2d1b4e" },
  wood: { 
    light: "#D2691E",
    medium: "#8B4513", 
    dark: "#5D3A1A",
    varnish: "#CD853F"
  },
  neon: { gold: "#FFD700" },
};

interface InstrumentState {
  hover: boolean;
  stringVibration: number[];
  breathPhase: number;
  pulseIntensity: number;
}

export default function StringQuartetV1({ className = "" }: StringQuartetV1Props) {
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

    // Warm concert hall background
    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h / 2, w * 0.8);
    bgGrad.addColorStop(0, "#2a1a0a");
    bgGrad.addColorStop(0.5, "#1a0f05");
    bgGrad.addColorStop(1, "#0a0502");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Soft spotlight effect
    const spotlight = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.4, w * 0.6);
    spotlight.addColorStop(0, "rgba(255, 200, 100, 0.08)");
    spotlight.addColorStop(0.5, "rgba(255, 180, 80, 0.03)");
    spotlight.addColorStop(1, "transparent");
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, w, h);

    // Stage floor
    ctx.beginPath();
    for (let x = 0; x < w; x += 5) {
      const waveY = h * 0.72 + Math.sin(x * 0.01 + time) * 3;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const floorGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
    floorGrad.addColorStop(0, "rgba(60, 30, 10, 0.3)");
    floorGrad.addColorStop(1, "rgba(30, 15, 5, 0.5)");
    ctx.fillStyle = floorGrad;
    ctx.fill();

    const pos = getPositions(w, h);

    // Draw instruments
    Object.entries(pos).forEach(([name, p]) => {
      const state = instrumentStates.current[name];
      const isViola = name === "viola";
      const isCello = name === "cello";

      state.breathPhase += 0.02;
      const breathScale = 1 + Math.sin(state.breathPhase) * 0.015;
      state.pulseIntensity *= 0.95;

      ctx.save();
      ctx.translate(p.x, p.y);

      const wobble = Math.sin(time * 2 + state.breathPhase) * 0.01;
      ctx.rotate(p.rot + wobble);

      const scale = p.scale * breathScale * (isCello ? 1 : isViola ? 1.1 : 1);
      ctx.scale(scale, scale);

      if (state.hover || state.pulseIntensity > 0.1) {
        const glowIntensity = state.hover ? 0.4 : state.pulseIntensity * 0.2;
        ctx.shadowColor = COLORS.neon.gold;
        ctx.shadowBlur = 20 * glowIntensity;
      }

      if (isCello) {
        drawClassicCello(ctx, time, state);
      } else {
        drawClassicViolin(ctx, time, state, isViola);
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Label on hover
    if (hoveredInstrument) {
      const p = pos[hoveredInstrument as keyof typeof pos];
      const labels: Record<string, string> = {
        violin1: "1st Violin", violin2: "2nd Violin", viola: "Viola", cello: "Cello",
      };

      const labelY = p.y - 115 * p.scale + Math.sin(time * 2) * 2;

      ctx.font = "italic 14px 'Playfair Display', Georgia, serif";
      ctx.fillStyle = "rgba(255, 220, 180, 0.9)";
      ctx.textAlign = "center";
      ctx.fillText(labels[hoveredInstrument], p.x, labelY);
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

function drawClassicViolin(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState,
  isViola: boolean
) {
  const scale = isViola ? 1.1 : 1;
  
  // Realistic violin body shape
  ctx.beginPath();
  ctx.moveTo(0, -100 * scale);
  
  // Upper bout - right
  ctx.bezierCurveTo(45 * scale, -100 * scale, 55 * scale, -70 * scale, 50 * scale, -40 * scale);
  // C-bout - right
  ctx.bezierCurveTo(42 * scale, -15 * scale, 38 * scale, 15 * scale, 45 * scale, 40 * scale);
  // Lower bout - right
  ctx.bezierCurveTo(58 * scale, 70 * scale, 50 * scale, 95 * scale, 30 * scale, 100 * scale);
  // Bottom
  ctx.quadraticCurveTo(0, 108 * scale, -30 * scale, 100 * scale);
  // Lower bout - left
  ctx.bezierCurveTo(-50 * scale, 95 * scale, -58 * scale, 70 * scale, -45 * scale, 40 * scale);
  // C-bout - left
  ctx.bezierCurveTo(-38 * scale, 15 * scale, -42 * scale, -15 * scale, -50 * scale, -40 * scale);
  // Upper bout - left
  ctx.bezierCurveTo(-55 * scale, -70 * scale, -45 * scale, -100 * scale, 0, -100 * scale);
  ctx.closePath();

  // Wood gradient
  const bodyGrad = ctx.createRadialGradient(-15, -30, 0, 0, 0, 110 * scale);
  bodyGrad.addColorStop(0, isViola ? "#C9A066" : COLORS.wood.varnish);
  bodyGrad.addColorStop(0.4, isViola ? "#8B6914" : COLORS.wood.light);
  bodyGrad.addColorStop(0.8, isViola ? "#6B4423" : COLORS.wood.medium);
  bodyGrad.addColorStop(1, COLORS.wood.dark);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-20, -40, 0, 0, 0, 60);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  shine.addColorStop(0.5, "rgba(255, 220, 180, 0.1)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Purfling (decorative edge)
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // F-holes - classic curved shape
  ctx.strokeStyle = "#1a0500";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    // Upper dot
    ctx.arc(side * 15, -25, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Main f-curve
    ctx.beginPath();
    ctx.moveTo(side * 13, -20);
    ctx.bezierCurveTo(side * 18, -5, side * 20, 20, side * 16, 40);
    ctx.bezierCurveTo(side * 14, 48, side * 18, 52, side * 20, 48);
    ctx.stroke();
    
    // Lower dot
    ctx.beginPath();
    ctx.arc(side * 17, 52, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Bridge
  ctx.fillStyle = "#4a3020";
  ctx.beginPath();
  ctx.moveTo(-18, 50);
  ctx.lineTo(-15, 42);
  ctx.bezierCurveTo(-8, 38, 8, 38, 15, 42);
  ctx.lineTo(18, 50);
  ctx.lineTo(18, 54);
  ctx.lineTo(-18, 54);
  ctx.closePath();
  ctx.fill();

  // Tailpiece
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(-10, 70);
  ctx.lineTo(10, 70);
  ctx.lineTo(8, 95);
  ctx.lineTo(-8, 95);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = COLORS.wood.medium;
  ctx.fillRect(-6, -175, 12, 85);
  
  // Fingerboard
  ctx.fillStyle = "#0a0500";
  ctx.beginPath();
  ctx.moveTo(-7, -170);
  ctx.lineTo(7, -170);
  ctx.lineTo(9, -95);
  ctx.lineTo(-9, -95);
  ctx.closePath();
  ctx.fill();

  // Scroll
  ctx.fillStyle = COLORS.wood.medium;
  ctx.beginPath();
  ctx.arc(-8, -185, 10, 0, Math.PI * 1.5, false);
  ctx.lineWidth = 6;
  ctx.strokeStyle = COLORS.wood.medium;
  ctx.stroke();

  // Pegbox
  ctx.fillStyle = COLORS.wood.medium;
  ctx.fillRect(-8, -180, 16, 15);
  
  // Pegs
  ctx.fillStyle = "#0a0500";
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(side * 12, -172, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(side * 12, -162, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Chin rest
  ctx.fillStyle = "#1a0500";
  ctx.beginPath();
  ctx.ellipse(-35, 85, 15, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Strings
  const stringX = [-5, -2, 2, 5];
  const stringColors = ["#E8E8E8", "#D0D0D0", "#C0C0C0", "#B8B8B8"];
  
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = 0.8 + (3 - i) * 0.15;
    ctx.beginPath();
    ctx.moveTo(x * 0.6, -160);
    for (let y = -160; y <= 90; y += 5) {
      const wave = Math.sin((y + time * 30) * 0.12) * vib * 0.4;
      ctx.lineTo(x * (0.6 + (y + 160) * 0.002) + wave, y);
    }
    ctx.stroke();
  });
}

function drawClassicCello(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState
) {
  // Larger cello body
  ctx.beginPath();
  ctx.moveTo(0, -130);
  
  // Upper bout
  ctx.bezierCurveTo(55, -130, 70, -90, 62, -50);
  // C-bout
  ctx.bezierCurveTo(52, -20, 48, 20, 58, 55);
  // Lower bout
  ctx.bezierCurveTo(75, 95, 65, 135, 40, 145);
  // Bottom
  ctx.quadraticCurveTo(0, 155, -40, 145);
  // Lower bout left
  ctx.bezierCurveTo(-65, 135, -75, 95, -58, 55);
  // C-bout left
  ctx.bezierCurveTo(-48, 20, -52, -20, -62, -50);
  // Upper bout left
  ctx.bezierCurveTo(-70, -90, -55, -130, 0, -130);
  ctx.closePath();

  // Rich cello wood gradient
  const bodyGrad = ctx.createRadialGradient(-20, -40, 0, 0, 0, 150);
  bodyGrad.addColorStop(0, "#DAA06D");
  bodyGrad.addColorStop(0.4, "#CD853F");
  bodyGrad.addColorStop(0.8, "#8B4513");
  bodyGrad.addColorStop(1, "#5D3A1A");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-25, -50, 0, 0, 0, 80);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  shine.addColorStop(0.5, "rgba(255, 220, 180, 0.08)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Purfling
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 2;
  ctx.stroke();

  // F-holes
  ctx.strokeStyle = "#1a0500";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(side * 20, -32, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(side * 17, -25);
    ctx.bezierCurveTo(side * 24, -5, side * 26, 30, side * 20, 55);
    ctx.bezierCurveTo(side * 18, 65, side * 24, 70, side * 26, 65);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(side * 22, 70, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Bridge
  ctx.fillStyle = "#4a3020";
  ctx.beginPath();
  ctx.moveTo(-25, 72);
  ctx.lineTo(-20, 62);
  ctx.bezierCurveTo(-10, 56, 10, 56, 20, 62);
  ctx.lineTo(25, 72);
  ctx.lineTo(25, 78);
  ctx.lineTo(-25, 78);
  ctx.closePath();
  ctx.fill();

  // Tailpiece
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(-15, 95);
  ctx.lineTo(15, 95);
  ctx.lineTo(12, 135);
  ctx.lineTo(-12, 135);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = COLORS.wood.medium;
  ctx.fillRect(-9, -230, 18, 110);
  
  // Fingerboard
  ctx.fillStyle = "#0a0500";
  ctx.beginPath();
  ctx.moveTo(-10, -220);
  ctx.lineTo(10, -220);
  ctx.lineTo(12, -125);
  ctx.lineTo(-12, -125);
  ctx.closePath();
  ctx.fill();

  // Scroll
  ctx.fillStyle = COLORS.wood.medium;
  ctx.beginPath();
  ctx.arc(-10, -245, 12, 0, Math.PI * 1.5, false);
  ctx.lineWidth = 8;
  ctx.strokeStyle = COLORS.wood.medium;
  ctx.stroke();

  // Pegbox
  ctx.fillStyle = COLORS.wood.medium;
  ctx.fillRect(-10, -238, 20, 20);
  
  // Pegs
  ctx.fillStyle = "#0a0500";
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(side * 16, -230, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(side * 16, -218, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Endpin
  ctx.strokeStyle = "#808080";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(0, 195);
  ctx.stroke();
  
  ctx.fillStyle = "#404040";
  ctx.beginPath();
  ctx.arc(0, 195, 5, 0, Math.PI * 2);
  ctx.fill();

  // Strings
  const stringX = [-7, -2.5, 2.5, 7];
  const stringColors = ["#E8E8E8", "#D0D0D0", "#C8C8C8", "#C0C0C0"];
  
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = 1 + (3 - i) * 0.2;
    ctx.beginPath();
    ctx.moveTo(x * 0.5, -210);
    for (let y = -210; y <= 130; y += 6) {
      const wave = Math.sin((y + time * 25) * 0.1) * vib * 0.5;
      ctx.lineTo(x * (0.5 + (y + 210) * 0.0018) + wave, y);
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
