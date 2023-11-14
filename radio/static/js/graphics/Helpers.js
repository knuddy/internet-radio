/**
 * @param {Number} value
 * @param {Number} fromLow
 * @param {Number} fromHigh
 * @param {Number} toLow
 * @param {Number} toHigh
 * @returns {Number}
 * */
export function remap(value, fromLow, fromHigh, toLow, toHigh) {
  return toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow);
}

/**
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 * */
export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * @returns {Boolean}
 * */
export function randomBool() {
  return Math.random() > 0.5;
}

/**
 * @param {Number} value
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 * */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function modulo(n, m) {
  return ((n % m) + m) % m;
}
