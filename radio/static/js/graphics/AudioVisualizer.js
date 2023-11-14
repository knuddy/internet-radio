import AudioContainer from "../audio/AudioContainer.js";
import {remap, clamp, randomInt} from "./Helpers.js";
import Particles from "./Particles.js";
import {BouncingColor, BouncePath, Color, RotatingColor} from "./Color.js";


export default class AudioVisualizer {
  constructor(startBtnSelector, src, processorPaths) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = document.body.offsetWidth;
    this.canvas.height = document.body.offsetHeight;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.playBackControlButton = document.querySelector(startBtnSelector);
    this.playBackControlButtonIcon = this.playBackControlButton.appendChild(document.createElement('i'));
    this.playBackControlButtonIcon.classList.add('bi', 'bi-play-fill');

    this.playBackControlButton.onclick = function () {
      if (this.ac === undefined) {
        this.ac = new AudioContainer(src, processorPaths);
        this.playBackControlButtonIcon.classList.remove('bi-play-fill');
        this.playBackControlButtonIcon.classList.add('bi-pause');
      }

      if (this.ac && this.ac.ready) {
        if (this.ac.paused) {
          this.playBackControlButtonIcon.classList.remove('bi-play-fill');
          this.playBackControlButtonIcon.classList.add('bi-pause');
          this.ac.play();
        } else {
          this.playBackControlButtonIcon.classList.remove('bi-pause');
          this.playBackControlButtonIcon.classList.add('bi-play-fill');
          this.ac.pause();
        }
      }

    }.bind(this);

    this.particles = new Particles({
      canvas: this.canvas,
      numParticles: 30,
      minRadius: 1,
      maxRadius: 4,
      minVelocity: 1,
      maxVelocity: 3,
      particleColor: new Color(255, 255, 255),
      drawLines: true
    });
    this.backgroundColor = new BouncingColor({startDeg: 40, endDegree: 270, bounceSpeed: 2, bouncePath: BouncePath.SHORTEST});

    this.turnRate = 0;
  }

  /**
   * @param {Number} deltaTime
   * */
  draw(deltaTime) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.backgroundColor.update(deltaTime);
    this.ctx.fillStyle = this.backgroundColor.color;
    this.ctx.beginPath();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.closePath();
    this.ctx.fill();

    this.particles.update();
    this.particles.draw(this.ctx);

    if (this.ac === undefined || !this.ac.ready || this.ac.paused) return;

    this.ac.update();
    const midStrength = remap(this.ac.ec.mid, 40, 255, 0, 400);
    const bassStrength = remap(this.ac.ec.bass, 40, 255, 0, 250);


    const energyFreqData = this.ac.ec.highMidFrequencyData;

    const innerRadius = midStrength;
    const barHeightMultiplier = 0.5;
    const angStep = (Math.PI + 0.0275) / energyFreqData.length;
    const barWidth = (innerRadius * (-Math.PI / 2) / energyFreqData.length);
    const barWidthHalf = barWidth * 0.5;
    const startAngle = (-Math.PI / 2) + this.turnRate; // 12 oclock

    this.ctx.save();
    this.ctx.fillStyle = "hsl(0deg, 100%, 100%)";
    for (let i = 0; i < energyFreqData.length; i++) {
      const h = energyFreqData[i];
      
      let ang = i * angStep + startAngle;
      let xAx = Math.cos(ang);
      let xAy = Math.sin(ang);
      this.ctx.setTransform(xAx, xAy, -xAy, xAx, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.fillRect(innerRadius, -barWidthHalf, h * barHeightMultiplier * (midStrength / 400), barWidth);

      ang = i * -angStep + startAngle;
      xAx = Math.cos(ang);
      xAy = Math.sin(ang);
      this.ctx.setTransform(xAx, xAy, -xAy, xAx, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.fillRect(innerRadius, -barWidthHalf, h * barHeightMultiplier * (midStrength / 400), barWidth);

    }
    this.ctx.fill();
    this.ctx.restore();
    this.turnRate += 0.005;

    if (midStrength >= 0) {
      this.ctx.fillStyle = this.colorMid(this.ac.ec.mid);
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, midStrength, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.ctx.resetTransform();
  }

  /**
   * @param {Number} bass
   * @returns {String}
   * */
  colorBass(bass) {
    const h = remap(bass, 40, 255, 120, 300);
    const s = remap(bass, 40, 255, 66, 83);
    return `hsl(${h}deg, ${s}%, 50%)`;
  }

  /**
   * @param {Number} mid
   * @returns {String}
   * */
  colorMid(mid) {
    let h, s;
    if (mid < 40) {
      h = 180;
      s = 66;
    } else {
      h = remap(mid, 40, 200, 180, 90);
      s = remap(mid, 40, 255, 66, 100);
    }
    return `hsl(${h}deg, ${s}%, 50%)`;
  }

}
