export default class Amplitude {
  constructor(audioContext, audioSource) {
    this.bufferSize = 2048;

    this._workletNode = new AudioWorkletNode(
      audioContext,
      "amplitude-processor",
      {
        outputChannelCount: [1],
        processorOptions: {
          normalize: false,
          smoothing: 0,
          numInputChannels: 2,
          bufferSize: this.bufferSize,
        },
      }
    );

    this.volume = 0;

    this._workletNode.port.onmessage = function (event) {
      if (event.data.name === 'amplitude') {
        this.volume = event.data.volume;
      }
    }.bind(this);

    this.input = this._workletNode;
    this.output = audioContext.createGain();
    this._workletNode.connect(this.output);
    this.output.gain.value = 0;

    this.output.connect(audioContext.destination);
    audioSource.connect(this._workletNode);

  }

  get level() {
    return this.volume;
  }

  dispose() {
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }

    this._workletNode.disconnect();
    delete this._workletNode;
  }
}