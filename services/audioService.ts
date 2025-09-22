import { Howl } from 'howler';

class AudioService {
  private static instance: AudioService;
  private sounds: Map<string, Howl> = new Map();
  private volume: number = 1.0;

  private constructor() {
    this.initializeSounds();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initializeSounds(): void {
    const soundFiles = {
      success: '/sounds/success.mp3',
      failure: '/sounds/failure.mp3',
      click: '/sounds/click.mp3',
      complete: '/sounds/complete.mp3',
    };

    Object.entries(soundFiles).forEach(([key, src]) => {
      this.sounds.set(key, new Howl({
        src: [src],
        volume: this.volume,
        preload: true,
      }));
    });
  }

  public play(soundName: string): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    } else {
      console.warn(`Sound "${soundName}" not found`);
    }
  }

  public playSuccess(): void {
    this.play('success');
  }

  public playFailure(): void {
    this.play('failure');
  }

  public playClick(): void {
    this.play('click');
  }

  public playComplete(): void {
    this.play('complete');
  }

  public playLetter(letter: string): void {
    const letterSound = new Howl({
      src: [`/sounds/alphabet/${letter.toLowerCase()}.mp3`],
      volume: this.volume,
    });
    letterSound.play();
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume(this.volume);
    });
  }

  public getVolume(): number {
    return this.volume;
  }

  public stopAll(): void {
    this.sounds.forEach(sound => {
      sound.stop();
    });
  }
}

export const audioService = AudioService.getInstance();