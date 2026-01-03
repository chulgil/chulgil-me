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
  const s = isViola ? 1.15 : 1;

  // === BODY - Accurate violin proportions ===
  ctx.beginPath();

  // Start at top center (where neck meets body)
  ctx.moveTo(0, -85 * s);

  // Upper bout - right side (wider, rounder)
  ctx.bezierCurveTo(25 * s, -85 * s, 42 * s, -78 * s, 48 * s, -65 * s);
  ctx.bezierCurveTo(52 * s, -55 * s, 50 * s, -42 * s, 45 * s, -30 * s);

  // C-bout right (the waist - distinctive inward curve)
  ctx.bezierCurveTo(38 * s, -15 * s, 32 * s, 0, 32 * s, 10 * s);
  ctx.bezierCurveTo(32 * s, 20 * s, 38 * s, 35 * s, 48 * s, 50 * s);

  // Lower bout right (larger than upper bout)
  ctx.bezierCurveTo(58 * s, 65 * s, 58 * s, 82 * s, 50 * s, 92 * s);
  ctx.bezierCurveTo(42 * s, 100 * s, 25 * s, 105 * s, 0, 105 * s);

  // Lower bout left
  ctx.bezierCurveTo(-25 * s, 105 * s, -42 * s, 100 * s, -50 * s, 92 * s);
  ctx.bezierCurveTo(-58 * s, 82 * s, -58 * s, 65 * s, -48 * s, 50 * s);

  // C-bout left
  ctx.bezierCurveTo(-38 * s, 35 * s, -32 * s, 20 * s, -32 * s, 10 * s);
  ctx.bezierCurveTo(-32 * s, 0, -38 * s, -15 * s, -45 * s, -30 * s);

  // Upper bout left
  ctx.bezierCurveTo(-50 * s, -42 * s, -52 * s, -55 * s, -48 * s, -65 * s);
  ctx.bezierCurveTo(-42 * s, -78 * s, -25 * s, -85 * s, 0, -85 * s);

  ctx.closePath();

  // Wood base color
  const baseColor = isViola ? "#9A6B3A" : "#B5651D";
  ctx.fillStyle = baseColor;
  ctx.fill();

  // Wood grain effect - multiple gradient layers
  const grainGrad = ctx.createLinearGradient(-50 * s, -80 * s, 50 * s, 100 * s);
  grainGrad.addColorStop(0, "rgba(180, 120, 60, 0.3)");
  grainGrad.addColorStop(0.2, "rgba(120, 70, 30, 0.2)");
  grainGrad.addColorStop(0.4, "rgba(160, 100, 50, 0.25)");
  grainGrad.addColorStop(0.6, "rgba(100, 60, 25, 0.2)");
  grainGrad.addColorStop(0.8, "rgba(140, 90, 45, 0.25)");
  grainGrad.addColorStop(1, "rgba(80, 45, 20, 0.3)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine (top-left highlight)
  const varnishShine = ctx.createRadialGradient(-15 * s, -50 * s, 0, -10 * s, -30 * s, 70 * s);
  varnishShine.addColorStop(0, "rgba(255, 240, 200, 0.35)");
  varnishShine.addColorStop(0.3, "rgba(255, 220, 180, 0.15)");
  varnishShine.addColorStop(0.7, "rgba(200, 150, 100, 0.05)");
  varnishShine.addColorStop(1, "transparent");
  ctx.fillStyle = varnishShine;
  ctx.fill();

  // Edge shadow for depth
  const edgeShadow = ctx.createRadialGradient(0, 10 * s, 30 * s, 0, 10 * s, 80 * s);
  edgeShadow.addColorStop(0, "transparent");
  edgeShadow.addColorStop(0.7, "transparent");
  edgeShadow.addColorStop(1, "rgba(40, 20, 5, 0.4)");
  ctx.fillStyle = edgeShadow;
  ctx.fill();

  // Purfling (black-white-black decorative inlay)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner purfling line
  ctx.save();
  ctx.scale(0.94, 0.94);
  ctx.strokeStyle = "rgba(200, 180, 140, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -85 * s);
  ctx.bezierCurveTo(25 * s, -85 * s, 42 * s, -78 * s, 48 * s, -65 * s);
  ctx.bezierCurveTo(52 * s, -55 * s, 50 * s, -42 * s, 45 * s, -30 * s);
  ctx.bezierCurveTo(38 * s, -15 * s, 32 * s, 0, 32 * s, 10 * s);
  ctx.bezierCurveTo(32 * s, 20 * s, 38 * s, 35 * s, 48 * s, 50 * s);
  ctx.bezierCurveTo(58 * s, 65 * s, 58 * s, 82 * s, 50 * s, 92 * s);
  ctx.bezierCurveTo(42 * s, 100 * s, 25 * s, 105 * s, 0, 105 * s);
  ctx.bezierCurveTo(-25 * s, 105 * s, -42 * s, 100 * s, -50 * s, 92 * s);
  ctx.bezierCurveTo(-58 * s, 82 * s, -58 * s, 65 * s, -48 * s, 50 * s);
  ctx.bezierCurveTo(-38 * s, 35 * s, -32 * s, 20 * s, -32 * s, 10 * s);
  ctx.bezierCurveTo(-32 * s, 0, -38 * s, -15 * s, -45 * s, -30 * s);
  ctx.bezierCurveTo(-50 * s, -42 * s, -52 * s, -55 * s, -48 * s, -65 * s);
  ctx.bezierCurveTo(-42 * s, -78 * s, -25 * s, -85 * s, 0, -85 * s);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // === F-HOLES - Realistic italic f shape ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  [-1, 1].forEach((side) => {
    // Upper circle (nock)
    ctx.beginPath();
    ctx.arc(side * 14 * s, -22 * s, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Upper wing
    ctx.beginPath();
    ctx.moveTo(side * 12 * s, -18 * s);
    ctx.bezierCurveTo(side * 8 * s, -15 * s, side * 6 * s, -12 * s, side * 8 * s, -8 * s);
    ctx.stroke();

    // Main f-curve (the long S-shape)
    ctx.beginPath();
    ctx.moveTo(side * 14 * s, -18 * s);
    ctx.bezierCurveTo(side * 18 * s, -8 * s, side * 20 * s, 5 * s, side * 18 * s, 20 * s);
    ctx.bezierCurveTo(side * 16 * s, 35 * s, side * 14 * s, 45 * s, side * 16 * s, 52 * s);
    ctx.stroke();

    // Lower wing
    ctx.beginPath();
    ctx.moveTo(side * 18 * s, 48 * s);
    ctx.bezierCurveTo(side * 22 * s, 52 * s, side * 24 * s, 55 * s, side * 22 * s, 58 * s);
    ctx.stroke();

    // Lower circle (nock)
    ctx.beginPath();
    ctx.arc(side * 16 * s, 56 * s, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Center notches (the horizontal lines in real f-holes)
    ctx.beginPath();
    ctx.moveTo(side * 15 * s, 15 * s);
    ctx.lineTo(side * 19 * s, 17 * s);
    ctx.stroke();
  });

  // === BRIDGE - Realistic arched shape ===
  ctx.fillStyle = "#E8DCC8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  // Left foot
  ctx.moveTo(-18 * s, 62 * s);
  ctx.lineTo(-16 * s, 52 * s);
  // Left cutout
  ctx.bezierCurveTo(-14 * s, 48 * s, -10 * s, 46 * s, -8 * s, 48 * s);
  ctx.lineTo(-6 * s, 52 * s);
  // Heart cutout left
  ctx.bezierCurveTo(-4 * s, 50 * s, -2 * s, 48 * s, 0, 48 * s);
  // Heart cutout right
  ctx.bezierCurveTo(2 * s, 48 * s, 4 * s, 50 * s, 6 * s, 52 * s);
  ctx.lineTo(8 * s, 48 * s);
  // Right cutout
  ctx.bezierCurveTo(10 * s, 46 * s, 14 * s, 48 * s, 16 * s, 52 * s);
  // Right foot
  ctx.lineTo(18 * s, 62 * s);
  ctx.lineTo(-18 * s, 62 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(-9 * s, 72 * s);
  ctx.lineTo(9 * s, 72 * s);
  ctx.bezierCurveTo(10 * s, 80 * s, 8 * s, 95 * s, 6 * s, 98 * s);
  ctx.lineTo(-6 * s, 98 * s);
  ctx.bezierCurveTo(-8 * s, 95 * s, -10 * s, 80 * s, -9 * s, 72 * s);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#C0C0C0";
  [-6, -2, 2, 6].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x * s, 78 * s, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Tailgut
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 98 * s);
  ctx.lineTo(0, 103 * s);
  ctx.stroke();

  // Saddle
  ctx.fillStyle = "#1a0a00";
  ctx.fillRect(-8 * s, 103 * s, 16 * s, 3);

  // === NECK ===
  ctx.fillStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.beginPath();
  ctx.moveTo(-7 * s, -85 * s);
  ctx.lineTo(7 * s, -85 * s);
  ctx.lineTo(6 * s, -165 * s);
  ctx.lineTo(-6 * s, -165 * s);
  ctx.closePath();
  ctx.fill();

  // Neck edge highlight
  ctx.strokeStyle = "rgba(255, 220, 180, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-6 * s, -85 * s);
  ctx.lineTo(-5 * s, -165 * s);
  ctx.stroke();

  // === FINGERBOARD (ebony - black) ===
  ctx.fillStyle = "#0a0500";
  ctx.beginPath();
  ctx.moveTo(-8 * s, -85 * s);
  ctx.lineTo(8 * s, -85 * s);
  ctx.bezierCurveTo(8 * s, -100 * s, 7 * s, -140 * s, 6 * s, -158 * s);
  ctx.lineTo(-6 * s, -158 * s);
  ctx.bezierCurveTo(-7 * s, -140 * s, -8 * s, -100 * s, -8 * s, -85 * s);
  ctx.closePath();
  ctx.fill();

  // Fingerboard shine
  const fbShine = ctx.createLinearGradient(-8 * s, 0, 8 * s, 0);
  fbShine.addColorStop(0, "rgba(60, 60, 60, 0.3)");
  fbShine.addColorStop(0.3, "rgba(100, 100, 100, 0.2)");
  fbShine.addColorStop(0.7, "rgba(40, 40, 40, 0.1)");
  fbShine.addColorStop(1, "rgba(30, 30, 30, 0.3)");
  ctx.fillStyle = fbShine;
  ctx.fill();

  // Nut
  ctx.fillStyle = "#F5F5DC";
  ctx.fillRect(-6 * s, -158 * s, 12 * s, 3);

  // === PEGBOX ===
  ctx.fillStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.beginPath();
  ctx.moveTo(-6 * s, -158 * s);
  ctx.lineTo(-7 * s, -185 * s);
  ctx.lineTo(7 * s, -185 * s);
  ctx.lineTo(6 * s, -158 * s);
  ctx.closePath();
  ctx.fill();

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.beginPath();
  ctx.moveTo(-4 * s, -162 * s);
  ctx.lineTo(-5 * s, -180 * s);
  ctx.lineTo(5 * s, -180 * s);
  ctx.lineTo(4 * s, -162 * s);
  ctx.closePath();
  ctx.fill();

  // === SCROLL - Spiral shape ===
  ctx.strokeStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.lineWidth = 7 * s;
  ctx.lineCap = "round";

  // Spiral
  ctx.beginPath();
  ctx.moveTo(0, -185 * s);
  ctx.bezierCurveTo(-5 * s, -190 * s, -12 * s, -192 * s, -14 * s, -197 * s);
  ctx.bezierCurveTo(-16 * s, -202 * s, -14 * s, -208 * s, -8 * s, -210 * s);
  ctx.bezierCurveTo(-2 * s, -212 * s, 4 * s, -210 * s, 6 * s, -205 * s);
  ctx.bezierCurveTo(8 * s, -200 * s, 5 * s, -196 * s, 0, -195 * s);
  ctx.stroke();

  // Scroll eye (center of spiral)
  ctx.fillStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.beginPath();
  ctx.arc(-2 * s, -202 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = "#1a0800";
  const pegPositions = [
    { x: -12, y: -175 }, { x: -12, y: -167 },
    { x: 12, y: -173 }, { x: 12, y: -165 }
  ];
  pegPositions.forEach((p) => {
    // Peg shaft
    ctx.beginPath();
    ctx.ellipse(p.x * s, p.y * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Peg head
    ctx.beginPath();
    ctx.arc((p.x + (p.x > 0 ? 5 : -5)) * s, p.y * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  });

  // === CHIN REST ===
  ctx.fillStyle = "#1a0800";
  ctx.beginPath();
  ctx.ellipse(-32 * s, 88 * s, 18 * s, 12 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Chin rest clamp
  ctx.fillStyle = "#808080";
  ctx.beginPath();
  ctx.arc(-20 * s, 95 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();

  // === STRINGS ===
  const stringPositions = [-4.5, -1.5, 1.5, 4.5];
  const stringThickness = [0.6, 0.7, 0.9, 1.1]; // G, D, A, E (thickest to thinnest reversed for visual)
  const stringColors = ["#D4AF37", "#C0C0C0", "#C0C0C0", "#E8E8E8"]; // G is wound (gold), others silver

  stringPositions.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[3 - i];
    ctx.beginPath();

    // String path from pegbox to tailpiece
    const startX = x * 0.4 * s;
    const endX = x * s;

    ctx.moveTo(startX, -155 * s);
    for (let y = -155; y <= 70; y += 4) {
      const progress = (y + 155) / 225;
      const currentX = startX + (endX - startX) * progress;
      const wave = Math.sin((y + time * 30) * 0.12) * vib * 0.3;
      ctx.lineTo(currentX + wave, y * s);
    }
    ctx.stroke();
  });
}

function drawClassicCello(
  ctx: CanvasRenderingContext2D,
  time: number,
  state: InstrumentState
) {
  // === BODY - Accurate cello proportions ===
  ctx.beginPath();

  // Start at top center
  ctx.moveTo(0, -115);

  // Upper bout - right (slightly narrower than lower bout)
  ctx.bezierCurveTo(35, -115, 52, -100, 58, -80);
  ctx.bezierCurveTo(62, -65, 60, -48, 52, -32);

  // C-bout right (deeper waist for cello)
  ctx.bezierCurveTo(44, -15, 38, 5, 38, 18);
  ctx.bezierCurveTo(38, 32, 44, 50, 56, 68);

  // Lower bout right (larger, rounder)
  ctx.bezierCurveTo(68, 88, 70, 110, 60, 128);
  ctx.bezierCurveTo(50, 142, 28, 150, 0, 150);

  // Lower bout left
  ctx.bezierCurveTo(-28, 150, -50, 142, -60, 128);
  ctx.bezierCurveTo(-70, 110, -68, 88, -56, 68);

  // C-bout left
  ctx.bezierCurveTo(-44, 50, -38, 32, -38, 18);
  ctx.bezierCurveTo(-38, 5, -44, -15, -52, -32);

  // Upper bout left
  ctx.bezierCurveTo(-60, -48, -62, -65, -58, -80);
  ctx.bezierCurveTo(-52, -100, -35, -115, 0, -115);

  ctx.closePath();

  // Wood base - rich cello amber color
  ctx.fillStyle = "#C67B30";
  ctx.fill();

  // Wood grain effect
  const grainGrad = ctx.createLinearGradient(-60, -100, 60, 140);
  grainGrad.addColorStop(0, "rgba(200, 140, 70, 0.3)");
  grainGrad.addColorStop(0.15, "rgba(140, 85, 40, 0.2)");
  grainGrad.addColorStop(0.3, "rgba(180, 120, 60, 0.25)");
  grainGrad.addColorStop(0.5, "rgba(120, 70, 35, 0.2)");
  grainGrad.addColorStop(0.7, "rgba(160, 100, 50, 0.25)");
  grainGrad.addColorStop(0.85, "rgba(100, 55, 25, 0.2)");
  grainGrad.addColorStop(1, "rgba(80, 45, 20, 0.3)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine (top-left)
  const varnishShine = ctx.createRadialGradient(-20, -70, 0, -15, -40, 90);
  varnishShine.addColorStop(0, "rgba(255, 240, 200, 0.35)");
  varnishShine.addColorStop(0.3, "rgba(255, 220, 180, 0.15)");
  varnishShine.addColorStop(0.7, "rgba(200, 150, 100, 0.05)");
  varnishShine.addColorStop(1, "transparent");
  ctx.fillStyle = varnishShine;
  ctx.fill();

  // Edge shadow
  const edgeShadow = ctx.createRadialGradient(0, 20, 40, 0, 20, 100);
  edgeShadow.addColorStop(0, "transparent");
  edgeShadow.addColorStop(0.7, "transparent");
  edgeShadow.addColorStop(1, "rgba(40, 20, 5, 0.4)");
  ctx.fillStyle = edgeShadow;
  ctx.fill();

  // Purfling (edge outline)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner purfling
  ctx.save();
  ctx.scale(0.94, 0.94);
  ctx.strokeStyle = "rgba(200, 180, 140, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -115);
  ctx.bezierCurveTo(35, -115, 52, -100, 58, -80);
  ctx.bezierCurveTo(62, -65, 60, -48, 52, -32);
  ctx.bezierCurveTo(44, -15, 38, 5, 38, 18);
  ctx.bezierCurveTo(38, 32, 44, 50, 56, 68);
  ctx.bezierCurveTo(68, 88, 70, 110, 60, 128);
  ctx.bezierCurveTo(50, 142, 28, 150, 0, 150);
  ctx.bezierCurveTo(-28, 150, -50, 142, -60, 128);
  ctx.bezierCurveTo(-70, 110, -68, 88, -56, 68);
  ctx.bezierCurveTo(-44, 50, -38, 32, -38, 18);
  ctx.bezierCurveTo(-38, 5, -44, -15, -52, -32);
  ctx.bezierCurveTo(-60, -48, -62, -65, -58, -80);
  ctx.bezierCurveTo(-52, -100, -35, -115, 0, -115);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // === F-HOLES - Realistic shape ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  [-1, 1].forEach((side) => {
    // Upper nock
    ctx.beginPath();
    ctx.arc(side * 18, -28, 3, 0, Math.PI * 2);
    ctx.fill();

    // Upper wing
    ctx.beginPath();
    ctx.moveTo(side * 15, -23);
    ctx.bezierCurveTo(side * 10, -18, side * 8, -14, side * 10, -8);
    ctx.stroke();

    // Main S-curve
    ctx.beginPath();
    ctx.moveTo(side * 18, -23);
    ctx.bezierCurveTo(side * 24, -10, side * 26, 15, side * 24, 35);
    ctx.bezierCurveTo(side * 22, 52, side * 18, 65, side * 20, 75);
    ctx.stroke();

    // Lower wing
    ctx.beginPath();
    ctx.moveTo(side * 23, 70);
    ctx.bezierCurveTo(side * 28, 75, side * 30, 80, side * 28, 84);
    ctx.stroke();

    // Lower nock
    ctx.beginPath();
    ctx.arc(side * 20, 80, 3, 0, Math.PI * 2);
    ctx.fill();

    // Center notch
    ctx.beginPath();
    ctx.moveTo(side * 20, 25);
    ctx.lineTo(side * 25, 27);
    ctx.stroke();
  });

  // === BRIDGE ===
  ctx.fillStyle = "#E8DCC8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  // Left foot
  ctx.moveTo(-24, 90);
  ctx.lineTo(-22, 78);
  // Left arch cutout
  ctx.bezierCurveTo(-18, 72, -12, 70, -8, 74);
  ctx.lineTo(-6, 78);
  // Center heart cutout
  ctx.bezierCurveTo(-4, 75, -2, 73, 0, 73);
  ctx.bezierCurveTo(2, 73, 4, 75, 6, 78);
  ctx.lineTo(8, 74);
  // Right arch cutout
  ctx.bezierCurveTo(12, 70, 18, 72, 22, 78);
  // Right foot
  ctx.lineTo(24, 90);
  ctx.lineTo(-24, 90);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(-12, 100);
  ctx.lineTo(12, 100);
  ctx.bezierCurveTo(14, 115, 10, 138, 8, 142);
  ctx.lineTo(-8, 142);
  ctx.bezierCurveTo(-10, 138, -14, 115, -12, 100);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#C0C0C0";
  [-7, -2.5, 2.5, 7].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 108, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Tailgut
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 142);
  ctx.lineTo(0, 148);
  ctx.stroke();

  // Saddle
  ctx.fillStyle = "#1a0a00";
  ctx.fillRect(-10, 148, 20, 4);

  // === NECK ===
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.moveTo(-9, -115);
  ctx.lineTo(9, -115);
  ctx.lineTo(8, -210);
  ctx.lineTo(-8, -210);
  ctx.closePath();
  ctx.fill();

  // Neck edge highlight
  ctx.strokeStyle = "rgba(255, 220, 180, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, -115);
  ctx.lineTo(-7, -210);
  ctx.stroke();

  // === FINGERBOARD ===
  ctx.fillStyle = "#0a0500";
  ctx.beginPath();
  ctx.moveTo(-10, -115);
  ctx.lineTo(10, -115);
  ctx.bezierCurveTo(10, -140, 9, -180, 8, -202);
  ctx.lineTo(-8, -202);
  ctx.bezierCurveTo(-9, -180, -10, -140, -10, -115);
  ctx.closePath();
  ctx.fill();

  // Fingerboard shine
  const fbShine = ctx.createLinearGradient(-10, 0, 10, 0);
  fbShine.addColorStop(0, "rgba(60, 60, 60, 0.3)");
  fbShine.addColorStop(0.3, "rgba(100, 100, 100, 0.2)");
  fbShine.addColorStop(0.7, "rgba(40, 40, 40, 0.1)");
  fbShine.addColorStop(1, "rgba(30, 30, 30, 0.3)");
  ctx.fillStyle = fbShine;
  ctx.fill();

  // Nut
  ctx.fillStyle = "#F5F5DC";
  ctx.fillRect(-8, -202, 16, 4);

  // === PEGBOX ===
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.moveTo(-8, -202);
  ctx.lineTo(-9, -235);
  ctx.lineTo(9, -235);
  ctx.lineTo(8, -202);
  ctx.closePath();
  ctx.fill();

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.beginPath();
  ctx.moveTo(-5, -206);
  ctx.lineTo(-6, -230);
  ctx.lineTo(6, -230);
  ctx.lineTo(5, -206);
  ctx.closePath();
  ctx.fill();

  // === SCROLL ===
  ctx.strokeStyle = "#9A6B3A";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";

  // Spiral
  ctx.beginPath();
  ctx.moveTo(0, -235);
  ctx.bezierCurveTo(-6, -242, -15, -245, -18, -252);
  ctx.bezierCurveTo(-21, -260, -18, -268, -10, -272);
  ctx.bezierCurveTo(-2, -275, 6, -272, 8, -265);
  ctx.bezierCurveTo(10, -258, 6, -252, 0, -250);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.arc(-3, -260, 5, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = "#1a0800";
  const pegPos = [
    { x: -15, y: -225 }, { x: -15, y: -215 },
    { x: 15, y: -222 }, { x: 15, y: -212 }
  ];
  pegPos.forEach((p) => {
    // Peg shaft
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Peg head
    ctx.beginPath();
    ctx.arc(p.x + (p.x > 0 ? 6 : -6), p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // === ENDPIN ===
  // Endpin collar
  ctx.fillStyle = "#404040";
  ctx.beginPath();
  ctx.ellipse(0, 152, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Endpin rod
  ctx.strokeStyle = "#A0A0A0";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 152);
  ctx.lineTo(0, 200);
  ctx.stroke();

  // Endpin tip
  ctx.fillStyle = "#505050";
  ctx.beginPath();
  ctx.moveTo(-3, 200);
  ctx.lineTo(3, 200);
  ctx.lineTo(0, 208);
  ctx.closePath();
  ctx.fill();

  // === STRINGS ===
  const stringPositions = [-6, -2, 2, 6];
  const stringThickness = [1.4, 1.2, 1.0, 0.8]; // C, G, D, A
  const stringColors = ["#D4AF37", "#D4AF37", "#C0C0C0", "#E8E8E8"];

  stringPositions.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.4;
    const endX = x;

    ctx.moveTo(startX, -200);
    for (let y = -200; y <= 98; y += 5) {
      const progress = (y + 200) / 298;
      const currentX = startX + (endX - startX) * progress;
      const wave = Math.sin((y + time * 25) * 0.1) * vib * 0.5;
      ctx.lineTo(currentX + wave, y);
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
