export default class PeakDetect {
  constructor(freq1 = 40, freq2 = 20000, threshold = 0.35, _framesPerPeak = 20) {
    this.framesPerPeak = _framesPerPeak;
    this.framesSinceLastPeak = 0;
    this.decayRate = 0.95;
    this.threshold = threshold;
    this.cutoff = 0;
    this.cutoffMult = 1.5;
    this.penergy = 0;
    this.isDetected = false;
    this.f1 = freq1;
    this.f2 = freq2;
  }

  update(energyCalculator) {
    let nrg = energyCalculator.getEnergy(this.f1, this.f2) / 255;
    this.isDetected = nrg > this.cutoff && nrg > this.threshold && nrg - this.penergy > 0;
    if (this.isDetected) {
      this.cutoff = nrg * this.cutoffMult;
      this.framesSinceLastPeak = 0;
    } else {
      if (this.framesSinceLastPeak <= this.framesPerPeak) {
        this.framesSinceLastPeak++;
      } else {
        this.cutoff *= this.decayRate;
        this.cutoff = Math.max(this.cutoff, this.threshold);
      }
    }

    this.penergy = nrg;
  }
}