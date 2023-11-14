import {modulo} from "./Helpers.js";

export class Color {
  /**
   * @param {Number} r
   * @param {Number} g
   * @param {Number} b
   * */
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

export class RotatingColor {
  /**
   * @param {Number} startDeg
   * @param {Number} rotationSpeed
   * @param {Boolean} counterClockwise
   * */
  constructor({startDeg, rotationSpeed, counterClockwise = false}) {
    this.hue = startDeg;
    this.saturation = 100;
    this.brightness = 50;
    this.speed = rotationSpeed;
    this.direction = counterClockwise ? -1 : 1;
  }

  /**
   * @param {Number} deltaTime
   * @return {String}
   * */
  update(deltaTime) {
    this.hue = modulo(this.hue + (this.speed * this.direction * deltaTime), 361);
  }

  /**
   * @return {String}
   * */
  get color() {
    return `hsl(${this.hue}, ${this.saturation}%, ${this.brightness}%)`;
  }
}


export const BouncePath = Object.freeze({
  SHORTEST: 0,
  LONGEST: 1
});

export class BouncingColor {
  /**
   * @param {Number} startDeg
   * @param {Number} endDegree
   * @param {Number} bounceSpeed
   * @param {Number} bouncePath
   * */
  constructor({startDeg, endDegree, bounceSpeed, bouncePath = BouncePath.SHORTEST}) {
    this.hue = startDeg;
    this.saturation = 100;
    this.speed = bounceSpeed;

    this.startDeg = startDeg;
    this.endDeg = endDegree;
    const lower = Math.min(startDeg, endDegree);
    const higher = Math.max(startDeg, endDegree);
    const dist = higher - lower;
    if (dist > 180) {
      this.range = bouncePath === BouncePath.SHORTEST ? lower + (360 - higher) : dist;
      this.direction = endDegree > startDeg ? -1 : 1;
    } else {
      this.range = bouncePath === BouncePath.SHORTEST ? dist : lower + (360 - higher);
      this.direction = endDegree > startDeg ? 1 : -1;
    }

    this.direction *= bouncePath === BouncePath.SHORTEST ? 1 : -1;

    this.changeSinceLastBounce = 0;
  }

  /**
   * @param {Number} deltaTime
   * @return {String}
   * */
  update(deltaTime) {
    const change = this.speed * this.direction * deltaTime;
    this.hue = modulo((this.hue + change), 361);

    this.changeSinceLastBounce += Math.abs(change);
    if (this.changeSinceLastBounce >= this.range) {
      this.hue = Math.abs(this.hue - this.startDeg) < Math.abs(this.hue - this.endDeg) ? this.startDeg : this.endDeg;
      this.changeSinceLastBounce = 0;
      this.direction *= -1;
    }
  }

  /**
   * @return {String}
   * */
  get color() {
    return `hsl(${this.hue}, ${this.saturation}%, 50%)`;
  }
}