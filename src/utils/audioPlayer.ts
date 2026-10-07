/**
 * Web Audio API synthesizer for Azan & prayer notification tones.
 * Provides instant, zero-dependency, soothing Islamic melodic tone pattern.
 */

class AzanAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private stopCallback: (() => void) | null = null;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a melodious harmonic Azan phrase sequence (Maqam Bayati tone progression)
   */
  public playAzanPhrase(onEnd?: () => void): void {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    try {
      const ctx = this.getContext();
      this.isPlaying = true;
      this.stopCallback = onEnd || null;

      // Islamic Maqam Bayati / Hijaz melodic frequencies (D4, Eb4, F#4, G4, A4, Bb4, C5, D5)
      const notes = [
        { freq: 293.66, dur: 1.2 }, // D4 "Allahu"
        { freq: 329.63, dur: 1.0 }, // E4 "Akbar"
        { freq: 392.00, dur: 1.8 }, // G4 "Allahu"
        { freq: 369.99, dur: 2.2 }, // F#4 "Akbar"
        { freq: 293.66, dur: 1.4 }, // D4 "Ash-hadu"
        { freq: 392.00, dur: 1.5 }, // G4 "alla"
        { freq: 440.00, dur: 2.0 }, // A4 "ilaha"
        { freq: 392.00, dur: 2.5 }, // G4 "illallah"
      ];

      let startTime = ctx.currentTime + 0.1;

      notes.forEach((note, index) => {
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Flute / Nay warmth using warm sine + slight triangle harmonic
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, startTime);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(note.freq * 2, startTime);

        // Smooth envelope
        const noteDuration = note.dur;
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.35, startTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration - 0.05);

        osc.connect(gainNode);
        subOsc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(startTime);
        subOsc.start(startTime);
        osc.stop(startTime + noteDuration);
        subOsc.stop(startTime + noteDuration);

        startTime += noteDuration + 0.15;

        if (index === notes.length - 1) {
          setTimeout(() => {
            this.isPlaying = false;
            if (this.stopCallback) {
              this.stopCallback();
              this.stopCallback = null;
            }
          }, (startTime - ctx.currentTime) * 1000);
        }
      });
    } catch (e) {
      console.warn('Audio playback not supported or user gesture needed:', e);
      this.isPlaying = false;
    }
  }

  public stop(): void {
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.isPlaying = false;
    if (this.stopCallback) {
      this.stopCallback();
      this.stopCallback = null;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const azanAudio = new AzanAudioEngine();
