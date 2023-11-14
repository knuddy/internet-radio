import {randomInt, randomBool} from "./Helpers.js";

class Particle {
  /**
   * @param {Number} radius
   * @param {Number} x
   * @param {Number} y
   * @param {Number} vx
   * @param {Number} vy
   * @param {Number} alpha
   * */
  constructor(radius, x, y, vx, vy, alpha) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.alpha = alpha;
  }
}


export default class Particles {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Number} numParticles
   * @param {Number} minRadius
   * @param {Number} maxRadius
   * @param {Number} minVelocity
   * @param {Number} maxVelocity
   * @param {Color} particleColor
   * @param {Boolean} drawLines
   * */
  constructor(
    {
      canvas,
      numParticles,
      minRadius,
      maxRadius,
      minVelocity,
      maxVelocity, particleColor,
      drawLines = false
    }) {
    this.canvas = canvas;
    this.particleColor = particleColor;
    this.drawLines = drawLines;

    this.particles = [];
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(
        new Particle(
          randomInt(minRadius, maxRadius),
          randomInt(0, canvas.width),
          randomInt(0, canvas.height),
          randomInt(minVelocity, maxVelocity + 1) * (randomBool() ? 1 : -1),
          randomInt(minVelocity, maxVelocity + 1) * (randomBool() ? 1 : -1),
          randomInt(155, 255),
        )
      );
    }
  }

  update() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].x += this.particles[i].vx
      this.particles[i].y += this.particles[i].vy

      if (this.particles[i].x < 0) {
        this.particles[i].x = this.canvas.width
      } else if (this.particles[i].x > this.canvas.width) {
        this.particles[i].x = 0
      }

      if (this.particles[i].y < 0) {
        this.particles[i].y = this.canvas.height;
      } else if (this.particles[i].y > this.canvas.height) {
        this.particles[i].y = 0
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * */
  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      if (this.drawLines) {
        for (let j = 0; j < this.particles.length; j++) {
          if (i === j) continue;
          this.linkParticles(ctx, particle, this.particles[j]);
        }
      }


      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${this.particleColor.r}, ${this.particleColor.g}, ${this.particleColor.b}, ${particle.alpha / 255})`;
      ctx.fill();
      ctx.closePath();
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {Particle} p1
   * @param {Particle} p2
   * */
  linkParticles(ctx, p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 220) {
      const distRatio = (220 - dist) / 220
      const lineAlpha = Math.min(p1.alpha, p2.alpha) * distRatio / 2;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha / 255})`;
      ctx.stroke();
      ctx.closePath();
    }
  }
}