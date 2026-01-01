"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * V4: 최대 실험적 버전
 * - 다중 바이올린 레이어 (3D 깊이감)
 * - 주파수 이퀄라이저 바
 * - 글리치/스캔라인 효과
 * - 파티클 폭발 & 재형성
 * - 추상적인 연결선
 * - 마우스 반응 왜곡
 */

const LAYERS = {
  human: {
    texts: ["안녕", "음악", "연결", "사람", "목소리", "마음", "감정", "공감", "대화", "이해", "사랑", "희망"],
    baseColor: { r: 255, g: 253, b: 208 },
  },
  ai: {
    texts: ["01", "10", "{ }", "=>", "const", "async", "function", "return", "await", "import", "class", "export"],
    baseColor: { r: 212, g: 175, b: 55 },
  },
  music: {
    texts: ["♩", "♪", "♫", "♬", "𝄞", "♭", "♯", "𝄢", "𝆕", "𝆔", "𝆓", "𝄾"],
    baseColor: { r: 255, g: 100, b: 100 },
  },
};

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  baseX: number;
  baseY: number;
  text: string;
  color: { r: number; g: number; b: number };
  size: number;
  layer: string;
  speed: number;
  phase: number;
  exploded: boolean;
  explosionVx: number;
  explosionVy: number;
}

