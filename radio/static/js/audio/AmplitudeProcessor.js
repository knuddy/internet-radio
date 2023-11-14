import RingBuffer from "./RingBuffer.js";

class AmplitudeProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const processorOptions = options.processorOptions || {};
    this.numOutputChannels = options.outputChannelCount || 1;
    this.numInputChannels = processorOptions.numInputChannels || 2;

    this.bufferSize = processorOptions.bufferSize || 2048;
    this.inputRingBuffer = new RingBuffer(
      this.bufferSize,
      this.numInputChannels
    );
    this.outputRingBuffer = new RingBuffer(
      this.bufferSize,
      this.numOutputChannels
    );
    this.inputRingBufferArraySequence = new Array(this.numInputChannels)
      .fill(null)
      .map(() => new Float32Array(this.bufferSize));

    this.stereoVol = [0, 0];
    this.stereoVolNorm = [0, 0];

    this.volMax = 0.001;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    this.inputRingBuffer.push(input);


    if (this.inputRingBuffer.framesAvailable >= this.bufferSize) {
      this.inputRingBuffer.pull(this.inputRingBufferArraySequence);

      for (let channel = 0; channel < this.numInputChannels; ++channel) {
        const inputBuffer = this.inputRingBufferArraySequence[channel];
        const bufLength = inputBuffer.length;

        let sum = 0;
        for (let i = 0; i < bufLength; i++) {
          const x = inputBuffer[i];
          sum += x * x;
        }

        // ... then take the square root of the sum.
        const rms = Math.sqrt(sum / bufLength);
        this.stereoVol[channel] = Math.max(rms, this.stereoVol[channel]);
        this.volMax = Math.max(this.stereoVol[channel], this.volMax);
      }

      // calculate stereo normalized volume and add volume from all channels together
      let volSum = 0;
      for (let index = 0; index < this.stereoVol.length; index++) {
        this.stereoVolNorm[index] = Math.max(0, Math.min(this.stereoVol[index] / this.volMax, 1));
        volSum += this.stereoVol[index];
      }



      this.port.postMessage({name: 'amplitude', volume: volSum / this.stereoVol.length});

      // pass input through to output
      this.outputRingBuffer.push(this.inputRingBufferArraySequence);
    }

    // pull 128 frames out of the ring buffer
    // if the ring buffer does not have enough frames, the output will be silent
    this.outputRingBuffer.pull(output);
    return true;
  }
}

registerProcessor("amplitude-processor", AmplitudeProcessor);