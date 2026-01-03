"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetCanvasProps {
  className?: string;
}

// Open string notes: Cello-G(Sol), Viola-D(Re), Violin2-A(La), Violin1-E(Mi)
const INSTRUMENT_SOUNDS = {
  violin1: {
    // E5 (Mi) - highest open string
    frequencies: [659.25, 493.88, 392, 329.63],
    duration: 0.5,
  },
  violin2: {
    // A4 (La) - second highest open string
    frequencies: [440, 329.63, 261.63, 220],
    duration: 0.5,
  },
  viola: {
    // D4 (Re) - viola characteristic note
    frequencies: [293.66, 220, 174.61, 146.83],
    duration: 0.6,
  },
  cello: {
    // G3 (Sol) - cello characteristic deep note
    frequencies: [196, 146.83, 110, 98],
    duration: 0.7,
  },
};

interface InstrumentState {
  hover: boolean;
  sway: number;
  stringVibration: number[];
}

// Color palette
const COLORS = {
  stage: {
    floor: "#1a0a05",
    floorHighlight: "#2d1810",
    spotlight: "rgba(255, 215, 150, 0.15)",
    ambient: "rgba(101, 0, 11, 0.1)",
  },
  wood: {
    light: "#C4813A",
    medium: "#8B4513",
    dark: "#5D2906",
    varnish: "#A0522D",
  },
  accent: {
    gold: "#D4AF37",
    silver: "#C0C0C0",
    rosewood: "#65000B",
    ebony: "#1a0a00",
  },
};

