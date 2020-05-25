import UIfx from "uifx";

import tickTickSound from "./samples/ticktick.wav";

export default class HostAudio {
  constructor(volume) {
    this.volume = volume || 0.1;

    this.tickTickSound = new UIfx(tickTickSound, {
      volume: this.volume,
    });
  }

  tick() {
    this.tickTickSound.play();
  }
}
