const Game = require("./game");
var visualize = require("javascript-state-machine/lib/visualize");

let g = new Game();

console.log(visualize(g));
