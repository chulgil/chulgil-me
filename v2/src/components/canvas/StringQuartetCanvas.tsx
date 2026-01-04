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

// Real instrument proportions (based on actual measurements)
// Violin 4/4: 356mm body, Viola 16": 406mm (1.14x), Cello: 750mm (2.11x)
const INSTRUMENT_PROPORTIONS = {
  violin: {
    bodyHeight: 180,           // Base height in pixels
    upperBoutRatio: 0.472,     // 168mm / 356mm
    cBoutRatio: 0.315,         // 112mm / 356mm
    lowerBoutRatio: 0.579,     // 206mm / 356mm
    scale: 1.0,
  },
  viola: {
    bodyHeight: 205,           // 180 * 1.14
    upperBoutRatio: 0.475,     // 193mm / 406mm
    cBoutRatio: 0.323,         // 131mm / 406mm
    lowerBoutRatio: 0.581,     // 236mm / 406mm
    scale: 1.14,
  },
  cello: {
    bodyHeight: 380,           // 180 * 2.11
    upperBoutRatio: 0.456,     // 342mm / 750mm
    cBoutRatio: 0.317,         // 238mm / 750mm
    lowerBoutRatio: 0.576,     // 432mm / 750mm
    scale: 2.11,
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
  // Real proportions: Violin 356mm, Viola 406mm (1.14x), Cello 750mm (2.11x)
  const getInstrumentPositions = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    // Adjusted base scale to accommodate larger cello
    const baseScale = Math.min(width, height) / 1200;

    // Apply real proportions: violin=1.0, viola=1.14, cello=2.11
    return {
      violin1: {
        x: centerX - 220 * baseScale,
        y: centerY - 120 * baseScale,
        scale: baseScale * INSTRUMENT_PROPORTIONS.violin.scale,
        rotation: -0.12
      },
      violin2: {
        x: centerX + 220 * baseScale,
        y: centerY - 120 * baseScale,
        scale: baseScale * INSTRUMENT_PROPORTIONS.violin.scale,
        rotation: 0.12
      },
      viola: {
        x: centerX - 100 * baseScale,
        y: centerY + 20 * baseScale,
        scale: baseScale * INSTRUMENT_PROPORTIONS.viola.scale,
        rotation: -0.08
      },
      cello: {
        x: centerX + 140 * baseScale,
        y: centerY + 100 * baseScale,
        scale: baseScale * INSTRUMENT_PROPORTIONS.cello.scale,
        rotation: 0.05
      },
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
  // Real violin 4/4 proportions (356mm body)
  // Upper bout: 168mm (47%), C-bout: 112mm (31%), Lower bout: 206mm (58%)
  const H = 90;        // half-height
  const upperW = 42;   // upper bout half-width
  const cBoutW = 26;   // c-bout half-width (narrower for deeper curve)
  const lowerW = 52;   // lower bout half-width

  // Key Y positions (from center = 0)
  const upperCornerY = -H * 0.22;  // upper corner where bout meets C-bout
  const lowerCornerY = H * 0.22;   // lower corner where C-bout meets lower bout
  const maxUpperY = -H * 0.55;     // widest point of upper bout
  const maxLowerY = H * 0.55;      // widest point of lower bout

  ctx.fillStyle = color;
  ctx.beginPath();

  // Start from top center (neck end)
  ctx.moveTo(0, -H);

  // === RIGHT SIDE ===
  // Upper bout - expands from top to max width
  ctx.bezierCurveTo(upperW * 0.5, -H, upperW * 0.9, -H + 12, upperW, maxUpperY);

  // Upper bout to upper corner (smooth transition with corner point)
  ctx.bezierCurveTo(upperW, -H * 0.35, upperW * 0.75, upperCornerY, cBoutW + 8, upperCornerY);

  // C-bout - symmetric inward "C" curve
  ctx.bezierCurveTo(cBoutW, upperCornerY, cBoutW, -H * 0.08, cBoutW, 0);
  ctx.bezierCurveTo(cBoutW, H * 0.08, cBoutW, lowerCornerY, cBoutW + 8, lowerCornerY);

  // Lower corner to lower bout (symmetric with upper)
  ctx.bezierCurveTo(lowerW * 0.75, lowerCornerY, lowerW, H * 0.35, lowerW, maxLowerY);

  // Lower bout - curves inward toward bottom
  ctx.bezierCurveTo(lowerW, H * 0.68, lowerW * 0.75, H * 0.82, lowerW * 0.45, H * 0.92);

  // Bottom curve - rounded arc (not flat)
  ctx.quadraticCurveTo(lowerW * 0.2, H * 0.98, 0, H * 0.98);

  // === LEFT SIDE (mirror) ===
  ctx.quadraticCurveTo(-lowerW * 0.2, H * 0.98, -lowerW * 0.45, H * 0.92);
  ctx.bezierCurveTo(-lowerW * 0.75, H * 0.82, -lowerW, H * 0.68, -lowerW, maxLowerY);
  ctx.bezierCurveTo(-lowerW, H * 0.35, -lowerW * 0.75, lowerCornerY, -cBoutW - 8, lowerCornerY);
  ctx.bezierCurveTo(-cBoutW, lowerCornerY, -cBoutW, H * 0.08, -cBoutW, 0);
  ctx.bezierCurveTo(-cBoutW, -H * 0.08, -cBoutW, upperCornerY, -cBoutW - 8, upperCornerY);
  ctx.bezierCurveTo(-upperW * 0.75, upperCornerY, -upperW, -H * 0.35, -upperW, maxUpperY);
  ctx.bezierCurveTo(-upperW * 0.9, -H + 12, -upperW * 0.5, -H, 0, -H);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect
  const grainGrad = ctx.createLinearGradient(-lowerW, -H, lowerW, H);
  grainGrad.addColorStop(0, "rgba(180, 120, 60, 0.2)");
  grainGrad.addColorStop(0.5, "rgba(140, 90, 45, 0.15)");
  grainGrad.addColorStop(1, "rgba(100, 60, 30, 0.2)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-15, -H * 0.5, 0, -10, -H * 0.3, 60);
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
  // Real viola 16" proportions (406mm body, 1.14x violin)
  // Upper bout: 193mm (47.5%), C-bout: 131mm (32.3%), Lower bout: 236mm (58.1%)
  const H = 102;       // half-height
  const upperW = 48;   // upper bout half-width
  const cBoutW = 30;   // c-bout half-width (narrower for deeper curve)
  const lowerW = 59;   // lower bout half-width

  // Key Y positions
  const upperCornerY = -H * 0.22;
  const lowerCornerY = H * 0.22;
  const maxUpperY = -H * 0.55;
  const maxLowerY = H * 0.55;

  ctx.fillStyle = color;
  ctx.beginPath();

  // Start from top center
  ctx.moveTo(0, -H);

  // === RIGHT SIDE ===
  // Upper bout - expands from top to max width
  ctx.bezierCurveTo(upperW * 0.5, -H, upperW * 0.9, -H + 14, upperW, maxUpperY);

  // Upper bout to upper corner (smooth transition)
  ctx.bezierCurveTo(upperW, -H * 0.35, upperW * 0.75, upperCornerY, cBoutW + 10, upperCornerY);

  // C-bout - symmetric inward "C" curve
  ctx.bezierCurveTo(cBoutW, upperCornerY, cBoutW, -H * 0.08, cBoutW, 0);
  ctx.bezierCurveTo(cBoutW, H * 0.08, cBoutW, lowerCornerY, cBoutW + 10, lowerCornerY);

  // Lower corner to lower bout (symmetric)
  ctx.bezierCurveTo(lowerW * 0.75, lowerCornerY, lowerW, H * 0.35, lowerW, maxLowerY);

  // Lower bout - curves inward toward bottom
  ctx.bezierCurveTo(lowerW, H * 0.68, lowerW * 0.75, H * 0.82, lowerW * 0.45, H * 0.92);

  // Bottom curve - rounded arc
  ctx.quadraticCurveTo(lowerW * 0.2, H * 0.98, 0, H * 0.98);

  // === LEFT SIDE (mirror) ===
  ctx.quadraticCurveTo(-lowerW * 0.2, H * 0.98, -lowerW * 0.45, H * 0.92);
  ctx.bezierCurveTo(-lowerW * 0.75, H * 0.82, -lowerW, H * 0.68, -lowerW, maxLowerY);
  ctx.bezierCurveTo(-lowerW, H * 0.35, -lowerW * 0.75, lowerCornerY, -cBoutW - 10, lowerCornerY);
  ctx.bezierCurveTo(-cBoutW, lowerCornerY, -cBoutW, H * 0.08, -cBoutW, 0);
  ctx.bezierCurveTo(-cBoutW, -H * 0.08, -cBoutW, upperCornerY, -cBoutW - 10, upperCornerY);
  ctx.bezierCurveTo(-upperW * 0.75, upperCornerY, -upperW, -H * 0.35, -upperW, maxUpperY);
  ctx.bezierCurveTo(-upperW * 0.9, -H + 14, -upperW * 0.5, -H, 0, -H);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect - darker for viola
  const grainGrad = ctx.createLinearGradient(-lowerW, -H, lowerW, H);
  grainGrad.addColorStop(0, "rgba(140, 90, 50, 0.22)");
  grainGrad.addColorStop(0.5, "rgba(110, 70, 35, 0.18)");
  grainGrad.addColorStop(1, "rgba(80, 50, 25, 0.22)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-16, -H * 0.5, 0, -10, -H * 0.3, 75);
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
  // Viola body: H=102, body spans -102 to +104
  const H = 102;
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";

  const fHoleY = H * 0.12;
  const fHoleLen = H * 0.42;

  [-1, 1].forEach((side) => {
    const fHoleX = 16 * side;
    ctx.beginPath();
    ctx.arc(fHoleX, fHoleY, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(fHoleX, fHoleY + 3);
    ctx.bezierCurveTo(fHoleX + side * 3.5, fHoleY + fHoleLen * 0.4,
                      fHoleX + side * 4.5, fHoleY + fHoleLen * 0.7,
                      fHoleX + side * 2.5, fHoleY + fHoleLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(fHoleX + side * 2.5, fHoleY + fHoleLen + 3, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(fHoleX + side, fHoleY + fHoleLen * 0.5);
    ctx.lineTo(fHoleX + side * 4.5, fHoleY + fHoleLen * 0.52);
    ctx.stroke();
  });

  // === BRIDGE ===
  const bridgeY = H * 0.58;
  ctx.fillStyle = "#D4C4A8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-18, bridgeY + 10);
  ctx.lineTo(-16, bridgeY);
  ctx.bezierCurveTo(-11, bridgeY - 3, -5, bridgeY - 4, 0, bridgeY - 4);
  ctx.bezierCurveTo(5, bridgeY - 4, 11, bridgeY - 3, 16, bridgeY);
  ctx.lineTo(18, bridgeY + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  const tailY = H * 0.75;
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-9, tailY);
  ctx.lineTo(9, tailY);
  ctx.lineTo(7, tailY + 36);
  ctx.lineTo(-7, tailY + 36);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#A0A0A0";
  [-5.5, -1.8, 1.8, 5.5].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, tailY + 14, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // === NECK ===
  const neckTop = -H - 75;
  ctx.fillStyle = "#7A5C3A";
  ctx.beginPath();
  ctx.moveTo(-7, -H);
  ctx.lineTo(7, -H);
  ctx.lineTo(6, neckTop);
  ctx.lineTo(-6, neckTop);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-8, -H);
  ctx.lineTo(8, -H);
  ctx.lineTo(6, neckTop + 6);
  ctx.lineTo(-6, neckTop + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(-6, neckTop + 6, 12, 2);

  // === PEGBOX ===
  const pegboxY = neckTop - 22;
  ctx.fillStyle = "#7A5C3A";
  ctx.fillRect(-6, pegboxY, 12, 20);

  ctx.fillStyle = "#1a0800";
  ctx.fillRect(-4, pegboxY + 2, 8, 16);

  // === SCROLL ===
  ctx.strokeStyle = "#7A5C3A";
  ctx.lineWidth = 6.5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, pegboxY);
  ctx.bezierCurveTo(-4, pegboxY - 6, -11, pegboxY - 10, -13, pegboxY - 16);
  ctx.bezierCurveTo(-15, pegboxY - 22, -13, pegboxY - 28, -8, pegboxY - 30);
  ctx.bezierCurveTo(-2, pegboxY - 32, 4, pegboxY - 30, 6, pegboxY - 24);
  ctx.bezierCurveTo(7, pegboxY - 18, 5, pegboxY - 13, 0, pegboxY - 12);
  ctx.stroke();

  ctx.fillStyle = "#7A5C3A";
  ctx.beginPath();
  ctx.arc(-2, pegboxY - 22, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  [{ x: -11, y: pegboxY + 5 }, { x: -11, y: pegboxY + 13 },
   { x: 11, y: pegboxY + 6 }, { x: 11, y: pegboxY + 14 }].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // === CHIN REST ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.ellipse(-36, H * 0.82, 16, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

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
  // Viola body H=102, neck extends to -177
  const H = 102;
  const nutY = -H - 69;       // -171 (matches neckTop + 6 from ViolaDetails)
  const bridgeY = H * 0.58;   // 59 (matches bridge position)

  // C G D A strings (viola is tuned a 5th lower than violin)
  const stringColors = ["#D4AF37", "#D4AF37", "#C0C0C0", "#E8E8E8"]; // C,G wound (gold)
  const stringThickness = [1.2, 1.0, 0.85, 0.65];
  const stringX = [-5, -1.7, 1.7, 5];

  stringX.forEach((x, i) => {
    const vibration = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.45;
    ctx.moveTo(startX, nutY);
    for (let y = nutY; y <= bridgeY; y += 4) {
      const progress = (y - nutY) / (bridgeY - nutY);
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
  // Violin body: H=90, so body spans -90 to +91
  const H = 90;
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES - positioned in C-bout area (20% of body height) ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  const fHoleY = H * 0.12;  // Start around waist
  const fHoleLen = H * 0.4; // f-hole length (~22% of body)

  [-1, 1].forEach((side) => {
    const fHoleX = 14 * side;
    // Upper nock
    ctx.beginPath();
    ctx.arc(fHoleX, fHoleY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Main f-curve
    ctx.beginPath();
    ctx.moveTo(fHoleX, fHoleY + 3);
    ctx.bezierCurveTo(fHoleX + side * 3, fHoleY + fHoleLen * 0.4,
                      fHoleX + side * 4, fHoleY + fHoleLen * 0.7,
                      fHoleX + side * 2, fHoleY + fHoleLen);
    ctx.stroke();

    // Lower nock
    ctx.beginPath();
    ctx.arc(fHoleX + side * 2, fHoleY + fHoleLen + 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Center notch
    ctx.beginPath();
    ctx.moveTo(fHoleX + side, fHoleY + fHoleLen * 0.5);
    ctx.lineTo(fHoleX + side * 4, fHoleY + fHoleLen * 0.52);
    ctx.stroke();
  });

  // === BRIDGE ===
  const bridgeY = H * 0.55;
  ctx.fillStyle = "#D4C4A8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-16, bridgeY + 8);
  ctx.lineTo(-14, bridgeY);
  ctx.bezierCurveTo(-10, bridgeY - 3, -5, bridgeY - 4, 0, bridgeY - 4);
  ctx.bezierCurveTo(5, bridgeY - 4, 10, bridgeY - 3, 14, bridgeY);
  ctx.lineTo(16, bridgeY + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  const tailY = H * 0.72;
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-8, tailY);
  ctx.lineTo(8, tailY);
  ctx.lineTo(6, tailY + 32);
  ctx.lineTo(-6, tailY + 32);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#A0A0A0";
  [-5, -1.5, 1.5, 5].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, tailY + 12, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // === NECK ===
  const neckTop = -H - 70;
  ctx.fillStyle = "#8B6914";
  ctx.beginPath();
  ctx.moveTo(-6, -H);
  ctx.lineTo(6, -H);
  ctx.lineTo(5, neckTop);
  ctx.lineTo(-5, neckTop);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-7, -H);
  ctx.lineTo(7, -H);
  ctx.lineTo(5, neckTop + 5);
  ctx.lineTo(-5, neckTop + 5);
  ctx.closePath();
  ctx.fill();

  // Nut
  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(-5, neckTop + 5, 10, 2);

  // === PEGBOX ===
  const pegboxY = neckTop - 20;
  ctx.fillStyle = "#8B6914";
  ctx.fillRect(-5, pegboxY, 10, 18);

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.fillRect(-3, pegboxY + 2, 6, 14);

  // === SCROLL ===
  ctx.strokeStyle = "#8B6914";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, pegboxY);
  ctx.bezierCurveTo(-4, pegboxY - 5, -10, pegboxY - 8, -12, pegboxY - 13);
  ctx.bezierCurveTo(-14, pegboxY - 18, -12, pegboxY - 23, -7, pegboxY - 25);
  ctx.bezierCurveTo(-2, pegboxY - 26, 3, pegboxY - 24, 5, pegboxY - 20);
  ctx.bezierCurveTo(6, pegboxY - 16, 4, pegboxY - 12, 0, pegboxY - 11);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = "#8B6914";
  ctx.beginPath();
  ctx.arc(-2, pegboxY - 18, 3, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  [{ x: -10, y: pegboxY + 5 }, { x: -10, y: pegboxY + 12 },
   { x: 10, y: pegboxY + 6 }, { x: 10, y: pegboxY + 13 }].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // === CHIN REST ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.ellipse(-32, H * 0.8, 14, 9, -0.2, 0, Math.PI * 2);
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
  // Violin body H=90, neck extends to -160
  const H = 90;
  const nutY = -H - 65;     // Nut position
  const bridgeY = H * 0.55; // Bridge position

  // G D A E strings
  const stringColors = ["#D4AF37", "#C0C0C0", "#C0C0C0", "#E8E8E8"];
  const stringThickness = [1.0, 0.8, 0.7, 0.5];
  const stringX = [-4, -1.3, 1.3, 4];

  stringX.forEach((x, i) => {
    const vibration = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.4;
    ctx.moveTo(startX, nutY);
    for (let y = nutY; y <= bridgeY; y += 4) {
      const progress = (y - nutY) / (bridgeY - nutY);
      const currentX = startX + (x - startX) * progress;
      const wave = Math.sin((y + time * 30) * 0.15) * vibration * 0.25;
      ctx.lineTo(currentX + wave, y);
    }
    ctx.stroke();
  });
}

function drawCelloBody(ctx: CanvasRenderingContext2D, color: string) {
  // Real cello proportions (750mm body, 2.11x violin)
  // Upper bout: 342mm (45.6%), C-bout: 238mm (31.7%), Lower bout: 432mm (57.6%)
  const H = 190;       // half-height
  const upperW = 86;   // upper bout half-width
  const cBoutW = 55;   // c-bout half-width (narrower for deeper curve)
  const lowerW = 108;  // lower bout half-width

  // Key Y positions
  const upperCornerY = -H * 0.22;
  const lowerCornerY = H * 0.22;
  const maxUpperY = -H * 0.55;
  const maxLowerY = H * 0.55;

  ctx.fillStyle = color;
  ctx.beginPath();

  // Start from top center
  ctx.moveTo(0, -H);

  // === RIGHT SIDE ===
  // Upper bout - expands from top to max width
  ctx.bezierCurveTo(upperW * 0.5, -H, upperW * 0.9, -H + 25, upperW, maxUpperY);

  // Upper bout to upper corner (smooth transition)
  ctx.bezierCurveTo(upperW, -H * 0.35, upperW * 0.75, upperCornerY, cBoutW + 18, upperCornerY);

  // C-bout - symmetric inward "C" curve
  ctx.bezierCurveTo(cBoutW, upperCornerY, cBoutW, -H * 0.08, cBoutW, 0);
  ctx.bezierCurveTo(cBoutW, H * 0.08, cBoutW, lowerCornerY, cBoutW + 18, lowerCornerY);

  // Lower corner to lower bout (symmetric)
  ctx.bezierCurveTo(lowerW * 0.75, lowerCornerY, lowerW, H * 0.35, lowerW, maxLowerY);

  // Lower bout - curves inward toward bottom
  ctx.bezierCurveTo(lowerW, H * 0.68, lowerW * 0.75, H * 0.82, lowerW * 0.45, H * 0.92);

  // Bottom curve - rounded arc
  ctx.quadraticCurveTo(lowerW * 0.2, H * 0.98, 0, H * 0.98);

  // === LEFT SIDE (mirror) ===
  ctx.quadraticCurveTo(-lowerW * 0.2, H * 0.98, -lowerW * 0.45, H * 0.92);
  ctx.bezierCurveTo(-lowerW * 0.75, H * 0.82, -lowerW, H * 0.68, -lowerW, maxLowerY);
  ctx.bezierCurveTo(-lowerW, H * 0.35, -lowerW * 0.75, lowerCornerY, -cBoutW - 18, lowerCornerY);
  ctx.bezierCurveTo(-cBoutW, lowerCornerY, -cBoutW, H * 0.08, -cBoutW, 0);
  ctx.bezierCurveTo(-cBoutW, -H * 0.08, -cBoutW, upperCornerY, -cBoutW - 18, upperCornerY);
  ctx.bezierCurveTo(-upperW * 0.75, upperCornerY, -upperW, -H * 0.35, -upperW, maxUpperY);
  ctx.bezierCurveTo(-upperW * 0.9, -H + 25, -upperW * 0.5, -H, 0, -H);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect
  const grainGrad = ctx.createLinearGradient(-lowerW, -H, lowerW, H);
  grainGrad.addColorStop(0, "rgba(180, 120, 60, 0.2)");
  grainGrad.addColorStop(0.5, "rgba(140, 90, 45, 0.15)");
  grainGrad.addColorStop(1, "rgba(100, 60, 30, 0.2)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-25, -H * 0.5, 0, -15, -H * 0.3, 120);
  shine.addColorStop(0, "rgba(255, 240, 200, 0.35)");
  shine.addColorStop(0.4, "rgba(255, 220, 180, 0.12)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Purfling (outline)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 2.2;
  ctx.stroke();
}

function drawCelloDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  // Cello body: H=190, body spans -190 to +192
  const H = 190;
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES - positioned in C-bout area ===
  ctx.fillStyle = "#0a0400";
  ctx.strokeStyle = "#0a0400";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  const fHoleY = H * 0.12;    // 23
  const fHoleLen = H * 0.42;  // 80

  [-1, 1].forEach((side) => {
    const fHoleX = 32 * side;
    // Upper nock
    ctx.beginPath();
    ctx.arc(fHoleX, fHoleY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Main f-curve
    ctx.beginPath();
    ctx.moveTo(fHoleX, fHoleY + 4);
    ctx.bezierCurveTo(fHoleX + side * 6, fHoleY + fHoleLen * 0.4,
                      fHoleX + side * 8, fHoleY + fHoleLen * 0.7,
                      fHoleX + side * 4, fHoleY + fHoleLen);
    ctx.stroke();

    // Lower nock
    ctx.beginPath();
    ctx.arc(fHoleX + side * 4, fHoleY + fHoleLen + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Center notch
    ctx.beginPath();
    ctx.moveTo(fHoleX + side * 2, fHoleY + fHoleLen * 0.5);
    ctx.lineTo(fHoleX + side * 8, fHoleY + fHoleLen * 0.52);
    ctx.stroke();
  });

  // === BRIDGE ===
  const bridgeY = H * 0.55;  // 105
  ctx.fillStyle = "#D4C4A8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-38, bridgeY + 14);
  ctx.lineTo(-34, bridgeY);
  ctx.bezierCurveTo(-22, bridgeY - 5, -10, bridgeY - 7, 0, bridgeY - 7);
  ctx.bezierCurveTo(10, bridgeY - 7, 22, bridgeY - 5, 34, bridgeY);
  ctx.lineTo(38, bridgeY + 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  const tailY = H * 0.72;  // 137
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-14, tailY);
  ctx.lineTo(14, tailY);
  ctx.lineTo(11, tailY + 55);
  ctx.lineTo(-11, tailY + 55);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#A0A0A0";
  [-9, -3, 3, 9].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, tailY + 20, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // === NECK ===
  const neckTop = -H - 95;  // -285
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.moveTo(-10, -H);
  ctx.lineTo(10, -H);
  ctx.lineTo(9, neckTop);
  ctx.lineTo(-9, neckTop);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-12, -H);
  ctx.lineTo(12, -H);
  ctx.lineTo(9, neckTop + 8);
  ctx.lineTo(-9, neckTop + 8);
  ctx.closePath();
  ctx.fill();

  // Nut
  ctx.fillStyle = "#E8E0D0";
  ctx.fillRect(-9, neckTop + 8, 18, 3);

  // === PEGBOX ===
  const pegboxY = neckTop - 28;  // -313
  ctx.fillStyle = "#9A6B3A";
  ctx.fillRect(-9, pegboxY, 18, 26);

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.fillRect(-6, pegboxY + 3, 12, 20);

  // === SCROLL ===
  ctx.strokeStyle = "#9A6B3A";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, pegboxY);
  ctx.bezierCurveTo(-6, pegboxY - 8, -16, pegboxY - 14, -18, pegboxY - 24);
  ctx.bezierCurveTo(-20, pegboxY - 34, -18, pegboxY - 44, -10, pegboxY - 48);
  ctx.bezierCurveTo(-2, pegboxY - 51, 6, pegboxY - 48, 8, pegboxY - 40);
  ctx.bezierCurveTo(10, pegboxY - 32, 6, pegboxY - 24, 0, pegboxY - 22);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.arc(-4, pegboxY - 36, 5, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  [{ x: -16, y: pegboxY + 8 }, { x: -16, y: pegboxY + 18 },
   { x: 16, y: pegboxY + 9 }, { x: 16, y: pegboxY + 19 }].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // === ENDPIN (starts at body bottom H = 190) ===
  const endpinY = H;  // 190
  // Endpin collar
  ctx.fillStyle = "#404040";
  ctx.beginPath();
  ctx.ellipse(0, endpinY + 4, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Endpin rod
  ctx.strokeStyle = "#A0A0A0";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, endpinY + 4);
  ctx.lineTo(0, endpinY + 70);
  ctx.stroke();

  // Endpin tip
  ctx.fillStyle = "#505050";
  ctx.beginPath();
  ctx.moveTo(-5, endpinY + 70);
  ctx.lineTo(5, endpinY + 70);
  ctx.lineTo(0, endpinY + 82);
  ctx.closePath();
  ctx.fill();

  // Glow on hover
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = COLORS.accent.gold;
    ctx.shadowBlur = 30;
    ctx.restore();
  }
}

function drawCelloStrings(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  // Cello body H=190, neck extends to -285
  const H = 190;
  const nutY = -H - 87;         // -277 (matches neckTop + 8 from CelloDetails)
  const bridgeY = H * 0.55;     // 105 (matches bridge position)

  // C G D A strings (thickest to thinnest)
  const stringColors = ["#D4AF37", "#D4AF37", "#C0C0C0", "#E8E8E8"]; // C,G wound (gold)
  const stringThickness = [1.8, 1.4, 1.1, 0.9];
  const stringX = [-9, -3, 3, 9];

  stringX.forEach((x, i) => {
    const vibration = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.35;
    ctx.moveTo(startX, nutY);
    for (let y = nutY; y <= bridgeY; y += 6) {
      const progress = (y - nutY) / (bridgeY - nutY);
      const currentX = startX + (x - startX) * progress;
      const wave = Math.sin((y + time * 22) * 0.08) * vibration * 0.6;
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
