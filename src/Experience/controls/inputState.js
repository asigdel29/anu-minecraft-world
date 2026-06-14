// Shared movement input, written by the keyboard hook and the on-screen
// joystick and read by the character controller each frame.
//
// It is a single mutable object, never React state: the controller reads it in
// its own `useFrame`, so keeping it out of state avoids a re-render on every key
// or thumb move, and a shared object lets the keyboard and touch controls drive
// the same controller without either knowing about the other.
export const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  run: false,
  interact: false,
};

export const resetInput = () => {
  Object.keys(input).forEach((action) => {
    input[action] = false;
  });
};
