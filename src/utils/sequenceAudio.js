// File: src/utils/sequenceAudio.js
//
// Sentience world — procedural shatter sound for the walkthrough.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add procedural block-break sound.
//
// A short, crunchy noise burst played when a structure shatters. Synthesised
// with the Web Audio API (like utils/footsteps.js) to keep the asset list lean,
// and gated on the shared audio-enabled flag so the mute toggle silences it.

import { useAudioStore } from "../Experience/stores/audioStore";

let context = null;

/** playBlockBreak plays a one-shot shatter: a noise burst with a low thud. */
export const playBlockBreak = () => {
  if (!useAudioStore.getState().isAudioEnabled) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!context) context = new AudioCtx();

  const duration = 0.45;
  const sampleCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i += 1) {
    // Noise with a sharp attack and a longer crunchy tail.
    const decay = 1 - i / sampleCount;
    samples[i] = (Math.random() * 2 - 1) * decay * decay;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.7;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.5, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();
};
