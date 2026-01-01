"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * V3: 과감한 버전
 * - 채워진 바이올린 실루엣 (그라데이션)
 * - 파티클이 바이올린을 따라 궤도 운동
 * - 전체가 호흡하듯 펄싱
 * - 사운드 웨이브가 바이올린에서 방출
 */

const LAYERS = {
  human: {
    texts: ["안녕", "음악", "연결", "사람", "목소리", "마음", "감정", "공감", "대화", "이해"],
    color: "#FFFDD0",
    orbitRadius: 180,
    orbitSpeed: 0.3,
  },
  ai: {
    texts: ["01", "10", "{ }", "=>", "const", "async", "function", "return", "await", "import"],
    color: "#D4AF37",
    orbitRadius: 220,
    orbitSpeed: -0.4,
  },
  music: {
    texts: ["♩", "♪", "♫", "♬", "𝄞", "♭", "♯", "𝄢", "𝆕", "𝆔"],
    color: "#FF6B6B",
    orbitRadius: 260,
    orbitSpeed: 0.25,
  },
};

interface Particle {
  text: string;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  size: number;
  layer: string;
  phaseOffset: number;
}

export default function FrequencyWavesV3() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const timeRef = useRef(0);

  const initParticles = useCallback(() => {
    const particles: Particle[] = [];

    Object.entries(LAYERS).forEach(([layerName, layer]) => {
      layer.texts.forEach((text, textIndex) => {
        particles.push({
          text,
          color: layer.color,
          orbitRadius: layer.orbitRadius + (Math.random() - 0.5) * 40,
          orbitSpeed: layer.orbitSpeed * (0.8 + Math.random() * 0.4),
          angle: (textIndex / layer.texts.length) * Math.PI * 2,
          size: 16 + Math.random() * 12,
          layer: layerName,
          phaseOffset: Math.random() * Math.PI * 2,
        });
      });
    });

    particlesRef.current = particles;
  }, []);

  // Draw violin shape
  const drawViolin = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    time: number
  ) => {
    // Breathing effect
    const breathe = 1 + Math.sin(time * 0.5) * 0.03;
    const s = scale * breathe;

    // Create gradient fill
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 200 * s
    );
    gradient.addColorStop(0, "rgba(212, 175, 55, 0.15)");
    gradient.addColorStop(0.5, "rgba(101, 0, 11, 0.1)");
    gradient.addColorStop(1, "rgba(101, 0, 11, 0)");

    // Draw filled violin body
    ctx.beginPath();

    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      const waveOffset = Math.sin(time * 2 + t * 4) * 5 * s;

      // Violin shape with waist
      const waist = 0.65 + 0.35 * Math.cos(t * 2);
      const x = centerX + (Math.cos(t) * 130 * waist + waveOffset) * s;
      const y = centerY + Math.sin(t) * 180 * s * 0.85;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Glowing outline
    ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw f-holes
    const drawFHole = (offsetX: number, flip: boolean) => {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(12, 4, 4, 0.4)";
      ctx.lineWidth = 3;

      const fx = centerX + offsetX * s * (flip ? -1 : 1);
      const fy = centerY;

      ctx.moveTo(fx, fy - 40 * s);
      ctx.quadraticCurveTo(fx + (flip ? -15 : 15) * s, fy, fx, fy + 40 * s);
      ctx.stroke();
    };

    drawFHole(40, false);
    drawFHole(40, true);

    // Draw neck
    ctx.beginPath();
    ctx.fillStyle = "rgba(212, 175, 55, 0.2)";
    ctx.fillRect(centerX - 8 * s, centerY - 220 * s, 16 * s, 80 * s);

    // Draw strings
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 + i * 0.1})`;
      ctx.lineWidth = 1.5 - i * 0.2;

      const stringX = centerX - 12 * s + i * 8 * s;
      const vibration = Math.sin(time * (8 + i * 2) + i) * (3 - i * 0.5) * s;

      ctx.moveTo(stringX, centerY - 140 * s);
      ctx.bezierCurveTo(
        stringX + vibration, centerY - 50 * s,
        stringX - vibration, centerY + 50 * s,
        stringX, centerY + 120 * s
      );
      ctx.stroke();
    }
  }, []);

  // Draw radiating sound waves
  const drawSoundWaves = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    time: number
  ) => {
    const numWaves = 5;

    for (let i = 0; i < numWaves; i++) {
      const progress = ((time * 0.3 + i / numWaves) % 1);
      const radius = 100 + progress * 300;
      const opacity = (1 - progress) * 0.3;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
      ctx.lineWidth = 2;

      // Wavy circle
      for (let j = 0; j <= 60; j++) {
        const angle = (j / 60) * Math.PI * 2;
        const waveR = radius + Math.sin(angle * 8 + time * 3) * 10;
        const x = centerX + Math.cos(angle) * waveR;
        const y = centerY + Math.sin(angle) * waveR * 0.6;

        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.stroke();
    }
  }, []);

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

    // Draw radiating sound waves (behind violin)
    drawSoundWaves(ctx, centerX, centerY, time);

    // Draw violin
    drawViolin(ctx, centerX, centerY, 1, time);

    // Draw orbiting particles
    particlesRef.current.forEach((particle) => {
      // Update angle for orbit
      particle.angle += particle.orbitSpeed * 0.016;

      // Calculate position with elliptical orbit
      const breathe = 1 + Math.sin(time * 0.5 + particle.phaseOffset) * 0.1;
      const radiusX = particle.orbitRadius * breathe;
      const radiusY = particle.orbitRadius * 0.6 * breathe;

      const x = centerX + Math.cos(particle.angle) * radiusX;
      const y = centerY + Math.sin(particle.angle) * radiusY;

      // Pulse size
      const pulseSize = particle.size * (1 + Math.sin(time * 2 + particle.phaseOffset) * 0.15);

      // Draw glow
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 20;

      // Draw particle
      ctx.font = `bold ${pulseSize}px 'Playfair Display', serif`;
      ctx.fillStyle = particle.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(particle.text, x, y);

      ctx.shadowBlur = 0;

      // Draw orbit trail (fading dots)
      for (let trail = 1; trail <= 3; trail++) {
        const trailAngle = particle.angle - trail * 0.1 * Math.sign(particle.orbitSpeed);
        const trailX = centerX + Math.cos(trailAngle) * radiusX;
        const trailY = centerY + Math.sin(trailAngle) * radiusY;
        const trailOpacity = 0.3 - trail * 0.1;

        ctx.beginPath();
        ctx.fillStyle = particle.color.replace(")", `, ${trailOpacity})`).replace("rgb", "rgba");
        ctx.arc(trailX, trailY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Center message
    const messageOpacity = 0.6 + Math.sin(time) * 0.2;
    ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
    ctx.shadowBlur = 15;
    ctx.font = "bold 16px 'Source Serif 4', serif";
    ctx.fillStyle = `rgba(212, 175, 55, ${messageOpacity})`;
    ctx.textAlign = "center";
    ctx.fillText("✧ Human + AI + Music ✧", centerX, height - 60);
    ctx.font = "14px 'Source Serif 4', serif";
    ctx.fillText("= Symphony of Frequency =", centerX, height - 38);
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(animate);
  }, [drawViolin, drawSoundWaves]);

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

    initParticles();
  }, [initParticles]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
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
      style={{ opacity: 0.9 }}
    />
  );
}
