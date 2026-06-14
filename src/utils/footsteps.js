import { useAudioStore } from "../Experience/stores/audioStore";

// A footstep is a short burst of low-passed noise that decays quickly — a soft
// muffled thump. It is synthesised with the Web Audio API rather than shipped
// as a sound file: it keeps the bundle and asset list lean and avoids licensing
// a clip for a sound the character makes many times a second. The howler-based
// SFX in audioSystem.js stay file-backed; this one effect is procedural.
let context = null;

export const playFootstep = () => {
  if (!useAudioStore.getState().isAudioEnabled) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!context) context = new AudioCtx();

  const duration = 0.09;
  const sampleCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i += 1) {
    // White noise shaped by a cubic decay so it lands as a quick thump.
    const decay = 1 - i / sampleCount;
    samples[i] = (Math.random() * 2 - 1) * decay * decay * decay;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  const gain = context.createGain();
  gain.gain.value = 0.22;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();
};
