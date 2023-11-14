export default class EnergyCalculator {
  constructor(analyser, nyquist) {
    this.analyser = analyser;
    this.nyquist = nyquist;
    this.bufferLength = analyser.frequencyBinCount;
    this.freqDomain = new Uint8Array(this.bufferLength);

    this._bassDirty = true;
    this._lowMidDirty = true;
    this._midDirty = true;
    this._highMidDirty = true;
    this._trebleDirty = true;
  }

  update() {
    this.analyser.getByteFrequencyData(this.freqDomain);
    this._bassDirty = true;
    this._lowMidDirty = true;
    this._midDirty = true;
    this._highMidDirty = true;
    this._trebleDirty = true;
  }

  getEnergy(f1, f2) {
    const lowIndex = Math.round((f1 / this.nyquist) * this.freqDomain.length);
    const highIndex = Math.round((f2 / this.nyquist) * this.freqDomain.length);

    let total = 0;
    let numFrequencies = 0;
    for (let i = lowIndex; i <= highIndex; i++) {
      total += this.freqDomain[i];
      numFrequencies++;
    }

    return total / numFrequencies;
  }

  getEnergyFrequencyData(f1, f2) {
    const lowIndex = Math.round((f1 / this.nyquist) * this.freqDomain.length);
    const highIndex = Math.round((f2 / this.nyquist) * this.freqDomain.length);

    const range = [];
    for (let i = lowIndex; i <= highIndex; i++) {
      range.push(this.freqDomain[i]);
    }
    return range;
  }

  get bass() {
    if(this._bassDirty){
      this._bass = this.getEnergy(20, 140);
      this._bassDirty = false;
    }
    return this._bass;
  }

  get bassFrequencyData() {
    return this.getEnergyFrequencyData(20, 140);
  }

  get lowMid() {
    if(this._lowMidDirty){
      this._lowMid = this.getEnergy(140, 400);
      this._lowMidDirty = false;
    }
    return this._lowMid;
  }

  get lowMidFrequencyData() {
    return this.getEnergyFrequencyData(140, 400);
  }

  get mid() {
    if(this._midDirty){
      this._mid = this.getEnergy(400, 2600);
      this._midDirty = false;
    }
    return this._mid;
  }

  get midFrequencyData() {
    return this.getEnergyFrequencyData(400, 2600);
  }

  get highMid() {
    if(this._highMidDirty){
      this._highMid = this.getEnergy(2600, 5200);
      this._highMidDirty = false;
    }
    return this._highMid;
  }

  get highMidFrequencyData() {
    return this.getEnergyFrequencyData(2600, 5200);
  }

  get treble() {
    if(this._trebleDirty){
      this._treble = this.getEnergy(5200, 14000);
      this._trebleDirty = false;
    }
    return this._treble;
  }

  get trebleFrequencyData() {
    return this.getEnergyFrequencyData(5200, 14000);
  }
}