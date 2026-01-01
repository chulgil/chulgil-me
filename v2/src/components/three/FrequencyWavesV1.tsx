"use client";

import { useRef, useEffect, useCallback } from "react";
import { gsap } from "@/lib/gsap";

// Layer configuration
const LAYERS = {
  human: {
    texts: ["안녕", "음악", "연결", "사람", "목소리"],
    color: "rgba(255, 253, 208, 0.8)", // cream
    waveColor: "rgba(255, 253, 208, 0.3)",
    frequency: 0.002,
    amplitude: 30,
    offset: 0,
  },
  ai: {
    texts: ["01", "10", "{ }", "=>", "const", "async"],
    color: "rgba(212, 175, 55, 0.9)", // gold
    waveColor: "rgba(212, 175, 55, 0.3)",
    frequency: 0.008, // faster for digital feel
    amplitude: 20,
    offset: Math.PI / 3,
  },
  music: {
    texts: ["♩", "♪", "♫", "♬", "𝄞"],
    color: "rgba(101, 0, 11, 0.8)", // rosewood
    waveColor: "rgba(101, 0, 11, 0.3)",
    frequency: 0.004,
    amplitude: 25,
    offset: (Math.PI * 2) / 3,
  },
};

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  text: string;
  color: string;
  frequency: number;
  amplitude: number;
  phase: number;
  size: number;
  layer: string;
}

export default function FrequencyWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    Object.entries(LAYERS).forEach(([layerName, layer], layerIndex) => {
      layer.texts.forEach((text, textIndex) => {
        // Distribute in a violin-like shape
        const angle = (textIndex / layer.texts.length) * Math.PI * 2 + layer.offset;
        const radiusX = 100 + Math.random() * 150;
        const radiusY = 150 + Math.random() * 100;

        const x = centerX + Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle) * radiusY * 0.7;

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          text,
          color: layer.color,
          frequency: layer.frequency + Math.random() * 0.001,
          amplitude: layer.amplitude + Math.random() * 10,
          phase: Math.random() * Math.PI * 2,
          size: 14 + Math.random() * 10,
          layer: layerName,
        });
      });
    });

    particlesRef.current = particles;
  }, []);

  // Draw wave line
  const drawWave = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      time: number,
      layer: typeof LAYERS.human,
      yOffset: number
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = layer.waveColor;
      ctx.lineWidth = 2;

      const centerY = height / 2 + yOffset;

      for (let x = 0; x < width; x += 2) {
        let y: number;

        if (layer === LAYERS.ai) {
          // Square wave for AI
          const sineValue = Math.sin(x * layer.frequency * 10 + time * 2);
          y = centerY + Math.sign(sineValue) * layer.amplitude;
        } else {
          // Sine wave for Human and Music
          y = centerY + Math.sin(x * layer.frequency * 10 + time) * layer.amplitude;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    },
    []
  );

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    timeRef.current += 0.016; // ~60fps
    const time = timeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background waves
    drawWave(ctx, width, height, time, LAYERS.human, -80);
    drawWave(ctx, width, height, time * 1.5, LAYERS.ai, 0);
    drawWave(ctx, width, height, time * 0.8, LAYERS.music, 80);

    // Draw violin outline (simplified wave path)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
    ctx.lineWidth = 1;

    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      const waveOffset = Math.sin(time + t * 3) * 5;

      // Violin body shape
      const radiusX = 120 + 30 * Math.sin(t * 2) + waveOffset;
      const radiusY = 180 + 20 * Math.cos(t * 2);

      const x = centerX + Math.cos(t) * radiusX;
      const y = centerY + Math.sin(t) * radiusY * 0.8;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      // Calculate wave offset based on layer type
      let waveY: number;
      if (particle.layer === "ai") {
        // Square wave movement
        waveY = Math.sign(Math.sin(time * 2 + particle.phase)) * particle.amplitude * 0.5;
      } else {
        // Sine wave movement
        waveY = Math.sin(time + particle.phase) * particle.amplitude * 0.5;
      }

      // Mouse influence
      const dx = mouseRef.current.x - particle.baseX;
      const dy = mouseRef.current.y - particle.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;

      let mouseOffsetX = 0;
      let mouseOffsetY = 0;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 30;
        mouseOffsetX = (dx / dist) * force;
        mouseOffsetY = (dy / dist) * force;
      }

      particle.x = particle.baseX + mouseOffsetX;
      particle.y = particle.baseY + waveY + mouseOffsetY;

      // Draw text
      ctx.font = `${particle.size}px 'Playfair Display', serif`;
      ctx.fillStyle = particle.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(particle.text, particle.x, particle.y);
    });

    // Draw center message
    const alpha = 0.3 + Math.sin(time * 0.5) * 0.1;
    ctx.font = "12px 'Source Serif 4', serif";
    ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
    ctx.textAlign = "center";
    ctx.fillText("Human + AI + Music = Symphony", centerX, height - 40);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawWave]);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    initParticles(rect.width, rect.height);
  }, [initParticles]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, handleMouseMove, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ opacity: 0.7 }}
    />
  );
}
