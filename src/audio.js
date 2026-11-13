import { voice, texts, soundEffects, music } from "./content.js";

export class BookAudio {
  constructor(settings, onVoice) {
    this.settings = settings;
    this.onVoice = onVoice;
    this.voice = new Audio();
    this.piano = new Audio(music.piano);
    this.song = new Audio(music.song);
    this.voice.preload = "none";
    this.piano.preload = "none";
    this.song.preload = "none";
    this.voice.volume = 0.87;
    this.piano.volume = 0.23;
    this.song.volume = 0.78;
    this.effects = new Set();
    this.buffers = new Map();
    this.voiceId = "";
    this.voiceUntil = 0;
    this.sync();
  }

  async play(element) {
    try {
      await element.play();
      return true;
    } catch {
      return false;
    }
  }

  unlock() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext && !this.context) {
      this.context = new AudioContext();
      this.gain = this.context.createGain();
      this.gain.gain.value = this.settings.sound ? 1 : 0;
      this.gain.connect(this.context.destination);
      for (const [name, url] of Object.entries(soundEffects)) {
        fetch(url)
          .then((response) => response.arrayBuffer())
          .then((data) => this.context.decodeAudioData(data))
          .then((buffer) => this.buffers.set(name, buffer))
          .catch(() => {});
      }
    }
    this.context?.resume().catch(() => {});
  }

  speak(id) {
    this.stopVoice();
    this.voiceId = id;
    this.voiceUntil =
      performance.now() + Math.max(3000, (texts[id]?.length || 8) * 190);
    this.onVoice?.(texts[id] || "");
    if (!this.settings.sound || !voice[id]) return;
    this.voice.src = voice[id];
    this.play(this.voice);
  }

  get speaking() {
    return this.settings.sound && !this.voice.paused && !this.voice.ended;
  }

  get caption() {
    return this.speaking || performance.now() < this.voiceUntil
      ? texts[this.voiceId] || ""
      : "";
  }

  stopVoice() {
    this.voice.pause();
    this.voiceId = "";
    this.voiceUntil = 0;
  }

  effect(name, volume = 0.35) {
    if (!this.settings.sound || !soundEffects[name]) return;
    if (this.context?.state === "running" && this.buffers.has(name)) {
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = this.buffers.get(name);
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(this.gain);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
      source.start();
    } else {
      const effect = new Audio(soundEffects[name]);
      effect.volume = volume;
      this.effects.add(effect);
      effect.onended = () => this.effects.delete(effect);
      this.play(effect).then((played) => {
        if (!played) this.effects.delete(effect);
      });
    }
  }

  sync() {
    const muted = !this.settings.sound;
    for (const element of [this.voice, this.piano, this.song, ...this.effects])
      element.muted = muted;
    if (this.gain) this.gain.gain.value = muted ? 0 : 1;
  }

  stopMusic() {
    this.piano.pause();
    this.song.pause();
  }
}
