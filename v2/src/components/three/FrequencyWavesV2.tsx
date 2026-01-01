"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * V2: 더 대담한 버전
 * - 더 큰 파티클과 강렬한 색상
 * - 명확한 바이올린 윤곽
 * - 파형이 바이올린 형태를 따라 흐름
 */

const LAYERS = {
  human: {
    texts: ["안녕", "음악", "연결", "사람", "목소리", "마음", "감정", "공감"],
    color: "#FFFDD0",
    glowColor: "rgba(255, 253, 208, 0.6)",
    frequency: 0.003,
    amplitude: 40,
  },
  ai: {
    texts: ["01", "10", "{ }", "=>", "const", "async", "function", "return"],
    color: "#D4AF37",
    glowColor: "rgba(212, 175, 55, 0.6)",
    frequency: 0.01,
    amplitude: 25,
  },
  music: {
    texts: ["♩", "♪", "♫", "♬", "𝄞", "♭", "♯", "𝄢"],
    color: "#8B0000",
    glowColor: "rgba(139, 0, 0, 0.6)",
    frequency: 0.005,
    amplitude: 35,
  },
};

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  text: string;
  color: string;
  glowColor: string;
  frequency: number;
  amplitude: number;
  phase: number;
  size: number;
  layer: string;
  angle: number;
}

export default function FrequencyWavesV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Generate violin path points
  const getViolinPath = useCallback((centerX: number, centerY: number, scale: number = 1) => {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;

      // Violin body shape - more defined
      const bodyWidth = 140 * scale;
      const bodyHeight = 200 * scale;
      const waist = 0.7 + 0.3 * Math.cos(t * 2);

      const x = centerX + Math.cos(t) * bodyWidth * waist;
      const y = centerY + Math.sin(t) * bodyHeight * 0.8;

      points.push({ x, y });
    }

    return points;
  }, []);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const violinPath = getViolinPath(centerX, centerY, 1);

    Object.entries(LAYERS).forEach(([layerName, layer], layerIndex) => {
      layer.texts.forEach((text, textIndex) => {
        // Place particles along violin path
        const pathIndex = Math.floor((textIndex / layer.texts.length) * violinPath.length);
        const point = violinPath[pathIndex % violinPath.length];

        // Add some randomness
        const offsetX = (Math.random() - 0.5) * 80;
        const offsetY = (Math.random() - 0.5) * 80;

        particles.push({
          x: point.x + offsetX,
          y: point.y + offsetY,
          baseX: point.x + offsetX,
          baseY: point.y + offsetY,
          text,
          color: layer.color,
          glowColor: layer.glowColor,
          frequency: layer.frequency + Math.random() * 0.002,
          amplitude: layer.amplitude + Math.random() * 15,
          phase: (textIndex / layer.texts.length) * Math.PI * 2,
          size: 18 + Math.random() * 14,
          layer: layerName,
          angle: (pathIndex / violinPath.length) * Math.PI * 2,
        });
      });
    });

    particlesRef.current = particles;
  }, [getViolinPath]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const centerX = width / 2;
    const centerY = height / 2;

    timeRef.current += 0.016;
    const time = timeRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw violin outline with flowing waves
    const violinPath = getViolinPath(centerX, centerY, 1);

    // Multiple wave layers on violin outline
    [0.3, 0.5, 0.7].forEach((opacity, waveIndex) => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
      ctx.lineWidth = 3 - waveIndex;

      violinPath.forEach((point, i) => {
        const waveOffset = Math.sin(time * 2 + i * 0.1 + waveIndex) * (10 - waveIndex * 3);
        const angle = Math.atan2(point.y - centerY, point.x - centerX);

        const x = point.x + Math.cos(angle) * waveOffset;
        const y = point.y + Math.sin(angle) * waveOffset;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.closePath();
      ctx.stroke();
    });

    // Draw violin neck
    ctx.beginPath();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 2;
    ctx.moveTo(centerX, centerY - 160);
    ctx.lineTo(centerX, centerY - 280);
    ctx.stroke();

    // Draw strings (4 lines)
    for (let s = 0; s < 4; s++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.3 + s * 0.1})`;
      ctx.lineWidth = 1;

      const stringX = centerX - 15 + s * 10;
      const stringWave = Math.sin(time * (3 + s) + s) * 3;

      ctx.moveTo(stringX, centerY - 100);
      ctx.quadraticCurveTo(stringX + stringWave, centerY, stringX, centerY + 100);
      ctx.stroke();
    }

    // Draw flowing wave lines through center
    const waveColors = ["rgba(255, 253, 208, 0.3)", "rgba(212, 175, 55, 0.3)", "rgba(139, 0, 0, 0.3)"];
    waveColors.forEach((color, waveIndex) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for (let x = 0; x < width; x += 3) {
        const waveY = centerY + Math.sin(x * 0.02 + time * (1 + waveIndex * 0.5)) * 30 * (1 + waveIndex * 0.3);
        const offsetY = (waveIndex - 1) * 50;

        if (x === 0) ctx.moveTo(x, waveY + offsetY);
        else ctx.lineTo(x, waveY + offsetY);
      }

      ctx.stroke();
    });

    // Update and draw particles with glow
    particlesRef.current.forEach((particle) => {
      const waveY = Math.sin(time * 2 + particle.phase) * particle.amplitude * 0.4;
      const waveX = Math.cos(time * 1.5 + particle.phase) * particle.amplitude * 0.2;

      // Mouse influence
      const dx = mouseRef.current.x - particle.baseX;
      const dy = mouseRef.current.y - particle.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 200;

      let mouseOffsetX = 0;
      let mouseOffsetY = 0;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 50;
        mouseOffsetX = (dx / dist) * force;
        mouseOffsetY = (dy / dist) * force;
      }

      particle.x = particle.baseX + waveX + mouseOffsetX;
      particle.y = particle.baseY + waveY + mouseOffsetY;

      // Draw glow
      ctx.shadowColor = particle.glowColor;
      ctx.shadowBlur = 15;

      // Draw text
      ctx.font = `bold ${particle.size}px 'Playfair Display', serif`;
      ctx.fillStyle = particle.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(particle.text, particle.x, particle.y);

      ctx.shadowBlur = 0;
    });

    // Center message with glow
    ctx.shadowColor = "rgba(212, 175, 55, 0.5)";
    ctx.shadowBlur = 10;
    ctx.font = "bold 14px 'Source Serif 4', serif";
    ctx.fillStyle = "rgba(212, 175, 55, 0.8)";
    ctx.textAlign = "center";
    ctx.fillText("Human + AI + Music = Symphony", centerX, height - 50);
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(animate);
  }, [getViolinPath]);

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
      style={{ opacity: 0.85 }}
    />
  );
}
