// Audio utility for managing sound effects and background music

type SoundType = "hover" | "click" | "transition" | "success";

interface AudioConfig {
  volume: number;
  isMuted: boolean;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig = {
    volume: 0.3,
    isMuted: false,
  };
  private bgMusic: HTMLAudioElement | null = null;
  private initialized = false;

  // Musical frequencies (pentatonic scale for pleasant sounds)
  private frequencies = {
    hover: 523.25, // C5
    click: 659.25, // E5
    transition: 783.99, // G5
    success: 1046.5, // C6
  };

  async init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  private async ensureContext() {
    if (!this.audioContext) {
      await this.init();
    }
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  // Play a simple tone (for hover/click effects)
  async playTone(type: SoundType, duration = 0.1) {
    if (this.config.isMuted || !this.audioContext) return;

    await this.ensureContext();

    const ctx = this.audioContext;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(this.frequencies[type], ctx.currentTime);

    // Quick fade in/out for smooth sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      this.config.volume * 0.3,
      ctx.currentTime + 0.01
    );
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // Play pizzicato-like sound (plucked string)
  async playPizzicato(frequency = 440) {
    if (this.config.isMuted || !this.audioContext) return;

    await this.ensureContext();

    const ctx = this.audioContext;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Pizzicato envelope - quick attack, fast decay
    gainNode.gain.setValueAtTime(this.config.volume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  }

  // Play chord (multiple notes)
  async playChord(frequencies: number[]) {
    if (this.config.isMuted) return;

    await Promise.all(frequencies.map((f) => this.playPizzicato(f)));
  }

  // Background music control
  async loadBackgroundMusic(url: string) {
    this.bgMusic = new Audio(url);
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.config.volume * 0.5;
  }

  async playBackgroundMusic() {
    if (this.config.isMuted || !this.bgMusic) return;

    try {
      await this.bgMusic.play();
    } catch (e) {
      console.warn("Failed to play background music:", e);
    }
  }

  pauseBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  // Volume and mute controls
  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.config.volume * 0.5;
    }
  }

  setMuted(muted: boolean) {
    this.config.isMuted = muted;
    if (muted) {
      this.pauseBackgroundMusic();
    }
  }

  toggleMute() {
    this.setMuted(!this.config.isMuted);
    return this.config.isMuted;
  }

  isMuted() {
    return this.config.isMuted;
  }

  getVolume() {
    return this.config.volume;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Hook-friendly sound functions
export const playHoverSound = () => audioManager.playTone("hover", 0.08);
export const playClickSound = () => audioManager.playTone("click", 0.12);
export const playTransitionSound = () => audioManager.playTone("transition", 0.2);
export const playSuccessSound = () =>
  audioManager.playChord([523.25, 659.25, 783.99]); // C major chord
