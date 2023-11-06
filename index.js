/* eslint-disable no-process-exit */
'use strict';
const term = require('terminal-kit').terminal;
const { argv } = require('yargs');
const { readFileSync, existsSync } = require('fs');
const CHARS = {
  FULL_SQUARE: '\u2588',
  CIRCLE: '\u26AB'
};

let map;
let tick = 500; // how many milliseconds till next tick
let iterations = 0; // default is infinite
let live = [2, 3];
let dead = [3, 3];

// Get args:
if (argv.s) { // Seed
  if (existsSync(argv.s)) {
    const file = readFileSync(argv.s, { encoding: 'utf-8' });
    map = file
      .split('\n')
      .map(line => line.split('').map(char => parseFloat(char)));
  } else if (argv.s.includes('rand')) {
    const { 0: width, 1: height } = argv.s
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
if (argv.t) tick = argv.t;
if (argv.i) iterations = argv.i;
if (argv.l) live = argv.l.split(',');
if (argv.d) dead = argv.d.split(',');

// /** @returns {Promise<{ x: number, y: number }>} Cursor position */
// function getCursorLocation () {
//   return new Promise(resolve => {
//     term.getCursorLocation((err, x, y) => {
//       if (err) {
//         console.error(err);
//         process.exit();
//       } else resolve({ x, y });
//     });
//   });
// }

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

function * getNeighbours (x, y) {
  yield map[getYAbove(y)][getXLeft(x)]; // Above left
  yield map[getYAbove(y)][x]; // Above
  yield map[getYAbove(y)][getXRight(x)]; // Above right
  yield map[y][getXLeft(x)]; // Left
  yield map[y][getXRight(x)]; // Right
  yield map[getYBelow(y)][getXLeft(x)]; // Below left
  yield map[getYBelow(y)][x]; // Below
  yield map[getYBelow(y)][getXRight(x)]; // Below right
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
    numOfAliveNeighbours += neighbour ? 1 : 0;
    if (isAlive && numOfAliveNeighbours > live[1])
      return false;
  }

  return (isAlive && numOfAliveNeighbours >= live[0] && numOfAliveNeighbours <= live[1]) ||
    (!isAlive && numOfAliveNeighbours >= dead[0] && numOfAliveNeighbours <= dead[1]);
}

function drawMap () {
  const updatedMap = [];
  for (let y = 0; y < map.length; y++) {
    updatedMap.push([]);
    for (let x = 0; x < map[y].length; x++) {
      // Determine this cell's state next iteration:
      updatedMap[y][x] = determineCellState(x, y) ? 1 : 0;

      term.moveTo(x + 1, y + 1);
      term.green(map[y][x] ? CHARS.FULL_SQUARE : ' ');
    }
  }
  term(' ');
  drawControls();
  map = updatedMap;
}

function drawControls () {
  term.moveTo(0, map.length + 1)
    .white(`-${tick}ms+             `);
}

(async () => {
  term.clear();
  term.grabInput();
  term.on('key', function (key, matches, data) {
    if (key === 'CTRL_C' || key === 'ESCAPE') process.exit();
    else if (key === '=') tick += 20;
    else if (key === '-' && tick - 20 > 0) tick -= 20;
  });

  if (!map) {
    console.error('No seed was given');
    process.exit();
  }

  for (let i = 0; iterations ? i < iterations : true; i++) {
    drawMap();
    await new Promise(resolve => setTimeout(resolve, tick));
  }
})();
