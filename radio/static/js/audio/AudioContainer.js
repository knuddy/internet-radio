import EnergyCalculator from "./EnergyCalculator.js";
import PeakDetect from "./PeakDetect.js";
import Amplitude from "./Amplitude.js";

export default class AudioContainer {
  constructor(src, processorPaths) {
    this.audio = document.body.appendChild(document.createElement('audio'));
    this.audio.crossOrigin = "anonymous";
    this.audio.volume = 1;
    this.audio.src = src;

    this.audioCtx = new AudioContext();

    this.audioSource = this.audioCtx.createMediaElementSource(this.audio);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.8;
    this.analyser.fftSize = 2048;

    this.audioSource.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    processorPaths.forEach((path) => {
      this.audioCtx.audioWorklet.addModule(path)
        .then(() => this.amplitude = new Amplitude(this.audioCtx, this.audioSource))
        .catch(() => Promise.resolve());
    });


    this.ec = new EnergyCalculator(this.analyser, this.audioCtx.sampleRate / 2);
    this.pd = new PeakDetect();


    this._ready = false;

    this.audio.oncanplay = function () {
      this.play();
      this._ready = true;
    }.bind(this);


    this.frameCount = 0;
    this.bpm = 0;
    this.pbtime = 0;
  }

  update() {
    this.ec.update();
    this.pd.update(this.ec);

    if (this.pd.isDetected) {
      this.bpm = this.frameCount - this.pbtime;
      this.pbtime = this.frameCount;
    } else {
      this.bpm *= 0.95;
    }

    this.frameCount++;
  }

  get ready() {
    return this._ready;
  }

  play() {
    this.audio.play()
      .then(_ => console.log("audio playback started"))
      .catch(error => console.error(error));
  }

  pause() {
    this.audio.pause();
  }

  get paused() {
    return this.audio.paused;
  }

}