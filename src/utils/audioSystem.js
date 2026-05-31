import { Howl } from "howler";
import { useAudioStore } from "../Experience/stores/audioStore";

// Create sound instances
const sounds = {
  buttonClick: new Howl({
    src: ["/audio/sfx/ButtonClick.mp3"],
    volume: 1.0,
  }),
  doorOpening: new Howl({
    src: ["/audio/sfx/DoorOpening.mp3"],
    volume: 0.4,
  }),
  doorClosing: new Howl({
    src: ["/audio/sfx/DoorClosing.mp3"],
    volume: 0.4,
  }),
  backgroundMusic: new Howl({
    src: ["/audio/music/Sweden.mp3"],
    loop: true,
    volume: 1.0,
  }),
};

// Audio control functions
export const playSound = (soundId) => {
  if (!useAudioStore.getState().isAudioEnabled) return;
  sounds[soundId]?.play();
};

export const stopSound = (soundId) => {
  sounds[soundId]?.stop();
};

export const pauseSound = (soundId) => {
  sounds[soundId]?.pause();
};

export const resumeSound = (soundId) => {
  if (!useAudioStore.getState().isAudioEnabled) return;
  sounds[soundId]?.play();
};

// Background music controls
export const playBackgroundMusic = () => {
  sounds.backgroundMusic.play();
};

export const stopBackgroundMusic = () => {
  sounds.backgroundMusic.stop();
};

export const pauseBackgroundMusic = () => {
  sounds.backgroundMusic.pause();
};

// Volume controls
export const setVolume = (soundId, volume) => {
  sounds[soundId]?.volume(volume);
};

export const setGlobalVolume = (volume) => {
  Howler.volume(volume);
};

// Mute controls
export const muteAll = () => {
  Howler.mute(true);
};

export const unmuteAll = () => {
  Howler.mute(false);
};

// Export sounds object for direct access if needed
export { sounds };
