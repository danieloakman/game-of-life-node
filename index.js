/* eslint-disable no-process-exit */
'use strict';
const term = require('terminal-kit').terminal;
const { argv } = require('yargs');
const { readFileSync, existsSync } = require('fs');
// const { promisify } = require('util');

let map;
let interval = 500;
let iterations = -1; // default is infinite

// Get args:
if (argv.seed) {
  if (existsSync(argv.seed)) {
    const file = readFileSync(argv.seed, { encoding: 'utf-8' });
    map = file
      .split('\n')
      .map(line => line.split('').map(char => parseFloat(char)));
  } else if (argv.seed.includes('rand')) {
    const { 0: width, 1: height } = argv.seed
      .replace('rand', '')
      .split(',');
    map = new Array(parseFloat(height))
      .fill(1)
      .map(_ => {
        return new Array(parseFloat(width))
          .fill(1)
          .map(_ => Math.floor(Math.random() * 2));
      });
  }
}
if (argv.interval) interval = argv.interval;
if (argv.iterations) iterations = argv.iterations;

/** @returns {Promise<{ x: number, y: number }>} Cursor position */
function getCursorLocation () {
  return new Promise(resolve => {
    term.getCursorLocation((err, x, y) => {
      if (err) {
        console.error(err);
        process.exit();
      } else resolve({ x, y });
    });
  });
}

function getYAbove (y) {
  if (y > 0)
    return y - 1;
  else
    return map.length - 1;
}

function getYBelow (y) {
  if (y < map.length - 1)
    return y + 1;
  else
    return 0;
}

function getXRight (x) {
  if (x < map[0].length - 1)
    return x + 1;
  else
    return 0;
}

function getXLeft (x) {
  if (x > 0)
    return x - 1;
  else
    return map[0].length - 1;
}

function getNeighbours (x, y) {
  return [
    () => map[getYAbove(y)][getXLeft(x)], // Above left
    () => map[getYAbove(y)][x], // Above
    () => map[getYAbove(y)][getXRight(x)], // Above right
    () => map[y][getXLeft(x)], // Left
    () => map[y][getXRight(x)], // Right
    () => map[getYBelow(y)][getXLeft(x)], // Below left
    () => map[getYBelow(y)][x], // Below
    () => map[getYBelow(y)][getXRight(x)] // Below right
  ];
}

/**
 * Determining a cell's state next iteration with these rules:
 * 1. Any live cell with two or three live neighbours survives.
 * 2. Any dead cell with three live neighbours becomes a live cell.
 * 3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
 * @returns {boolean} True for alive, false for dead.
 */
function determineCellState (x, y) {
  const isAlive = map[y][x];
  let numOfAliveNeighbours = 0;

  for (const neighbour of getNeighbours(x, y)) {
    numOfAliveNeighbours += neighbour() ? 1 : 0;
    if (isAlive && numOfAliveNeighbours > 3)
      return false;
  }

  return (isAlive && (numOfAliveNeighbours === 2 || numOfAliveNeighbours === 3)) ||
    (!isAlive && numOfAliveNeighbours === 3);
}

async function draw () {
  const updatedMap = [];
  for (let y = 0; y < map.length; y++) {
    updatedMap.push([]);
    for (let x = 0; x < map[y].length; x++) {
      // Determine this cell's state next iteration:
      updatedMap[y][x] = determineCellState(x, y) ? 1 : 0;

      term.moveTo(x, y);
      // term('\u26AB'); // Circle
      term.green(map[y][x] ? '\u2588' : ' '); // Full square
    }
  }
  term('\n');
  map = updatedMap;
}

(async () => {
  term.clear();
  term.grabInput();
  term.on('key', function (key, matches, data) {
    if (key === 'CTRL_C') process.exit();
  });

  if (!map) {
    console.error('No seed was given');
    process.exit();
  }

  if (iterations > 0)
    for (let i = 0; i < iterations; i++) {
      await draw();
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  else
    setInterval(draw, interval);
})();
