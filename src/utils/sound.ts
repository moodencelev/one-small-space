/**
 * Pleasant, gentle Web Audio synthesizer for calm feedback
 * No external audio files needed; pure sine/triangle peaceful chords.
 */

class SoundController {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Gentle completion chime: soft harp/kalimba major 3rd note pair
   */
  playStepComplete(volume = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15 * volume, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.7);
      });
    } catch {
      // Audio playback silently ignored if blocked by browser policy
    }
  }

  /**
   * Soothing singing bowl chime when session finishes or timer completes
   */
  playSessionComplete(volume = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Singing bowl harmonic layers
      const freqs = [440, 880, 1320];

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime((0.2 / (idx + 1)) * volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.3);
      });
    } catch {
      // Audio playback silently ignored
    }
  }

  /**
   * Subtle soft click for buttons/timer ticks
   */
  playSoftTap(volume = 0.3) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

      gain.gain.setValueAtTime(0.08 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio playback silently ignored
    }
  }
}

export const sound = new SoundController();
