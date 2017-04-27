let fractal = require('./fractal');

let divParent = document.getElementById("parent");
divParent.style.height = window.innerHeight + "px";

const squares = ['a', 'b', 'c', 'd'];

function start() {
  // Choose a random div and remove it
  let index = Math.floor(Math.random() * squares.length);
  let chosen = squares[index];
  squares.splice(index, 1);
  
  let div = document.getElementById(chosen);
  let animation = fractal.start(div, div.offsetWidth, div.offsetHeight);
  let timeout = Math.floor(Math.random() * 5000);
  setTimeout(() => {
      animation.stop(() => {
	// start a new one, then add the square back in
	start();
	squares.push(chosen);
      });
  }, timeout);
};

start();

setTimeout(start, 3000);
