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
  const getInstrumentPositions = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 800;

    return {
      violin1: { x: centerX - 200 * scale, y: centerY - 50 * scale, scale: scale * 0.7, rotation: -0.15 },
      violin2: { x: centerX + 200 * scale, y: centerY - 50 * scale, scale: scale * 0.7, rotation: 0.15 },
      viola: { x: centerX - 70 * scale, y: centerY + 30 * scale, scale: scale * 0.8, rotation: -0.1 },
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
      ctx.scale(scale * 1.15, scale * 1.15); // Viola is slightly larger

      // Shadow
      ctx.save();
      ctx.translate(8, 12);
      ctx.globalAlpha = 0.3;
      drawViolinBody(ctx, "#000");
      ctx.restore();

      // Body with slightly darker tone
      drawViolinBody(ctx, COLORS.wood.dark);
      drawViolinDetails(ctx, state, time, true);
      drawViolinStrings(ctx, state, time);

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

      // === ENDPIN ===
      // Endpin collar
      ctx.fillStyle = "#404040";
      ctx.beginPath();
      ctx.ellipse(0, 170, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Endpin rod
      ctx.strokeStyle = "#A0A0A0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 170);
      ctx.lineTo(0, 225);
      ctx.stroke();

      // Endpin tip
      ctx.fillStyle = "#505050";
      ctx.beginPath();
      ctx.moveTo(-4, 225);
      ctx.lineTo(4, 225);
      ctx.lineTo(0, 235);
      ctx.closePath();
      ctx.fill();

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
  ctx.fillStyle = color;
  ctx.beginPath();

  // Accurate violin proportions based on real instruments
  // Upper bout ~33mm half-width, C-bout ~22mm, Lower bout ~41mm (scaled)
  ctx.moveTo(0, -95); // Top center

  // Upper bout - right (narrower, rounder)
  ctx.bezierCurveTo(28, -95, 44, -82, 50, -68);
  ctx.bezierCurveTo(54, -55, 52, -42, 46, -30);

  // C-bout right (distinctive narrow waist)
  ctx.bezierCurveTo(38, -14, 32, 2, 32, 12);
  ctx.bezierCurveTo(32, 24, 40, 42, 52, 58);

  // Lower bout right (wider than upper)
  ctx.bezierCurveTo(64, 76, 66, 95, 56, 110);
  ctx.bezierCurveTo(46, 122, 26, 128, 0, 128);

  // Lower bout left
  ctx.bezierCurveTo(-26, 128, -46, 122, -56, 110);
  ctx.bezierCurveTo(-66, 95, -64, 76, -52, 58);

  // C-bout left
  ctx.bezierCurveTo(-40, 42, -32, 24, -32, 12);
  ctx.bezierCurveTo(-32, 2, -38, -14, -46, -30);

  // Upper bout left
  ctx.bezierCurveTo(-52, -42, -54, -55, -50, -68);
  ctx.bezierCurveTo(-44, -82, -28, -95, 0, -95);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect
  const grainGrad = ctx.createLinearGradient(-50, -90, 50, 120);
  grainGrad.addColorStop(0, "rgba(180, 120, 60, 0.25)");
  grainGrad.addColorStop(0.25, "rgba(120, 70, 30, 0.15)");
  grainGrad.addColorStop(0.5, "rgba(160, 100, 50, 0.2)");
  grainGrad.addColorStop(0.75, "rgba(100, 60, 25, 0.15)");
  grainGrad.addColorStop(1, "rgba(80, 45, 20, 0.25)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine (top-left highlight)
  const shine = ctx.createRadialGradient(-18, -55, 0, -12, -35, 75);
  shine.addColorStop(0, "rgba(255, 240, 200, 0.4)");
  shine.addColorStop(0.3, "rgba(255, 220, 180, 0.18)");
  shine.addColorStop(0.7, "rgba(200, 150, 100, 0.06)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Edge shadow for depth
  const edgeShadow = ctx.createRadialGradient(0, 15, 30, 0, 15, 85);
  edgeShadow.addColorStop(0, "transparent");
  edgeShadow.addColorStop(0.7, "transparent");
  edgeShadow.addColorStop(1, "rgba(40, 20, 5, 0.35)");
  ctx.fillStyle = edgeShadow;
  ctx.fill();

  // Purfling (edge outline)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawViolinDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number,
  isViola: boolean = false
) {
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES - Realistic italic f shape ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  [-1, 1].forEach((side) => {
    // Upper nock (circle)
    ctx.beginPath();
    ctx.arc(side * 15, -22, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Upper wing
    ctx.beginPath();
    ctx.moveTo(side * 13, -18);
    ctx.bezierCurveTo(side * 9, -14, side * 7, -10, side * 9, -5);
    ctx.stroke();

    // Main S-curve
    ctx.beginPath();
    ctx.moveTo(side * 15, -18);
    ctx.bezierCurveTo(side * 19, -6, side * 20, 12, side * 18, 28);
    ctx.bezierCurveTo(side * 16, 42, side * 14, 52, side * 16, 60);
    ctx.stroke();

    // Lower wing
    ctx.beginPath();
    ctx.moveTo(side * 18, 56);
    ctx.bezierCurveTo(side * 22, 60, side * 24, 64, side * 22, 68);
    ctx.stroke();

    // Lower nock (circle)
    ctx.beginPath();
    ctx.arc(side * 16, 64, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Center notch
    ctx.beginPath();
    ctx.moveTo(side * 16, 20);
    ctx.lineTo(side * 20, 22);
    ctx.stroke();
  });

  // === BRIDGE - Maple with cutouts ===
  ctx.fillStyle = "#E8DCC8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-20, 72);
  ctx.lineTo(-18, 60);
  ctx.bezierCurveTo(-14, 55, -8, 53, -6, 56);
  ctx.lineTo(-4, 60);
  ctx.bezierCurveTo(-2, 57, 0, 55, 0, 55);
  ctx.bezierCurveTo(0, 55, 2, 57, 4, 60);
  ctx.lineTo(6, 56);
  ctx.bezierCurveTo(8, 53, 14, 55, 18, 60);
  ctx.lineTo(20, 72);
  ctx.lineTo(-20, 72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-10, 82);
  ctx.lineTo(10, 82);
  ctx.bezierCurveTo(11, 92, 9, 115, 7, 120);
  ctx.lineTo(-7, 120);
  ctx.bezierCurveTo(-9, 115, -11, 92, -10, 82);
  ctx.closePath();
  ctx.fill();

  // Fine tuners (always visible)
  ctx.fillStyle = "#B0B0B0";
  [-6, -2, 2, 6].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 92, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Tailgut
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(0, 126);
  ctx.stroke();

  // === NECK ===
  ctx.fillStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.beginPath();
  ctx.moveTo(-7, -95);
  ctx.lineTo(7, -95);
  ctx.lineTo(6, -175);
  ctx.lineTo(-6, -175);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD (ebony) ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-8, -95);
  ctx.lineTo(8, -95);
  ctx.bezierCurveTo(8, -110, 7, -150, 6, -168);
  ctx.lineTo(-6, -168);
  ctx.bezierCurveTo(-7, -150, -8, -110, -8, -95);
  ctx.closePath();
  ctx.fill();

  // Fingerboard shine
  const fbShine = ctx.createLinearGradient(-8, 0, 8, 0);
  fbShine.addColorStop(0, "rgba(60, 60, 60, 0.25)");
  fbShine.addColorStop(0.3, "rgba(100, 100, 100, 0.15)");
  fbShine.addColorStop(1, "rgba(30, 30, 30, 0.25)");
  ctx.fillStyle = fbShine;
  ctx.fill();

  // Nut
  ctx.fillStyle = "#F5F5DC";
  ctx.fillRect(-6, -168, 12, 3);

  // === PEGBOX ===
  ctx.fillStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.beginPath();
  ctx.moveTo(-6, -168);
  ctx.lineTo(-7, -198);
  ctx.lineTo(7, -198);
  ctx.lineTo(6, -168);
  ctx.closePath();
  ctx.fill();

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.beginPath();
  ctx.moveTo(-4, -172);
  ctx.lineTo(-5, -193);
  ctx.lineTo(5, -193);
  ctx.lineTo(4, -172);
  ctx.closePath();
  ctx.fill();

  // === SCROLL - Spiral ===
  ctx.strokeStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -198);
  ctx.bezierCurveTo(-5, -204, -12, -206, -14, -212);
  ctx.bezierCurveTo(-16, -218, -14, -225, -8, -227);
  ctx.bezierCurveTo(-2, -229, 4, -227, 6, -222);
  ctx.bezierCurveTo(8, -217, 5, -212, 0, -210);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = isViola ? "#7A5C3A" : "#8B6914";
  ctx.beginPath();
  ctx.arc(-2, -218, 4, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  const pegPositions = [
    { x: -12, y: -188 }, { x: -12, y: -178 },
    { x: 12, y: -186 }, { x: 12, y: -176 }
  ];
  pegPositions.forEach((p) => {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x + (p.x > 0 ? 5 : -5), p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // === CHIN REST ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.ellipse(-35, 105, 18, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Chin rest clamp
  ctx.fillStyle = "#707070";
  ctx.beginPath();
  ctx.arc(-22, 115, 3, 0, Math.PI * 2);
  ctx.fill();

  // Glow effect on hover
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = COLORS.accent.gold;
    ctx.shadowBlur = 25;
    ctx.globalAlpha = glow;
    ctx.restore();
  }
}

function drawViolinStrings(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  // G D A E strings (thickest to thinnest)
  const stringColors = ["#D4AF37", "#C0C0C0", "#C0C0C0", "#E8E8E8"]; // G wound (gold)
  const stringThickness = [1.1, 0.9, 0.8, 0.6];
  const stringX = [-5, -1.8, 1.8, 5];

  stringX.forEach((x, i) => {
    const vibration = state.stringVibration[i] || 0;

    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = stringThickness[i];
    ctx.beginPath();

    const startX = x * 0.4;
    const endX = x;

    ctx.moveTo(startX, -165);
    for (let y = -165; y <= 80; y += 4) {
      const progress = (y + 165) / 245;
      const currentX = startX + (endX - startX) * progress;
      const wave = Math.sin((y + time * 30) * 0.12) * vibration * 0.3;
      ctx.lineTo(currentX + wave, y);
    }
    ctx.stroke();
  });
}

function drawCelloBody(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();

  // Accurate cello proportions
  // Upper bout ~17cm half-width, C-bout ~11.5cm, Lower bout ~22cm (scaled)
  ctx.moveTo(0, -125);

  // Upper bout - right (narrower)
  ctx.bezierCurveTo(38, -125, 56, -108, 62, -88);
  ctx.bezierCurveTo(66, -72, 64, -54, 56, -38);

  // C-bout right (deep waist - cello characteristic)
  ctx.bezierCurveTo(46, -18, 40, 6, 40, 20);
  ctx.bezierCurveTo(40, 36, 48, 58, 62, 78);

  // Lower bout right (much wider than upper)
  ctx.bezierCurveTo(76, 100, 78, 125, 66, 142);
  ctx.bezierCurveTo(54, 156, 30, 165, 0, 165);

  // Lower bout left
  ctx.bezierCurveTo(-30, 165, -54, 156, -66, 142);
  ctx.bezierCurveTo(-78, 125, -76, 100, -62, 78);

  // C-bout left
  ctx.bezierCurveTo(-48, 58, -40, 36, -40, 20);
  ctx.bezierCurveTo(-40, 6, -46, -18, -56, -38);

  // Upper bout left
  ctx.bezierCurveTo(-64, -54, -66, -72, -62, -88);
  ctx.bezierCurveTo(-56, -108, -38, -125, 0, -125);

  ctx.closePath();
  ctx.fill();

  // Wood grain effect
  const grainGrad = ctx.createLinearGradient(-65, -120, 65, 160);
  grainGrad.addColorStop(0, "rgba(200, 140, 70, 0.28)");
  grainGrad.addColorStop(0.2, "rgba(140, 85, 40, 0.18)");
  grainGrad.addColorStop(0.4, "rgba(180, 120, 60, 0.22)");
  grainGrad.addColorStop(0.6, "rgba(120, 70, 35, 0.18)");
  grainGrad.addColorStop(0.8, "rgba(160, 100, 50, 0.22)");
  grainGrad.addColorStop(1, "rgba(80, 45, 20, 0.28)");
  ctx.fillStyle = grainGrad;
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-22, -75, 0, -15, -45, 100);
  shine.addColorStop(0, "rgba(255, 240, 200, 0.38)");
  shine.addColorStop(0.3, "rgba(255, 220, 180, 0.16)");
  shine.addColorStop(0.7, "rgba(200, 150, 100, 0.05)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Edge shadow
  const edgeShadow = ctx.createRadialGradient(0, 25, 45, 0, 25, 110);
  edgeShadow.addColorStop(0, "transparent");
  edgeShadow.addColorStop(0.7, "transparent");
  edgeShadow.addColorStop(1, "rgba(40, 20, 5, 0.38)");
  ctx.fillStyle = edgeShadow;
  ctx.fill();

  // Purfling (edge outline)
  ctx.strokeStyle = "#1a0800";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function drawCelloDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  const glow = state.hover ? 0.3 : 0;

  // === F-HOLES - Realistic cello f-holes ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  [-1, 1].forEach((side) => {
    // Upper nock
    ctx.beginPath();
    ctx.arc(side * 20, -32, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Upper wing
    ctx.beginPath();
    ctx.moveTo(side * 17, -26);
    ctx.bezierCurveTo(side * 11, -20, side * 9, -14, side * 11, -6);
    ctx.stroke();

    // Main S-curve
    ctx.beginPath();
    ctx.moveTo(side * 20, -26);
    ctx.bezierCurveTo(side * 26, -10, side * 28, 22, side * 26, 48);
    ctx.bezierCurveTo(side * 24, 68, side * 20, 82, side * 22, 92);
    ctx.stroke();

    // Lower wing
    ctx.beginPath();
    ctx.moveTo(side * 25, 86);
    ctx.bezierCurveTo(side * 30, 92, side * 33, 98, side * 30, 104);
    ctx.stroke();

    // Lower nock
    ctx.beginPath();
    ctx.arc(side * 22, 98, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Center notch
    ctx.beginPath();
    ctx.moveTo(side * 22, 30);
    ctx.lineTo(side * 27, 32);
    ctx.stroke();
  });

  // === BRIDGE ===
  ctx.fillStyle = "#E8DCC8";
  ctx.strokeStyle = "#5D4E37";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-26, 108);
  ctx.lineTo(-24, 92);
  ctx.bezierCurveTo(-18, 85, -10, 82, -7, 86);
  ctx.lineTo(-5, 92);
  ctx.bezierCurveTo(-2, 88, 0, 85, 0, 85);
  ctx.bezierCurveTo(0, 85, 2, 88, 5, 92);
  ctx.lineTo(7, 86);
  ctx.bezierCurveTo(10, 82, 18, 85, 24, 92);
  ctx.lineTo(26, 108);
  ctx.lineTo(-26, 108);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === TAILPIECE ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-14, 118);
  ctx.lineTo(14, 118);
  ctx.bezierCurveTo(16, 135, 12, 158, 10, 162);
  ctx.lineTo(-10, 162);
  ctx.bezierCurveTo(-12, 158, -16, 135, -14, 118);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  ctx.fillStyle = "#B0B0B0";
  [-8, -3, 3, 8].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 128, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Tailgut
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 162);
  ctx.lineTo(0, 168);
  ctx.stroke();

  // === NECK ===
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.moveTo(-10, -125);
  ctx.lineTo(10, -125);
  ctx.lineTo(9, -225);
  ctx.lineTo(-9, -225);
  ctx.closePath();
  ctx.fill();

  // === FINGERBOARD ===
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-12, -125);
  ctx.lineTo(12, -125);
  ctx.bezierCurveTo(12, -150, 10, -195, 9, -218);
  ctx.lineTo(-9, -218);
  ctx.bezierCurveTo(-10, -195, -12, -150, -12, -125);
  ctx.closePath();
  ctx.fill();

  // Fingerboard shine
  const fbShine = ctx.createLinearGradient(-12, 0, 12, 0);
  fbShine.addColorStop(0, "rgba(60, 60, 60, 0.28)");
  fbShine.addColorStop(0.3, "rgba(100, 100, 100, 0.18)");
  fbShine.addColorStop(1, "rgba(30, 30, 30, 0.28)");
  ctx.fillStyle = fbShine;
  ctx.fill();

  // Nut
  ctx.fillStyle = "#F5F5DC";
  ctx.fillRect(-9, -218, 18, 4);

  // === PEGBOX ===
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.moveTo(-9, -218);
  ctx.lineTo(-10, -255);
  ctx.lineTo(10, -255);
  ctx.lineTo(9, -218);
  ctx.closePath();
  ctx.fill();

  // Pegbox cavity
  ctx.fillStyle = "#1a0800";
  ctx.beginPath();
  ctx.moveTo(-6, -222);
  ctx.lineTo(-7, -250);
  ctx.lineTo(7, -250);
  ctx.lineTo(6, -222);
  ctx.closePath();
  ctx.fill();

  // === SCROLL ===
  ctx.strokeStyle = "#9A6B3A";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -255);
  ctx.bezierCurveTo(-7, -264, -17, -268, -20, -278);
  ctx.bezierCurveTo(-23, -288, -20, -298, -12, -302);
  ctx.bezierCurveTo(-4, -306, 6, -302, 9, -294);
  ctx.bezierCurveTo(12, -286, 7, -278, 0, -275);
  ctx.stroke();

  // Scroll eye
  ctx.fillStyle = "#9A6B3A";
  ctx.beginPath();
  ctx.arc(-4, -290, 6, 0, Math.PI * 2);
  ctx.fill();

  // === PEGS ===
  ctx.fillStyle = COLORS.accent.ebony;
  const pegPos = [
    { x: -17, y: -245 }, { x: -17, y: -232 },
    { x: 17, y: -242 }, { x: 17, y: -229 }
  ];
  pegPos.forEach((p) => {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x + (p.x > 0 ? 7 : -7), p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Glow effect on hover
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = COLORS.accent.gold;
    ctx.shadowBlur = 30;
    ctx.globalAlpha = glow;
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

    ctx.moveTo(startX, -215);
    for (let y = -215; y <= 115; y += 5) {
      const progress = (y + 215) / 330;
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
