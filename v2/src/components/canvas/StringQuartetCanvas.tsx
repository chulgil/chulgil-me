"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface StringQuartetCanvasProps {
  className?: string;
}

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

  const instrumentStates = useRef<Record<string, InstrumentState>>({
    violin1: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
    violin2: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
    viola: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
    cello: { hover: false, sway: 0, stringVibration: [0, 0, 0, 0] },
  });

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

      // Endpin
      ctx.strokeStyle = COLORS.accent.silver;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 180);
      ctx.lineTo(0, 230);
      ctx.stroke();

      // Endpin tip
      ctx.fillStyle = COLORS.accent.ebony;
      ctx.beginPath();
      ctx.arc(0, 230, 4, 0, Math.PI * 2);
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

  // Violin body outline
  ctx.moveTo(0, -120);
  ctx.bezierCurveTo(45, -120, 60, -80, 55, -40);
  ctx.bezierCurveTo(50, -15, 40, 5, 48, 30);
  ctx.bezierCurveTo(60, 60, 70, 100, 50, 125);
  ctx.bezierCurveTo(25, 145, -25, 145, -50, 125);
  ctx.bezierCurveTo(-70, 100, -60, 60, -48, 30);
  ctx.bezierCurveTo(-40, 5, -50, -15, -55, -40);
  ctx.bezierCurveTo(-60, -80, -45, -120, 0, -120);

  ctx.closePath();
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-15, -30, 0, 0, 0, 100);
  shine.addColorStop(0, "rgba(255, 220, 180, 0.35)");
  shine.addColorStop(0.4, "rgba(180, 120, 60, 0.15)");
  shine.addColorStop(1, "rgba(80, 40, 20, 0.3)");
  ctx.fillStyle = shine;
  ctx.fill();
}

function drawViolinDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number,
  isViola: boolean = false
) {
  const glow = state.hover ? 0.3 : 0;

  // F-holes
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  // Left f-hole
  ctx.beginPath();
  ctx.moveTo(-20, -25);
  ctx.bezierCurveTo(-25, -5, -25, 25, -20, 45);
  ctx.stroke();

  // Left f-hole dots
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.arc(-20, -30, 3, 0, Math.PI * 2);
  ctx.arc(-20, 50, 3, 0, Math.PI * 2);
  ctx.fill();

  // Right f-hole
  ctx.beginPath();
  ctx.moveTo(20, -25);
  ctx.bezierCurveTo(25, -5, 25, 25, 20, 45);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(20, -30, 3, 0, Math.PI * 2);
  ctx.arc(20, 50, 3, 0, Math.PI * 2);
  ctx.fill();

  // Bridge
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.beginPath();
  ctx.moveTo(-22, 50);
  ctx.lineTo(-18, 40);
  ctx.lineTo(-8, 38);
  ctx.lineTo(0, 36);
  ctx.lineTo(8, 38);
  ctx.lineTo(18, 40);
  ctx.lineTo(22, 50);
  ctx.closePath();
  ctx.fill();

  // Tailpiece
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-12, 100);
  ctx.lineTo(12, 100);
  ctx.lineTo(10, 130);
  ctx.lineTo(-10, 130);
  ctx.closePath();
  ctx.fill();

  // Fine tuners (gold)
  if (state.hover) {
    ctx.fillStyle = COLORS.accent.gold;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(-7 + i * 4.5, 118, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Neck
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-8, -190, 16, 80);

  // Fingerboard
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-10, -180);
  ctx.lineTo(10, -180);
  ctx.lineTo(8, -115);
  ctx.lineTo(-8, -115);
  ctx.closePath();
  ctx.fill();

  // Scroll
  ctx.strokeStyle = COLORS.accent.rosewood;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(-4, -195, 10, 0, Math.PI * 1.6, false);
  ctx.stroke();

  // Pegbox
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-10, -195, 20, 18);

  // Pegs
  ctx.fillStyle = COLORS.accent.ebony;
  for (let i = 0; i < 4; i++) {
    const px = i < 2 ? -14 : 14;
    const py = -190 + (i % 2) * 10;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chin rest
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.beginPath();
  ctx.ellipse(-40, 110, 18, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Glow effect on hover
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = COLORS.accent.gold;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = `rgba(212, 175, 55, ${glow})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

function drawViolinStrings(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  const stringColors = ["#F0F0F0", "#E0E0E0", "#D0D0D0", "#C0C0C0"];
  const stringX = [-7, -2.5, 2.5, 7];

  stringX.forEach((x, i) => {
    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = 1.2 - i * 0.15;
    ctx.beginPath();

    const vibration = state.stringVibration[i] || 0;

    ctx.moveTo(x, -180);
    ctx.bezierCurveTo(
      x + vibration * 0.3,
      -100,
      x + vibration,
      0,
      x,
      115
    );
    ctx.stroke();
  });
}

function drawCelloBody(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();

  // Cello body - larger and different proportions
  ctx.moveTo(0, -150);
  ctx.bezierCurveTo(60, -150, 80, -100, 75, -50);
  ctx.bezierCurveTo(70, -20, 55, 10, 65, 45);
  ctx.bezierCurveTo(80, 85, 95, 130, 70, 165);
  ctx.bezierCurveTo(40, 195, -40, 195, -70, 165);
  ctx.bezierCurveTo(-95, 130, -80, 85, -65, 45);
  ctx.bezierCurveTo(-55, 10, -70, -20, -75, -50);
  ctx.bezierCurveTo(-80, -100, -60, -150, 0, -150);

  ctx.closePath();
  ctx.fill();

  // Varnish shine
  const shine = ctx.createRadialGradient(-20, -40, 0, 0, 0, 140);
  shine.addColorStop(0, "rgba(255, 220, 180, 0.3)");
  shine.addColorStop(0.4, "rgba(180, 120, 60, 0.12)");
  shine.addColorStop(1, "rgba(80, 40, 20, 0.25)");
  ctx.fillStyle = shine;
  ctx.fill();
}

function drawCelloDetails(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  const glow = state.hover ? 0.3 : 0;

  // F-holes (larger)
  ctx.strokeStyle = COLORS.accent.ebony;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  // Left f-hole
  ctx.beginPath();
  ctx.moveTo(-28, -30);
  ctx.bezierCurveTo(-35, 0, -35, 40, -28, 70);
  ctx.stroke();

  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.arc(-28, -38, 4, 0, Math.PI * 2);
  ctx.arc(-28, 78, 4, 0, Math.PI * 2);
  ctx.fill();

  // Right f-hole
  ctx.beginPath();
  ctx.moveTo(28, -30);
  ctx.bezierCurveTo(35, 0, 35, 40, 28, 70);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(28, -38, 4, 0, Math.PI * 2);
  ctx.arc(28, 78, 4, 0, Math.PI * 2);
  ctx.fill();

  // Bridge
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.beginPath();
  ctx.moveTo(-30, 75);
  ctx.lineTo(-25, 60);
  ctx.lineTo(-10, 55);
  ctx.lineTo(0, 52);
  ctx.lineTo(10, 55);
  ctx.lineTo(25, 60);
  ctx.lineTo(30, 75);
  ctx.closePath();
  ctx.fill();

  // Tailpiece
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-18, 130);
  ctx.lineTo(18, 130);
  ctx.lineTo(15, 175);
  ctx.lineTo(-15, 175);
  ctx.closePath();
  ctx.fill();

  // Fine tuners
  if (state.hover) {
    ctx.fillStyle = COLORS.accent.gold;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(-10 + i * 6.5, 155, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Neck
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-12, -250, 24, 110);

  // Fingerboard
  ctx.fillStyle = COLORS.accent.ebony;
  ctx.beginPath();
  ctx.moveTo(-14, -240);
  ctx.lineTo(14, -240);
  ctx.lineTo(11, -145);
  ctx.lineTo(-11, -145);
  ctx.closePath();
  ctx.fill();

  // Scroll
  ctx.strokeStyle = COLORS.accent.rosewood;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(-5, -255, 14, 0, Math.PI * 1.6, false);
  ctx.stroke();

  // Pegbox
  ctx.fillStyle = COLORS.accent.rosewood;
  ctx.fillRect(-14, -258, 28, 25);

  // Pegs
  ctx.fillStyle = COLORS.accent.ebony;
  for (let i = 0; i < 4; i++) {
    const px = i < 2 ? -20 : 20;
    const py = -252 + (i % 2) * 14;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCelloStrings(
  ctx: CanvasRenderingContext2D,
  state: InstrumentState,
  time: number
) {
  const stringColors = ["#E8E8E8", "#D8D8D8", "#C8C8C8", "#B8B8B8"];
  const stringX = [-10, -3.5, 3.5, 10];

  stringX.forEach((x, i) => {
    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = 1.8 - i * 0.2;
    ctx.beginPath();

    const vibration = state.stringVibration[i] || 0;

    ctx.moveTo(x, -235);
    ctx.bezierCurveTo(
      x + vibration * 0.4,
      -100,
      x + vibration * 1.2,
      30,
      x,
      155
    );
    ctx.stroke();
  });
}
