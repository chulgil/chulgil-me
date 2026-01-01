"use client";

/**
 * String Quartet V4 - Interactive Performance
 * 클릭으로 연주, 동기화된 앙상블 애니메이션,
 * 리듬 시각화, 웨이브폼 표현
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { audioManager } from "@/lib/audio";

interface StringQuartetV4Props {
  className?: string;
}

// Open string notes with harmonics
const INSTRUMENT_DATA = {
  violin1: {
    note: "E",
    frequencies: [659.25, 1318.5, 987.77, 1975.5], // E5 + harmonics
    color: "#FFD700",
    position: { xRatio: -0.225, yRatio: -0.05 },
  },
  violin2: {
    note: "A",
    frequencies: [440, 880, 660, 1320], // A4 + harmonics
    color: "#FF8C00",
    position: { xRatio: 0.225, yRatio: -0.05 },
  },
  viola: {
    note: "D",
    frequencies: [293.66, 587.33, 440, 880], // D4 + harmonics
    color: "#9B59B6",
    position: { xRatio: -0.075, yRatio: 0.05 },
  },
  cello: {
    note: "G",
    frequencies: [196, 392, 293.66, 587.33], // G3 + harmonics
    color: "#E74C3C",
    position: { xRatio: 0.1125, yRatio: 0.1125 },
  },
};

interface InstrumentState {
  hover: boolean;
  playing: boolean;
  stringVibration: number[];
  waveAmplitude: number;
  playStartTime: number;
}

interface WavePoint {
  x: number;
  y: number;
  amplitude: number;
  frequency: number;
  phase: number;
  color: string;
}

export default function StringQuartetV4({ className = "" }: StringQuartetV4Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [activeInstruments, setActiveInstruments] = useState<Set<string>>(new Set());
  const [isEnsembleMode, setIsEnsembleMode] = useState(false);
  const wavePointsRef = useRef<WavePoint[]>([]);

  const instrumentStates = useRef<Record<string, InstrumentState>>({
    violin1: { hover: false, playing: false, stringVibration: [0, 0, 0, 0], waveAmplitude: 0, playStartTime: 0 },
    violin2: { hover: false, playing: false, stringVibration: [0, 0, 0, 0], waveAmplitude: 0, playStartTime: 0 },
    viola: { hover: false, playing: false, stringVibration: [0, 0, 0, 0], waveAmplitude: 0, playStartTime: 0 },
    cello: { hover: false, playing: false, stringVibration: [0, 0, 0, 0], waveAmplitude: 0, playStartTime: 0 },
  });

  const playInstrument = useCallback(async (name: string) => {
    await audioManager.init();
    if (audioManager.isMuted()) return;

    const data = INSTRUMENT_DATA[name as keyof typeof INSTRUMENT_DATA];
    if (!data) return;

    const ctx = (audioManager as any).audioContext;
    if (!ctx || ctx.state === "suspended") return;

    const state = instrumentStates.current[name];
    state.playing = true;
    state.playStartTime = timeRef.current;
    state.waveAmplitude = 1;

    // Add wave points
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const pos = getPositions(rect.width, rect.height);
      const p = pos[name as keyof typeof pos];

      data.frequencies.forEach((freq, i) => {
        wavePointsRef.current.push({
          x: p.x,
          y: p.y,
          amplitude: 50 - i * 10,
          frequency: freq / 500,
          phase: Math.random() * Math.PI * 2,
          color: data.color,
        });
      });
    }

    // Play arpeggio
    data.frequencies.forEach((freq, i) => {
      setTimeout(() => {
        playNote(ctx, freq, 0.8, 0.12);
      }, i * 80);
    });

    // Auto-stop after duration
    setTimeout(() => {
      state.playing = false;
    }, 1500);

    setActiveInstruments((prev) => new Set([...prev, name]));
    setTimeout(() => {
      setActiveInstruments((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }, 1500);
  }, []);

  const playEnsemble = useCallback(async () => {
    setIsEnsembleMode(true);

    // Staggered entry like real quartet
    const order = ["cello", "viola", "violin2", "violin1"];
    order.forEach((name, i) => {
      setTimeout(() => playInstrument(name), i * 400);
    });

    setTimeout(() => setIsEnsembleMode(false), 3000);
  }, [playInstrument]);

  const getPositions = useCallback((w: number, h: number) => {
    const cx = w / 2, cy = h / 2, s = Math.min(w, h) / 800;
    return {
      violin1: { x: cx + INSTRUMENT_DATA.violin1.position.xRatio * w, y: cy + INSTRUMENT_DATA.violin1.position.yRatio * h, scale: s * 0.65, rot: -0.12 },
      violin2: { x: cx + INSTRUMENT_DATA.violin2.position.xRatio * w, y: cy + INSTRUMENT_DATA.violin2.position.yRatio * h, scale: s * 0.65, rot: 0.12 },
      viola: { x: cx + INSTRUMENT_DATA.viola.position.xRatio * w, y: cy + INSTRUMENT_DATA.viola.position.yRatio * h, scale: s * 0.75, rot: -0.08 },
      cello: { x: cx + INSTRUMENT_DATA.cello.position.xRatio * w, y: cy + INSTRUMENT_DATA.cello.position.yRatio * h, scale: s * 1.0, rot: 0.04 },
    };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const time = timeRef.current;

    // Dynamic background based on ensemble mode
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    if (isEnsembleMode) {
      bgGrad.addColorStop(0, "#2a1a3e");
      bgGrad.addColorStop(0.5, "#1a0a2e");
      bgGrad.addColorStop(1, "#0a0612");
    } else {
      bgGrad.addColorStop(0, "#1a1a2e");
      bgGrad.addColorStop(1, "#0a0a12");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Sound waves from active instruments
    wavePointsRef.current = wavePointsRef.current.filter((wave) => {
      wave.amplitude *= 0.97;
      if (wave.amplitude < 1) return false;

      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const wobble = Math.sin(angle * 8 + time * wave.frequency * 10) * 5;
        const r = wave.amplitude * (1 + Math.sin(time * 5) * 0.1) + wobble;
        const x = wave.x + Math.cos(angle) * r;
        const y = wave.y + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `${wave.color}${Math.floor(wave.amplitude * 2).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = 2;
      ctx.stroke();

      wave.amplitude += 2; // Expand
      return true;
    });

    // Waveform visualization at bottom
    const waveformY = h - 60;
    ctx.beginPath();
    ctx.moveTo(0, waveformY);
    for (let x = 0; x < w; x += 3) {
      let amplitude = 0;
      Object.entries(instrumentStates.current).forEach(([name, state]) => {
        if (state.playing) {
          const data = INSTRUMENT_DATA[name as keyof typeof INSTRUMENT_DATA];
          const elapsed = time - state.playStartTime;
          const decay = Math.exp(-elapsed * 0.5);
          amplitude += Math.sin(x * 0.05 + time * data.frequencies[0] / 100) * 15 * decay;
        }
      });
      ctx.lineTo(x, waveformY + amplitude);
    }
    ctx.lineTo(w, waveformY);
    ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Grid lines (music staff style)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let y = h * 0.3; y < h * 0.75; y += (h * 0.45) / 5) {
      ctx.beginPath();
      ctx.moveTo(w * 0.1, y);
      ctx.lineTo(w * 0.9, y);
      ctx.stroke();
    }

    const pos = getPositions(w, h);

    // Draw instruments
    Object.entries(pos).forEach(([name, p]) => {
      const state = instrumentStates.current[name];
      const data = INSTRUMENT_DATA[name as keyof typeof INSTRUMENT_DATA];
      const isViola = name === "viola";
      const isCello = name === "cello";

      // Decay wave amplitude
      state.waveAmplitude *= 0.95;

      ctx.save();
      ctx.translate(p.x, p.y);

      // Playing animation - bounce
      const playBounce = state.playing ? Math.sin(time * 15) * 5 * state.waveAmplitude : 0;
      ctx.translate(0, playBounce);

      ctx.rotate(p.rot + Math.sin(time * (state.playing ? 6 : 1.5)) * (state.playing ? 0.05 : 0.015));
      ctx.scale(p.scale * (isCello ? 1 : isViola ? 1.1 : 1), p.scale * (isCello ? 1 : isViola ? 1.1 : 1));

      // Glow effect when playing
      if (state.playing || state.hover) {
        const glowIntensity = state.playing ? 0.8 : 0.4;
        ctx.shadowColor = data.color;
        ctx.shadowBlur = 40 * glowIntensity;
      }

      // Rhythmic pulse ring
      if (state.playing) {
        const elapsed = time - state.playStartTime;
        for (let i = 0; i < 3; i++) {
          const ringRadius = (elapsed * 100 + i * 40) % 150;
          const ringAlpha = 0.4 * (1 - ringRadius / 150);
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `${data.color}${Math.floor(ringAlpha * 255).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      // Body
      if (isCello) {
        drawInteractiveCello(ctx, data.color, state, time);
      } else {
        drawInteractiveViolin(ctx, data.color, state, time, isViola);
      }

      ctx.shadowBlur = 0;

      // Note indicator
      ctx.font = "bold 24px 'Playfair Display', serif";
      ctx.fillStyle = state.playing ? data.color : "rgba(255, 255, 255, 0.3)";
      ctx.textAlign = "center";
      const noteY = isCello ? -180 : -140;
      ctx.fillText(data.note, 0, noteY);

      ctx.restore();
    });

    // Ensemble button
    const btnX = w / 2;
    const btnY = h - 30;
    const btnW = 140;
    const btnH = 36;

    ctx.fillStyle = isEnsembleMode
      ? "rgba(255, 215, 0, 0.3)"
      : "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.roundRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
    ctx.fill();

    ctx.strokeStyle = isEnsembleMode ? "#FFD700" : "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 13px 'Playfair Display', serif";
    ctx.fillStyle = isEnsembleMode ? "#FFD700" : "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♫ Play Ensemble ♫", btnX, btnY);

    // Instructions
    ctx.font = "12px 'Playfair Display', serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("Click any instrument to play • Click button for full quartet", w / 2, 25);
  }, [getPositions, isEnsembleMode]);

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

      Object.entries(pos).forEach(([name, p]) => {
        const dx = mx - p.x, dy = my - p.y;
        const r = name === "cello" ? 90 * p.scale : 60 * p.scale;
        instrumentStates.current[name].hover = Math.sqrt(dx * dx + dy * dy) < r;
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const pos = getPositions(rect.width, rect.height);

      // Check ensemble button
      const btnX = rect.width / 2;
      const btnY = rect.height - 30;
      if (Math.abs(mx - btnX) < 70 && Math.abs(my - btnY) < 18) {
        playEnsemble();
        return;
      }

      // Check instruments
      Object.entries(pos).forEach(([name, p]) => {
        const dx = mx - p.x, dy = my - p.y;
        const r = name === "cello" ? 90 * p.scale : 60 * p.scale;
        if (Math.sqrt(dx * dx + dy * dy) < r) {
          playInstrument(name);
        }
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;

      Object.values(instrumentStates.current).forEach((s) => {
        s.stringVibration = s.stringVibration.map((v, i) =>
          s.playing ? Math.sin(timeRef.current * (15 + i * 5)) * 4 : v * 0.88
        );
      });

      draw(ctx, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [draw, getPositions, playInstrument, playEnsemble]);

  return <canvas ref={canvasRef} className={`w-full h-full min-h-[400px] cursor-pointer ${className}`} />;
}

function drawInteractiveViolin(
  ctx: CanvasRenderingContext2D,
  color: string,
  state: InstrumentState,
  time: number,
  isViola: boolean
) {
  // Body shape
  ctx.beginPath();
  ctx.moveTo(0, -110);
  ctx.bezierCurveTo(42, -110, 55, -75, 50, -38);
  ctx.bezierCurveTo(45, -12, 36, 8, 44, 28);
  ctx.bezierCurveTo(55, 55, 65, 92, 46, 115);
  ctx.bezierCurveTo(22, 135, -22, 135, -46, 115);
  ctx.bezierCurveTo(-65, 92, -55, 55, -44, 28);
  ctx.bezierCurveTo(-36, 8, -45, -12, -50, -38);
  ctx.bezierCurveTo(-55, -75, -42, -110, 0, -110);
  ctx.closePath();

  // Gradient with color influence
  const bodyGrad = ctx.createRadialGradient(-12, -25, 0, 0, 0, 90);
  if (state.playing) {
    bodyGrad.addColorStop(0, "#FFE4B5");
    bodyGrad.addColorStop(0.5, color);
    bodyGrad.addColorStop(1, "#5D3A1A");
  } else {
    bodyGrad.addColorStop(0, "#DEB887");
    bodyGrad.addColorStop(0.5, isViola ? "#6B4423" : "#CD853F");
    bodyGrad.addColorStop(1, "#5D3A1A");
  }
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Shine
  const shine = ctx.createRadialGradient(-12, -25, 0, 0, 0, 90);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  // Animated border when playing
  if (state.playing) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = -time * 50;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // F-holes
  ctx.strokeStyle = state.playing ? color : "#2F1810";
  ctx.lineWidth = 2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 18, -22);
    ctx.bezierCurveTo(side * 22, -4, side * 22, 22, side * 18, 40);
    ctx.stroke();
  });

  // Bridge & Neck
  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-20, 48, 40, 6);
  ctx.fillRect(-7, -175, 14, 75);
  ctx.fillStyle = "#2F1810";
  ctx.fillRect(-9, -165, 18, 60);

  // Strings with intense vibration when playing
  const stringX = [-6, -2, 2, 6];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    // Glow trail when vibrating
    if (state.playing && Math.abs(vib) > 1) {
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, -130);
      for (let y = -130; y <= 100; y += 5) {
        const wave = Math.sin((y + time * 80) * 0.2) * vib;
        ctx.lineTo(x + wave, y);
      }
      ctx.stroke();
    }

    // Main string
    ctx.strokeStyle = state.playing ? color : `rgba(180, 180, 180, ${0.9 - i * 0.1})`;
    ctx.lineWidth = state.playing ? 1.5 : 1 - i * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, -130);
    for (let y = -130; y <= 100; y += 5) {
      const wave = Math.sin((y + time * 60) * 0.15) * vib * 0.5;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
  });
}

function drawInteractiveCello(
  ctx: CanvasRenderingContext2D,
  color: string,
  state: InstrumentState,
  time: number
) {
  ctx.beginPath();
  ctx.moveTo(0, -140);
  ctx.bezierCurveTo(55, -140, 72, -92, 68, -46);
  ctx.bezierCurveTo(63, -18, 50, 9, 58, 42);
  ctx.bezierCurveTo(72, 78, 86, 120, 63, 152);
  ctx.bezierCurveTo(36, 180, -36, 180, -63, 152);
  ctx.bezierCurveTo(-86, 120, -72, 78, -58, 42);
  ctx.bezierCurveTo(-50, 9, -63, -18, -68, -46);
  ctx.bezierCurveTo(-72, -92, -55, -140, 0, -140);
  ctx.closePath();

  const bodyGrad = ctx.createRadialGradient(-18, -35, 0, 0, 0, 130);
  if (state.playing) {
    bodyGrad.addColorStop(0, "#FFE4B5");
    bodyGrad.addColorStop(0.5, color);
    bodyGrad.addColorStop(1, "#5D3A1A");
  } else {
    bodyGrad.addColorStop(0, "#DEB887");
    bodyGrad.addColorStop(0.5, "#B8860B");
    bodyGrad.addColorStop(1, "#6B4423");
  }
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  const shine = ctx.createRadialGradient(-18, -35, 0, 0, 0, 130);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fill();

  if (state.playing) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 6]);
    ctx.lineDashOffset = -time * 40;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = state.playing ? color : "#2F1810";
  ctx.lineWidth = 2.5;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 25, -28);
    ctx.bezierCurveTo(side * 30, 0, side * 30, 35, side * 25, 62);
    ctx.stroke();
  });

  ctx.fillStyle = "#4a3728";
  ctx.fillRect(-28, 68, 56, 8);
  ctx.fillRect(-10, -230, 20, 100);
  ctx.fillStyle = "#2F1810";
  ctx.fillRect(-12, -220, 24, 75);

  ctx.strokeStyle = "#A9A9A9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 165);
  ctx.lineTo(0, 210);
  ctx.stroke();

  const stringX = [-9, -3, 3, 9];
  stringX.forEach((x, i) => {
    const vib = state.stringVibration[i] || 0;

    if (state.playing && Math.abs(vib) > 1) {
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, -210);
      for (let y = -210; y <= 140; y += 8) {
        const wave = Math.sin((y + time * 60) * 0.12) * vib * 1.3;
        ctx.lineTo(x + wave, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = state.playing ? color : `rgba(160, 160, 160, ${0.9 - i * 0.1})`;
    ctx.lineWidth = state.playing ? 1.8 : 1.4 - i * 0.15;
    ctx.beginPath();
    ctx.moveTo(x, -210);
    for (let y = -210; y <= 140; y += 8) {
      const wave = Math.sin((y + time * 40) * 0.1) * vib * 0.6;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
  });
}

function playNote(ctx: AudioContext, freq: number, dur: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.1);
}