export default function StringQuartetCanvas({
  className = "",
}: StringQuartetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hoveredInstrument, setHoveredInstrument] = useState<string | null>(null);
  const prevHoveredRef = useRef<string | null>(null);
  const audioInitializedRef = useRef(false);

  const instrumentStates = useRef<Record<string, InstrumentState>>({
    violin1: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
    violin2: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
    viola: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
    cello: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
  });

  // Play instrument-specific sound
  const playInstrumentSound = useCallback(async (instrumentName: string) => {
    if (!audioInitializedRef.current) {
      await audioManager.init();
      audioInitializedRef.current = true;
    }

    if (audioManager.isMuted()) return;

    const sound = INSTRUMENT_SOUNDS[instrumentName as keyof typeof INSTRUMENT_SOUNDS];
    if (!sound) return;

    // Play a chord of the instrument's characteristic frequencies
    const ctx = (audioManager as any).audioContext;
    if (!ctx) return;

    // Ensure audio context is running
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Play multiple notes in a subtle arpeggio
    sound.frequencies.forEach((freq, i) => {
      setTimeout(() => {
        playPizzicatoNote(ctx, freq, sound.duration, 0.15 - i * 0.02);
      }, i * 50); // Slight delay between notes for arpeggio effect
    });
  }, []);

  // Trigger sound when hovering over a new instrument
  useEffect(() => {
    if (hoveredInstrument && hoveredInstrument !== prevHoveredRef.current) {
      playInstrumentSound(hoveredInstrument);
    }
    prevHoveredRef.current = hoveredInstrument;
  }, [hoveredInstrument, playInstrumentSound]);

  // Instrument positions (relative to canvas center)
  // Real proportions: Violin 356mm, Viola 406mm (1.14x), Cello 750mm (2.1x)
  const getInstrumentPositions = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 800;

    return {
      violin1: { x: centerX - 200 * scale, y: centerY - 50 * scale, scale: scale * 0.7, rotation: -0.15 },
      violin2: { x: centerX + 200 * scale, y: centerY - 50 * scale, scale: scale * 0.7, rotation: 0.15 },
      viola: { x: centerX - 70 * scale, y: centerY + 30 * scale, scale: scale * 0.7, rotation: -0.1 },
      cello: { x: centerX + 100 * scale, y: centerY + 80 * scale, scale: scale * 1.1, rotation: 0.05 },
    };
  }, []);

  const drawStage = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      // Stage floor gradient
      const floorGradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
      floorGradient.addColorStop(0, COLORS.stage.floorHighlight);
      floorGradient.addColorStop(1, COLORS.stage.floor);
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, height * 0.55, width, height * 0.45);

      // Floor reflection lines
      ctx.strokeStyle = "rgba(255, 215, 150, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const y = height * 0.6 + i * 30;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Spotlights
      const positions = getInstrumentPositions(width, height);
      Object.entries(positions).forEach(([name, pos]) => {
        const isHovered = instrumentStates.current[name]?.hover;
        const intensity = isHovered ? 0.25 : 0.12;
        const pulseIntensity = Math.sin(time * 2 + Object.keys(positions).indexOf(name)) * 0.03;

        const spotlight = ctx.createRadialGradient(
          pos.x,
          pos.y - 100,
          0,
          pos.x,
          pos.y + 50,
          200 * pos.scale
        );
        spotlight.addColorStop(0, `rgba(255, 215, 150, ${intensity + pulseIntensity})`);
        spotlight.addColorStop(0.5, `rgba(255, 200, 130, ${(intensity + pulseIntensity) * 0.5})`);
        spotlight.addColorStop(1, "rgba(255, 200, 130, 0)");

        ctx.fillStyle = spotlight;
        ctx.fillRect(0, 0, width, height);
      });

      // Ambient rosewood glow
      const ambientGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        width * 0.6
      );
      ambientGlow.addColorStop(0, "rgba(101, 0, 11, 0.08)");
      ambientGlow.addColorStop(1, "rgba(101, 0, 11, 0)");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);
    },
    [getInstrumentPositions]
  );

  const drawViolin = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      rotation: number,
      state: InstrumentState,
      time: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + Math.sin(time * 1.5) * 0.02 * (state.hover ? 2 : 1));
      ctx.scale(scale, scale);

      // Shadow
      ctx.save();
      ctx.translate(8, 12);
      ctx.globalAlpha = 0.3;
      drawViolinBody(ctx, "#000");
      ctx.restore();

      // Body
      drawViolinBody(ctx, COLORS.wood.medium);
      drawViolinDetails(ctx, state, time);
      drawViolinStrings(ctx, state, time);

      ctx.restore();
    },
    []
  );

  const drawViola = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      rotation: number,
      state: InstrumentState,
      time: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + Math.sin(time * 1.3) * 0.015 * (state.hover ? 2 : 1));
      ctx.scale(scale, scale);

      // Shadow
      ctx.save();
      ctx.translate(9, 13);
      ctx.globalAlpha = 0.28;
      drawViolaBody(ctx, "#000");
      ctx.restore();

      // Body with darker viola tone
      drawViolaBody(ctx, COLORS.wood.dark);
      drawViolaDetails(ctx, state, time);
      drawViolaStrings(ctx, state, time);

      ctx.restore();
    },
    []
  );

  const drawCello = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      rotation: number,
      state: InstrumentState,
      time: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + Math.sin(time * 0.8) * 0.01 * (state.hover ? 2 : 1));
      ctx.scale(scale, scale);

      // Shadow
      ctx.save();
      ctx.translate(10, 15);
      ctx.globalAlpha = 0.25;
      drawCelloBody(ctx, "#000");
      ctx.restore();

      // Body
      drawCelloBody(ctx, COLORS.wood.varnish);
      drawCelloDetails(ctx, state, time);
      drawCelloStrings(ctx, state, time);

      ctx.restore();
    },
    []
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "#0a0304");
      bgGradient.addColorStop(0.5, "#150808");
      bgGradient.addColorStop(1, "#0a0304");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stage
      drawStage(ctx, width, height, time);

      // Get positions
      const positions = getInstrumentPositions(width, height);

      // Draw instruments (back to front for proper layering)
      // Violin 1 (left back)
      drawViolin(
        ctx,
        positions.violin1.x,
        positions.violin1.y,
        positions.violin1.scale,
        positions.violin1.rotation,
        instrumentStates.current.violin1,
        time
      );

      // Violin 2 (right back)
      drawViolin(
        ctx,
        positions.violin2.x,
        positions.violin2.y,
        positions.violin2.scale,
        positions.violin2.rotation,
        instrumentStates.current.violin2,
        time
      );

      // Viola (center left)
      drawViola(
        ctx,
        positions.viola.x,
        positions.viola.y,
        positions.viola.scale,
        positions.viola.rotation,
        instrumentStates.current.viola,
        time
      );

      // Cello (center right, front)
      drawCello(
        ctx,
        positions.cello.x,
        positions.cello.y,
        positions.cello.scale,
        positions.cello.rotation,
        instrumentStates.current.cello,
        time
      );

      // Draw instrument labels on hover
      if (hoveredInstrument) {
        const pos = positions[hoveredInstrument as keyof typeof positions];
        const labels: Record<string, string> = {
          violin1: "제1 바이올린",
          violin2: "제2 바이올린",
          viola: "비올라",
          cello: "첼로",
        };

        ctx.save();
        ctx.font = "bold 14px 'Playfair Display', serif";
        ctx.fillStyle = COLORS.accent.gold;
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 4;
        ctx.fillText(labels[hoveredInstrument], pos.x, pos.y - 120 * pos.scale);
        ctx.restore();
      }
    },
    [drawStage, drawViolin, drawViola, drawCello, getInstrumentPositions, hoveredInstrument]
  );

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
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      // Check hover on instruments
      const positions = getInstrumentPositions(rect.width, rect.height);
      let hovered: string | null = null;

      Object.entries(positions).forEach(([name, pos]) => {
        const dx = mouseRef.current.x - pos.x;
        const dy = mouseRef.current.y - pos.y;
        const hitRadius = name === "cello" ? 100 * pos.scale : 70 * pos.scale;
        const distance = Math.sqrt(dx * dx + dy * dy);

        instrumentStates.current[name].hover = distance < hitRadius;
        if (distance < hitRadius) {
          hovered = name;
        }
      });

      setHoveredInstrument(hovered);
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;

      // Update string vibrations
      Object.values(instrumentStates.current).forEach((state) => {
        state.stringVibration = state.stringVibration.map((v, i) =>
          state.hover ? Math.sin(timeRef.current * (10 + i * 2)) * 3 : v * 0.95
        );
      });

      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draw, getInstrumentPositions]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full min-h-[500px] cursor-pointer ${className}`}
      style={{ touchAction: "none" }}
    />
  );
}

// Helper functions for drawing instrument parts

function drawViolinBody(ctx: CanvasRenderingContext2D, color: string) {
  // Four Circles Method - violin hourglass shape
  // Upper bout: 80% of lower bout width
  // C-bout (waist): 55% of lower bout width
  // Lower bout: largest, with rounded bottom
  // Body height: ~180px, lower bout half-width: 52, upper: 42, waist: 28
  ctx.fillStyle = color;
  ctx.beginPath();

  // Start from top center
  ctx.moveTo(0, -85);

  // === RIGHT SIDE ===
  // Upper bout - rounded arc (center around y=-55, radius ~35)
  ctx.bezierCurveTo(25, -85, 40, -75, 44, -58);
  ctx.bezierCurveTo(46, -45, 44, -32, 38, -22);

  // Upper corner - transition to C-bout
  ctx.bezierCurveTo(34, -15, 30, -8, 28, 0);

  // C-bout (waist) - inward curve
  ctx.bezierCurveTo(26, 8, 26, 16, 28, 24);

  // Lower corner - transition to lower bout
  ctx.bezierCurveTo(32, 35, 40, 48, 50, 58);

  // Lower bout - rounded arc (center around y=75, radius ~45)
  ctx.bezierCurveTo(54, 65, 56, 75, 54, 85);
  ctx.bezierCurveTo(52, 92, 45, 98, 35, 102);

  // Bottom curve - rounded, not flat
  ctx.bezierCurveTo(22, 106, 10, 108, 0, 108);

  // === LEFT SIDE (mirror) ===
  // Bottom curve
  ctx.bezierCurveTo(-10, 108, -22, 106, -35, 102);
  ctx.bezierCurveTo(-45, 98, -52, 92, -54, 85);

  // Lower bout
  ctx.bezierCurveTo(-56, 75, -54, 65, -50, 58);

  // Lower corner
  ctx.bezierCurveTo(-40, 48, -32, 35, -28, 24);

  // C-bout (waist)
  ctx.bezierCurveTo(-26, 16, -26, 8, -28, 0);

  // Upper corner
  ctx.bezierCurveTo(-30, -8, -34, -15, -38, -22);

  // Upper bout
  ctx.bezierCurveTo(-44, -32, -46, -45, -44, -58);
  ctx.bezierCurveTo(-40, -75, -25, -85, 0, -85);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect
  const grainGrad = ctx.createLinearGradient(-50, -80, 50, 105);
  grainGrad.addColorStop(0, "rgba(180, 120, 60, 0.2)");
  grainGrad.addColorStop(0.5, "rgba(140, 90, 45, 0.15)");
  grainGrad.addColorStop(1, "rgba(100, 60, 30, 0.2)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-15, -45, 0, -10, -25, 60);
  shine.addColorStop(0, "rgba(255, 240, 200, 0.35)");
  shine.addColorStop(0.4, "rgba(255, 220, 180, 0.12)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Purfling (outline)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

function drawViolaBody(ctx: CanvasRenderingContext2D, color: string) {
  // Viola - 16" (406mm) body, approximately 1.12x violin size
  // Real measurements: Upper 193mm, C-bout 131mm, Lower 236mm
  // Canvas scale: Upper ±49, C-bout ±31, Lower ±60, Height ~216px (-95 to 121)
  ctx.fillStyle = color;
  ctx.beginPath();

  // Start from top center
  ctx.moveTo(0, -95);

  // === RIGHT SIDE ===
  // Upper bout - slightly flatter than violin (viola characteristic)
  ctx.bezierCurveTo(28, -95, 45, -84, 49, -65);
  ctx.bezierCurveTo(51, -50, 49, -36, 42, -25);

  // Upper corner - transition to C-bout
  ctx.bezierCurveTo(38, -17, 34, -9, 31, 0);

  // C-bout (waist) - proportionally deeper than violin
  ctx.bezierCurveTo(29, 9, 29, 18, 31, 27);

  // Lower corner - transition to lower bout
  ctx.bezierCurveTo(36, 40, 46, 55, 56, 68);

  // Lower bout - slightly wider relative to upper than violin
  ctx.bezierCurveTo(60, 78, 62, 90, 60, 102);
  ctx.bezierCurveTo(58, 110, 50, 116, 39, 120);

  // Bottom curve - rounded, not flat
  ctx.bezierCurveTo(24, 124, 11, 126, 0, 126);

  // === LEFT SIDE (mirror) ===
  ctx.bezierCurveTo(-11, 126, -24, 124, -39, 120);
  ctx.bezierCurveTo(-50, 116, -58, 110, -60, 102);
  ctx.bezierCurveTo(-62, 90, -60, 78, -56, 68);
  ctx.bezierCurveTo(-46, 55, -36, 40, -31, 27);
  ctx.bezierCurveTo(-29, 18, -29, 9, -31, 0);
  ctx.bezierCurveTo(-34, -9, -38, -17, -42, -25);
  ctx.bezierCurveTo(-49, -36, -51, -50, -49, -65);
  ctx.bezierCurveTo(-45, -84, -28, -95, 0, -95);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect - darker for viola
  const grainGrad = ctx.createLinearGradient(-55, -90, 55, 120);
  grainGrad.addColorStop(0, "rgba(140, 90, 50, 0.22)");
  grainGrad.addColorStop(0.5, "rgba(110, 70, 35, 0.18)");
  grainGrad.addColorStop(1, "rgba(80, 50, 25, 0.22)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-16, -50, 0, -10, -30, 70);
  shine.addColorStop(0, "rgba(255, 230, 190, 0.32)");
  shine.addColorStop(0.4, "rgba(255, 210, 170, 0.1)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Purfling (outline)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 1.9;
  ctx.stroke();
}

function drawViolaDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES - positioned in C-bout area (y=12 to y=55) ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";

  [-1, 1].forEach((side) => {
    // Upper nock (small circle)
    ctx.beginPath();
    ctx.arc(side * 14, 14, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Main f-curve (S-shape, ~40px)
    ctx.beginPath();
    ctx.moveTo(side * 14, 17);
    ctx.bezierCurveTo(side * 17, 28, side * 18, 40, side * 16, 52);
    ctx.stroke();

    // Lower nock (small circle)
    ctx.beginPath();
    ctx.arc(side * 16, 55, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Center notch (horizontal line at bridge level)
    ctx.beginPath();
    ctx.moveTo(side * 15, 35);
    ctx.lineTo(side * 18, 36);
    ctx.stroke();
  });

  // === BRIDGE - at y=60 (below f-holes) ===
  ctx.fillStyle = "#D4C4A8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-18, 70);
  ctx.lineTo(-16, 60);
  ctx.bezierCurveTo(-11, 57, -5, 56, 0, 56);
  ctx.bezierCurveTo(5, 56, 11, 57, 16, 60);
  ctx.lineTo(18, 70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-9, 76);
  ctx.lineTo(9, 76);
  ctx.lineTo(7, 110);
  ctx.lineTo(-7, 110);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#A0A0A0";
  [-5.5, -1.8, 1.8, 5.5].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 88, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // === NECK ===
  ctx.fillStyle = "#7A5C3A";
  ctx.beginPath();
  ctx.moveTo(-7, -95);
  ctx.lineTo(7, -95);
  ctx.lineTo(6, -168);
  ctx.lineTo(-6, -168);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD (ebony) ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-8, -95);
  ctx.lineTo(8, -95);
  ctx.lineTo(6, -162);
  ctx.lineTo(-6, -162);
  ctx.closePath();
  ctx.fill();

  // Nut
  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(-6, -162, 12, 2);

  // === PEGBOX ===
  ctx.fillStyle = "#7A5C3A";
  ctx.fillRect(-6, -182, 12, 18);

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.fillRect(-4, -180, 8, 14);

  // === SCROLL ===
  ctx.strokeStyle = "#7A5C3A";
  ctx.lineWidth = 6.5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -182);
  ctx.bezierCurveTo(-4, -188, -11, -192, -13, -198);
  ctx.bezierCurveTo(-15, -204, -13, -210, -8, -212);
  ctx.bezierCurveTo(-2, -214, 4, -212, 6, -206);
  ctx.bezierCurveTo(7, -200, 5, -195, 0, -194);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = "#7A5C3A";
  ctx.beginPath();
  ctx.arc(-2, -204, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  [{ x: -11, y: -177 }, { x: -11, y: -169 }, { x: 11, y: -176 }, { x: 11, y: -168 }].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // === CHIN REST ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.ellipse(-34, 85, 16, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Glow on hover
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = COLORS.accent.gold;
    ctx.shadowBlur = 22;
    ctx.restore();
  }
}

function drawViolaStrings(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  // C G D A strings (viola is tuned a 5th lower than violin)
  const stringColors = ["#D4AF37", "#D4AF37", "#C0C0C0", "#E8E8E8"]; // C,G wound (gold)
  const stringThickness = [1.2, 1.0, 0.85, 0.65];
  const stringX = [-4.5, -1.5, 1.5, 4.5];

  stringX.forEach((x, i) => {
    const vibration = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.5;
    // From nut (-160) to bridge (76)
    ctx.moveTo(startX, -160);
    for (let y = -160; y <= 76; y += 4) {
      const progress = (y + 160) / 236;
      const currentX = startX + (x - startX) * progress;
      const wave = Math.sin((y + time * 28) * 0.13) * vibration * 0.3;
      ctx.lineTo(currentX + wave, y);
    }
    ctx.stroke();
  });
}

function drawViolinDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES - positioned in C-bout area (y=10 to y=50) ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  [-1, 1].forEach((side) => {
    // Upper nock (small circle)
    ctx.beginPath();
    ctx.arc(side * 12, 12, 2, 0, Math.PI * 2);
    ctx.fill();

    // Main f-curve (S-shape, ~35px)
    ctx.beginPath();
    ctx.moveTo(side * 12, 15);
    ctx.bezierCurveTo(side * 15, 25, side * 16, 35, side * 14, 45);
    ctx.stroke();

    // Lower nock (small circle)
    ctx.beginPath();
    ctx.arc(side * 14, 48, 2, 0, Math.PI * 2);
    ctx.fill();

    // Center notch (horizontal line at bridge level)
    ctx.beginPath();
    ctx.moveTo(side * 13, 30);
    ctx.lineTo(side * 16, 31);
    ctx.stroke();
  });

  // === BRIDGE - at y=55 (below f-holes) ===
  ctx.fillStyle = "#D4C4A8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-16, 62);
  ctx.lineTo(-14, 54);
  ctx.bezierCurveTo(-10, 51, -5, 50, 0, 50);
  ctx.bezierCurveTo(5, 50, 10, 51, 14, 54);
  ctx.lineTo(16, 62);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-8, 68);
  ctx.lineTo(8, 68);
  ctx.lineTo(6, 98);
  ctx.lineTo(-6, 98);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#A0A0A0";
  [-5, -1.5, 1.5, 5].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 78, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // === NECK ===
  ctx.fillStyle = "#8B6914";
  ctx.beginPath();
  ctx.moveTo(-6, -85);
  ctx.lineTo(6, -85);
  ctx.lineTo(5, -155);
  ctx.lineTo(-5, -155);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD (ebony) ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-7, -85);
  ctx.lineTo(7, -85);
  ctx.lineTo(5, -150);
  ctx.lineTo(-5, -150);
  ctx.closePath();
  ctx.fill();

  // Nut
  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(-5, -150, 10, 2);

  // === PEGBOX ===
  ctx.fillStyle = "#8B6914";
  ctx.fillRect(-5, -170, 10, 18);

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.fillRect(-3, -168, 6, 14);

  // === SCROLL ===
  ctx.strokeStyle = "#8B6914";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -170);
  ctx.bezierCurveTo(-4, -175, -10, -178, -12, -183);
  ctx.bezierCurveTo(-14, -188, -12, -193, -7, -195);
  ctx.bezierCurveTo(-2, -196, 3, -194, 5, -190);
  ctx.bezierCurveTo(6, -186, 4, -182, 0, -181);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = "#8B6914";
  ctx.beginPath();
  ctx.arc(-2, -188, 3, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  [{ x: -10, y: -165 }, { x: -10, y: -158 }, { x: 10, y: -164 }, { x: 10, y: -157 }].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // === CHIN REST ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.ellipse(-30, 75, 14, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Glow on hover
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = COLORS.accent.gold;
    ctx.shadowBlur = 20;
    ctx.restore();
  }
}

function drawViolinStrings(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  // G D A E strings
  const stringColors = ["#D4AF37", "#C0C0C0", "#C0C0C0", "#E8E8E8"];
  const stringThickness = [1.0, 0.8, 0.7, 0.5];
  const stringX = [-4, -1.3, 1.3, 4];

  stringX.forEach((x, i) => {
    const vibration = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.5;
    // From nut (-148) to bridge (68)
    ctx.moveTo(startX, -148);
    for (let y = -148; y <= 68; y += 4) {
      const progress = (y + 148) / 216;
      const currentX = startX + (x - startX) * progress;
      const wave = Math.sin((y + time * 30) * 0.15) * vibration * 0.25;
      ctx.lineTo(currentX + wave, y);
    }
    ctx.stroke();
  });
}

function drawCelloBody(ctx: CanvasRenderingContext2D, color: string) {
  // Four Circles Method - cello hourglass shape
  // Upper bout: 80% of lower bout width
  // C-bout (waist): 55% of lower bout width
  // Lower bout: largest, with rounded bottom
  // Body height: ~230px, lower bout half-width: 65, upper: 52, waist: 36
  ctx.fillStyle = color;
  ctx.beginPath();

  // Start from top center
  ctx.moveTo(0, -105);

  // === RIGHT SIDE ===
  // Upper bout - rounded arc
  ctx.bezierCurveTo(30, -105, 48, -95, 54, -75);
  ctx.bezierCurveTo(56, -60, 54, -42, 46, -28);

  // Upper corner - transition to C-bout
  ctx.bezierCurveTo(42, -18, 38, -8, 36, 0);

  // C-bout (waist) - inward curve
  ctx.bezierCurveTo(34, 10, 34, 22, 36, 32);

  // Lower corner - transition to lower bout
  ctx.bezierCurveTo(42, 48, 52, 65, 62, 78);

  // Lower bout - rounded arc
  ctx.bezierCurveTo(66, 88, 68, 100, 66, 112);
  ctx.bezierCurveTo(62, 122, 52, 130, 40, 136);

  // Bottom curve - rounded, not flat
  ctx.bezierCurveTo(25, 142, 12, 145, 0, 145);

  // === LEFT SIDE (mirror) ===
  // Bottom curve
  ctx.bezierCurveTo(-12, 145, -25, 142, -40, 136);
  ctx.bezierCurveTo(-52, 130, -62, 122, -66, 112);

  // Lower bout
  ctx.bezierCurveTo(-68, 100, -66, 88, -62, 78);

  // Lower corner
  ctx.bezierCurveTo(-52, 65, -42, 48, -36, 32);

  // C-bout (waist)
  ctx.bezierCurveTo(-34, 22, -34, 10, -36, 0);

  // Upper corner
  ctx.bezierCurveTo(-38, -8, -42, -18, -46, -28);

  // Upper bout
  ctx.bezierCurveTo(-54, -42, -56, -60, -54, -75);
  ctx.bezierCurveTo(-48, -95, -30, -105, 0, -105);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect
  const grainGrad = ctx.createLinearGradient(-60, -100, 60, 140);
  grainGrad.addColorStop(0, "rgba(180, 120, 60, 0.2)");
  grainGrad.addColorStop(0.5, "rgba(140, 90, 45, 0.15)");
  grainGrad.addColorStop(1, "rgba(100, 60, 30, 0.2)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-18, -60, 0, -12, -35, 80);
  shine.addColorStop(0, "rgba(255, 240, 200, 0.35)");
  shine.addColorStop(0.4, "rgba(255, 220, 180, 0.12)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Purfling (outline)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCelloDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES - positioned in C-bout area (y=15 to y=60) ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  [-1, 1].forEach((side) => {
    // Upper nock
    ctx.beginPath();
    ctx.arc(side * 16, 18, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Main f-curve (~45px)
    ctx.beginPath();
    ctx.moveTo(side * 16, 22);
    ctx.bezierCurveTo(side * 20, 35, side * 21, 50, side * 18, 62);
    ctx.stroke();

    // Lower nock
    ctx.beginPath();
    ctx.arc(side * 18, 65, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Center notch
    ctx.beginPath();
    ctx.moveTo(side * 17, 42);
    ctx.lineTo(side * 21, 43);
    ctx.stroke();
  });

  // === BRIDGE - at y=72 ===
  ctx.fillStyle = "#D4C4A8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-22, 82);
  ctx.lineTo(-20, 72);
  ctx.bezierCurveTo(-14, 68, -6, 66, 0, 66);
  ctx.bezierCurveTo(6, 66, 14, 68, 20, 72);
  ctx.lineTo(22, 82);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-10, 90);
  ctx.lineTo(10, 90);
  ctx.lineTo(8, 130);
  ctx.lineTo(-8, 130);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#A0A0A0";
  [-6, -2, 2, 6].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 102, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // === NECK ===
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.moveTo(-8, -105);
  ctx.lineTo(8, -105);
  ctx.lineTo(7, -195);
  ctx.lineTo(-7, -195);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-9, -105);
  ctx.lineTo(9, -105);
  ctx.lineTo(7, -188);
  ctx.lineTo(-7, -188);
  ctx.closePath();
  ctx.fill();

  // Nut
  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(-7, -188, 14, 3);

  // === PEGBOX ===
  ctx.fillStyle = "#9A6B3A";
  ctx.fillRect(-7, -212, 14, 22);

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.fillRect(-5, -210, 10, 18);

  // === SCROLL ===
  ctx.strokeStyle = "#9A6B3A";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -212);
  ctx.bezierCurveTo(-5, -218, -12, -222, -14, -230);
  ctx.bezierCurveTo(-16, -238, -14, -245, -8, -248);
  ctx.bezierCurveTo(-2, -250, 4, -248, 6, -242);
  ctx.bezierCurveTo(8, -236, 5, -230, 0, -228);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.arc(-3, -240, 4, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  [{ x: -13, y: -205 }, { x: -13, y: -196 }, { x: 13, y: -204 }, { x: 13, y: -195 }].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // === ENDPIN (starts at body bottom y=145) ===
  // Endpin collar
  ctx.fillStyle = "#404040";
  ctx.beginPath();
  ctx.ellipse(0, 148, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Endpin rod
  ctx.strokeStyle = "#A0A0A0";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 148);
  ctx.lineTo(0, 205);
  ctx.stroke();

  // Endpin tip
  ctx.fillStyle = "#505050";
  ctx.beginPath();
  ctx.moveTo(-4, 205);
  ctx.lineTo(4, 205);
  ctx.lineTo(0, 215);
  ctx.closePath();
  ctx.fill();

  // Glow on hover
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = COLORS.accent.gold;
    ctx.shadowBlur = 25;
    ctx.restore();
  }
}

function drawCelloStrings(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  // C G D A strings (thickest to thinnest)
  const stringColors = ["#D4AF37", "#D4AF37", "#C0C0C0", "#E8E8E8"]; // C,G wound (gold)
  const stringThickness = [1.6, 1.3, 1.0, 0.8];
  const stringX = [-7, -2.5, 2.5, 7];

  stringX.forEach((x, i) => {
    const vibration = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.4;
    const endX = x;

    // From nut (-186) to tailpiece (90)
    ctx.moveTo(startX, -186);
    for (let y = -186; y <= 90; y += 5) {
      const progress = (y + 186) / 276;
      const currentX = startX + (endX - startX) * progress;
      const wave = Math.sin((y + time * 25) * 0.1) * vibration * 0.5;
      ctx.lineTo(currentX + wave, y);
    }
    ctx.stroke();
  });
}

// Helper function to play a pizzicato-like sound
function playPizzicatoNote(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Use triangle wave for warmer, string-like tone
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Pizzicato envelope - quick attack, natural decay
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Natural decay

  oscillator.start(now);
  oscillator.stop(now + duration + 0.1);
}
