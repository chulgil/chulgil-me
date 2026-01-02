"use client";

import { useEffect, useRef, useCallback } from "react";

interface ViolinCanvasProps {
  className?: string;
}

export default function ViolinCanvas({ className = "" }: ViolinCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const stringsRef = useRef<{ offset: number; frequency: number }[]>([
    { offset: 0, frequency: 0.02 },
    { offset: 0, frequency: 0.025 },
    { offset: 0, frequency: 0.03 },
    { offset: 0, frequency: 0.035 },
  ]);

  const drawViolin = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) / 500;
      const time = Date.now() * 0.001;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Apply rotation based on mouse position
      const rotateX = rotationRef.current.x * 0.1;
      const rotateY = rotationRef.current.y * 0.1;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Subtle 3D-like transform
      ctx.transform(
        1 + rotateY * 0.05,
        rotateX * 0.02,
        rotateY * 0.02,
        1 + rotateX * 0.05,
        0,
        0
      );

      // Floating animation
      const floatY = Math.sin(time * 2) * 5;
      ctx.translate(0, floatY);

      // Scale
      ctx.scale(scale, scale);

      // Draw shadow
      ctx.save();
      ctx.translate(10, 15);
      ctx.globalAlpha = 0.2;
      drawViolinBody(ctx, "#000");
      ctx.restore();

      // Draw violin body
      drawViolinBody(ctx, "#8B4513");

      // Draw details
      drawViolinDetails(ctx);

      // Draw strings with vibration
      drawStrings(ctx, time);

      ctx.restore();
    },
    []
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
      mouseRef.current.x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      mouseRef.current.y =
        (e.clientY - rect.top - rect.height / 2) / rect.height;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Smooth rotation towards mouse
      rotationRef.current.x +=
        (mouseRef.current.y - rotationRef.current.x) * 0.05;
      rotationRef.current.y +=
        (mouseRef.current.x - rotationRef.current.y) * 0.05;

      // Update string vibrations
      stringsRef.current.forEach((string) => {
        string.offset += string.frequency;
      });

      const rect = canvas.getBoundingClientRect();
      drawViolin(ctx, rect.width, rect.height);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [drawViolin]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full min-h-[400px] ${className}`}
      style={{ touchAction: "none" }}
      role="img"
      aria-label="Interactive 3D violin visualization"
    />
  );
}

function drawViolinBody(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();

  // Draw violin body shape using bezier curves
  ctx.moveTo(0, -150); // Top

  // Upper bout - right
  ctx.bezierCurveTo(60, -150, 80, -100, 70, -50);

  // C-bout - right
  ctx.bezierCurveTo(60, -20, 50, 10, 60, 40);

  // Lower bout - right
  ctx.bezierCurveTo(80, 80, 90, 130, 60, 160);

  // Bottom curve
  ctx.bezierCurveTo(30, 180, -30, 180, -60, 160);

  // Lower bout - left
  ctx.bezierCurveTo(-90, 130, -80, 80, -60, 40);

  // C-bout - left
  ctx.bezierCurveTo(-50, 10, -60, -20, -70, -50);

  // Upper bout - left
  ctx.bezierCurveTo(-80, -100, -60, -150, 0, -150);

  ctx.closePath();
  ctx.fill();

  // Add gradient for depth
  const gradient = ctx.createRadialGradient(20, -20, 0, 0, 0, 180);
  gradient.addColorStop(0, "rgba(255, 200, 150, 0.3)");
  gradient.addColorStop(0.5, "rgba(139, 69, 19, 0.1)");
  gradient.addColorStop(1, "rgba(50, 20, 0, 0.4)");
  ctx.fillStyle = gradient;
  ctx.fill();
}

function drawViolinDetails(ctx: CanvasRenderingContext2D) {
  // F-holes
  ctx.strokeStyle = "#65000B";
  ctx.lineWidth = 3;

  // Left f-hole
  ctx.beginPath();
  ctx.moveTo(-25, -30);
  ctx.bezierCurveTo(-30, -10, -30, 30, -25, 50);
  ctx.stroke();

  // Right f-hole
  ctx.beginPath();
  ctx.moveTo(25, -30);
  ctx.bezierCurveTo(30, -10, 30, 30, 25, 50);
  ctx.stroke();

  // Bridge
  ctx.fillStyle = "#65000B";
  ctx.fillRect(-30, 60, 60, 8);

  // Tailpiece
  ctx.fillStyle = "#65000B";
  ctx.beginPath();
  ctx.moveTo(-15, 130);
  ctx.lineTo(15, 130);
  ctx.lineTo(12, 165);
  ctx.lineTo(-12, 165);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = "#65000B";
  ctx.fillRect(-10, -230, 20, 100);

  // Fingerboard
  ctx.fillStyle = "#1a0a00";
  ctx.fillRect(-12, -220, 24, 80);

  // Scroll
  ctx.strokeStyle = "#65000B";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(-5, -235, 12, 0, Math.PI * 1.5, false);
  ctx.stroke();

  // Pegbox
  ctx.fillStyle = "#65000B";
  ctx.fillRect(-12, -230, 24, 20);

  // Tuning pegs
  ctx.fillStyle = "#1a0a00";
  for (let i = 0; i < 4; i++) {
    const x = i < 2 ? -18 : 18;
    const y = -225 + (i % 2) * 12;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chin rest
  ctx.fillStyle = "#65000B";
  ctx.beginPath();
  ctx.ellipse(-50, 140, 20, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Fine tuners (gold)
  ctx.fillStyle = "#D4AF37";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-9 + i * 6, 155, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStrings(ctx: CanvasRenderingContext2D, time: number) {
  const stringPositions = [-9, -3, 3, 9];
  const stringColors = ["#E8E8E8", "#D0D0D0", "#C0C0C0", "#B0B0B0"];

  stringPositions.forEach((x, i) => {
    ctx.strokeStyle = stringColors[i];
    ctx.lineWidth = 1.5 - i * 0.2;

    ctx.beginPath();

    // String with subtle vibration
    const vibration = Math.sin(time * 10 + i) * 2;
    const vibrationMid = Math.sin(time * 15 + i * 2) * 1.5;

    ctx.moveTo(x, -140);

    // Bezier curve for vibrating string
    ctx.bezierCurveTo(
      x + vibrationMid,
      -40,
      x + vibration,
      40,
      x,
      140
    );

    ctx.stroke();
  });
}
