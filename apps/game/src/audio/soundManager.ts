let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playTone(
  type: OscillatorType,
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number
) {
  const ac = getContext();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ac.currentTime);
  osc.frequency.linearRampToValueAtTime(endFreq, ac.currentTime + duration);
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

export function playShellPickup() {
  playTone('square', 800, 1200, 0.1, 0.15);
}

export function playTideStart() {
  playTone('sawtooth', 120, 60, 0.5, 0.2);
}

export function playGameOver() {
  playTone('triangle', 440, 150, 0.6, 0.2);
}

export function playWaveSurvived() {
  const ac = getContext();
  const t = ac.currentTime;

  // First note: C5
  const osc1 = ac.createOscillator();
  const gain1 = ac.createGain();
  osc1.type = 'square';
  osc1.frequency.value = 523;
  gain1.gain.setValueAtTime(0.15, t);
  gain1.gain.linearRampToValueAtTime(0, t + 0.1);
  osc1.connect(gain1);
  gain1.connect(ac.destination);
  osc1.start(t);
  osc1.stop(t + 0.1);

  // Second note: E5
  const osc2 = ac.createOscillator();
  const gain2 = ac.createGain();
  osc2.type = 'square';
  osc2.frequency.value = 659;
  gain2.gain.setValueAtTime(0.15, t + 0.1);
  gain2.gain.linearRampToValueAtTime(0, t + 0.25);
  osc2.connect(gain2);
  gain2.connect(ac.destination);
  osc2.start(t + 0.1);
  osc2.stop(t + 0.25);
}
