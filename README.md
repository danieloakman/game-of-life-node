
# Game-Of-Life-Node

Configurable Conway's game of life written in node js.
<https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>

## Usage

Type into terminal:
`node index.js [ARGUMENTS]`
CTRL + C  or escape to exit.

## Arguments

- s: (REQUIRED) The seed input for the 2D map. You can input a text file containing zeros and ones (see the file called "input") or start a random map of some width and height.

- t: (OPTIONAL, default: 500ms) The time in milliseconds between each iteration/generation. This can be changed while it's running by using + or -

- i: (OPTIONAL, default: infinite) The number of iterations/generations to run for.

- l: (OPTIONAL, default: "2,3") The rules for an alive cell. The default is set to the classic rules for the game of life. Example: `-l 2,3`, these two numbers represent the upper and lower limit (inclusive) for how many neighbours a live cell this generation can have. If this live cell does not meet those limits, then it will become a dead cell next generation.

- d: (OPTIONAL, default: "3,3") The rules for a dead cell. The default is set to the classic rules for the game of life. Example `-d 3,3`,  these two numbers represent the upper and lower limit (inclusive) for how many neighbours a dead cell this generation can have. If this dead cell meets those limits, then it will become a live cell, otherwise it will stay dead.

## Examples

- Generate a random map with a height and width of 50: `node index.js -s rand50,50`. Each cell has a 50% chance of being alive or dead when generated.
- Generate a map from a text file: `node index.js -s some-text-file.txt`
- Generate a random map from with different live and dead cell rules: `node index.js -s rand50,50 -l 2,4 -d 3,4`