export default function FrequencyWavesV4() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, clicked: false });
  const timeRef = useRef(0);
  const explosionRef = useRef(false);
  const glitchRef = useRef(0);

  // Generate violin shape points
  const getViolinPoints = useCallback((centerX: number, centerY: number, scale: number) => {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * Math.PI * 2;
      const waist = 0.6 + 0.4 * Math.cos(t * 2);
      const x = centerX + Math.cos(t) * 120 * waist * scale;
      const y = centerY + Math.sin(t) * 170 * scale * 0.85;
      points.push({ x, y });
    }

    return points;
  }, []);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const violinPoints = getViolinPoints(centerX, centerY, 1);

    Object.entries(LAYERS).forEach(([layerName, layer]) => {
      layer.texts.forEach((text, textIndex) => {
        const pointIndex = Math.floor((textIndex / layer.texts.length) * violinPoints.length);
        const point = violinPoints[pointIndex % violinPoints.length];

        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;

        particles.push({
          x: point.x + offsetX,
          y: point.y + offsetY,
          targetX: point.x + offsetX,
          targetY: point.y + offsetY,
          baseX: point.x + offsetX,
          baseY: point.y + offsetY,
          text,
          color: layer.baseColor,
          size: 14 + Math.random() * 14,
          layer: layerName,
          speed: 0.02 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
          exploded: false,
          explosionVx: 0,
          explosionVy: 0,
        });
      });
    });

    particlesRef.current = particles;
  }, [getViolinPoints]);

  // Draw multiple violin layers for 3D depth
  const drawViolinLayers = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    time: number,
    mouseX: number,
    mouseY: number
  ) => {
    const layers = [
      { scale: 1.3, opacity: 0.1, offsetX: -30, offsetY: -20 },
      { scale: 1.15, opacity: 0.15, offsetX: -15, offsetY: -10 },
      { scale: 1, opacity: 0.25, offsetX: 0, offsetY: 0 },
    ];

    // Parallax based on mouse
    const parallaxX = (mouseX - centerX) * 0.02;
    const parallaxY = (mouseY - centerY) * 0.02;

    layers.forEach((layer, index) => {
      const ox = layer.offsetX + parallaxX * (3 - index);
      const oy = layer.offsetY + parallaxY * (3 - index);

      ctx.beginPath();

      for (let i = 0; i <= 80; i++) {
        const t = (i / 80) * Math.PI * 2;
        const glitch = glitchRef.current > 0 ? (Math.random() - 0.5) * 10 : 0;
        const wave = Math.sin(time * 2 + t * 6) * 5;

        const waist = 0.6 + 0.4 * Math.cos(t * 2);
        const x = centerX + ox + (Math.cos(t) * 120 * waist * layer.scale) + wave + glitch;
        const y = centerY + oy + (Math.sin(t) * 170 * layer.scale * 0.85);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.strokeStyle = `rgba(212, 175, 55, ${layer.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fill innermost
      if (index === layers.length - 1) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        gradient.addColorStop(0, "rgba(212, 175, 55, 0.1)");
        gradient.addColorStop(1, "rgba(101, 0, 11, 0.05)");
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    });
  }, []);

  // Draw frequency equalizer bars
  const drawEqualizer = useCallback((
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    time: number
  ) => {
    const barCount = 32;
    const barWidth = 4;
    const maxHeight = 80;
    const startX = centerX - (barCount * barWidth) / 2;

    for (let i = 0; i < barCount; i++) {
      // Simulated frequency values
      const freq1 = Math.sin(time * 3 + i * 0.3) * 0.5 + 0.5;
      const freq2 = Math.sin(time * 5 + i * 0.5) * 0.3 + 0.3;
      const freq3 = Math.sin(time * 7 + i * 0.2) * 0.2 + 0.2;
      const height = (freq1 + freq2 + freq3) * maxHeight;

      const hue = 40 + (i / barCount) * 20; // Gold to amber
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.4)`;

      // Draw bar above violin
      ctx.fillRect(
        startX + i * barWidth,
        centerY - 220 - height,
        barWidth - 1,
        height
      );

      // Mirror below
      ctx.fillRect(
        startX + i * barWidth,
        centerY + 180,
        barWidth - 1,
        height * 0.5
      );
    }
  }, []);

  // Draw scan lines (glitch effect)
  const drawScanLines = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    if (glitchRef.current <= 0) return;

    ctx.fillStyle = "rgba(212, 175, 55, 0.03)";

    for (let y = 0; y < height; y += 4) {
      if (Math.random() > 0.7) {
        const offset = (Math.random() - 0.5) * 20;
        ctx.fillRect(offset, y, width, 1);
      }
    }

    // Random glitch blocks
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = 50 + Math.random() * 100;
      const h = 10 + Math.random() * 30;
      ctx.fillStyle = `rgba(212, 175, 55, ${Math.random() * 0.2})`;
      ctx.fillRect(x, y, w, h);
    }
  }, []);

  // Draw connections between particles
  const drawConnections = useCallback((
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    time: number
  ) => {
    const connectionDistance = 100;

    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach((p2) => {
        if (p1.layer === p2.layer) return; // Only connect different layers

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const opacity = (1 - dist / connectionDistance) * 0.3;
          const pulse = Math.sin(time * 3 + i * 0.1) * 0.5 + 0.5;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(212, 175, 55, ${opacity * pulse})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    });
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

    // Decrease glitch over time
    if (glitchRef.current > 0) {
      glitchRef.current -= 0.02;
    }

    // Random glitch trigger
    if (Math.random() < 0.002) {
      glitchRef.current = 0.5;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw equalizer (behind everything)
    drawEqualizer(ctx, centerX, centerY, time);

    // Draw violin layers with parallax
    drawViolinLayers(ctx, centerX, centerY, time, mouseRef.current.x, mouseRef.current.y);

    // Draw connections
    drawConnections(ctx, particlesRef.current, time);

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      if (particle.exploded) {
        // Explosion physics
        particle.x += particle.explosionVx;
        particle.y += particle.explosionVy;
        particle.explosionVx *= 0.98;
        particle.explosionVy *= 0.98;
        particle.explosionVy += 0.1; // Gravity

        // Return to position
        const dx = particle.baseX - particle.x;
        const dy = particle.baseY - particle.y;
        particle.x += dx * 0.01;
        particle.y += dy * 0.01;

        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          particle.exploded = false;
        }
      } else {
        // Normal floating animation
        const wave = Math.sin(time * 2 + particle.phase);
        particle.x = particle.baseX + wave * 15;
        particle.y = particle.baseY + Math.cos(time * 1.5 + particle.phase) * 10;
      }

      // Color shift based on time
      const colorShift = Math.sin(time + particle.phase) * 20;
      const r = Math.min(255, particle.color.r + colorShift);
      const g = Math.min(255, particle.color.g + colorShift * 0.5);
      const b = particle.color.b;

      // Draw with glow
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.shadowBlur = 15;

      ctx.font = `bold ${particle.size}px 'Playfair Display', serif`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(particle.text, particle.x, particle.y);

      ctx.shadowBlur = 0;
    });

    // Draw scan lines
    drawScanLines(ctx, width, height, time);

    // Animated center message
    const msgY = height - 45;
    const msgPulse = Math.sin(time * 2) * 3;

    ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
    ctx.shadowBlur = 20;
    ctx.font = "bold 18px 'Source Serif 4', serif";
    ctx.fillStyle = "rgba(212, 175, 55, 0.9)";
    ctx.textAlign = "center";
    ctx.fillText("⚡ FREQUENCY ⚡", centerX, msgY + msgPulse);
    ctx.font = "12px 'Source Serif 4', serif";
    ctx.fillStyle = "rgba(255, 253, 208, 0.7)";
    ctx.fillText("Human × AI × Music → Symphony", centerX, msgY + 20 + msgPulse);
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(animate);
  }, [drawViolinLayers, drawEqualizer, drawScanLines, drawConnections]);

  // Trigger explosion on click
  const handleClick = useCallback(() => {
    particlesRef.current.forEach((particle) => {
      particle.exploded = true;
      const angle = Math.random() * Math.PI * 2;
      const force = 5 + Math.random() * 10;
      particle.explosionVx = Math.cos(angle) * force;
      particle.explosionVy = Math.sin(angle) * force;
    });
    glitchRef.current = 1;
  }, []);

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
      clicked: mouseRef.current.clicked,
    };
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("click", handleClick);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (canvas) {
        canvas.removeEventListener("click", handleClick);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, handleMouseMove, handleClick, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer"
      style={{ opacity: 0.95 }}
    />
  );
}
