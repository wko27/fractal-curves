var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var windowSize = Math.max(window.innerWidth, window.innerHeight) - 200;
var replicationFactor = 16;
var mirrorEnabled = true;
var iters = 20;

/**
 * @return Randomly chosen value from a Gaussian distribution
 * Note this uses the Box-Muller method and is pretty slow
 */
function gaussian() {
  var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
  var v = 1 - Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function toPolar(c) {
  return {
    radius: Math.sqrt(c.x * c.x + c.y * c.y),
    angle: Math.atan2(c.y, c.x)
  };
}

function toCartesian(c) {
  return {
    x: c.radius * Math.cos(c.angle),
    y: c.radius * Math.sin(c.angle)
  };
}

/**
 * @return Polar coordinates of the replicas of the given polar coordinate
 */
function createReplicas(c) {
  var replicas = [];
  var x;
  for (x = 0; x < replicationFactor; x++) {
    replicas.push({
      radius: c.radius,
      angle: x * 2 * Math.PI / replicationFactor + c.angle
    });
  }
  return replicas;
}

/**
 * @return Polar coordinates of the mirror of the given polar coordinates
 */
function createMirror(c) {
  return {
    radius: c.radius,
    angle: -c.angle
  };
}

/**
 * Draw lines from current to the next
 * @param current Current location in polar coordinates
 * @param next Next location in polar coordinates
 */
function drawLines(current, next) {
  var currentReplicas = createReplicas(current);
  var nextReplicas = createReplicas(next);
  var x;
  for (x = 0; x < replicationFactor; x++) {
    var xCurrent = toCartesian(currentReplicas[x]);
    var xNext = toCartesian(nextReplicas[x]);

    ctx.moveTo(xCurrent.x, xCurrent.y);
    ctx.lineTo(xNext.x, xNext.y);
    ctx.stroke();
  }
    
  return next;
}

/**
 * Draw arcs starting at the current
 * @param current Current in polar coordinates
 * @param radius Radius of the arc
 * @param startAngle Angle to start from
 * @param endAngle Angle to end at
 */
function drawArcs(current, radius, startAngle, deltaAngle) {
  var currentCartesian = toCartesian(current);
  var center = {
      x: currentCartesian.x - radius * Math.cos(startAngle),
      y: currentCartesian.y - radius * Math.sin(startAngle)      
    };
  
  var counterClockwise = deltaAngle < 0;
  var replicas = createReplicas(toPolar(center));
  var i;
  for (i = 0; i < replicationFactor; i++) {
    var duplicate = toCartesian(replicas[i]);
    ctx.beginPath();
    ctx.arc(duplicate.x, duplicate.y, radius, startAngle + i * 2 * Math.PI / replicationFactor, (startAngle + deltaAngle) + i * 2 * Math.PI / replicationFactor, counterClockwise);
    ctx.stroke();
  }
  
  return toPolar({
    x: center.x + radius * Math.cos(startAngle + deltaAngle),
    y: center.y + radius * Math.sin(startAngle + deltaAngle)
  });
}

// Initialize canvas
(function() { 
   canvas.width = windowSize;
   canvas.height = windowSize;
   ctx.translate(canvas.width / 2, canvas.height / 2);
 }());

// draw axes
(function() {
   var center = {
     radius: 0,
     angle: 0
   };
   var edge = {
     radius: Math.max(canvas.width, canvas.height),
     angle: 0
   };
   ctx.lineWidth = 1;
   ctx.strokeStyle = "grey";
   drawLines(center, edge);
}());

// draw rest
(function() {
   ctx.lineWidth = 1;
		     
   var current = {
     radius: 0,
     angle: 0
   };
   
   var flip = true;
   
   // draw a bit ... and then continue ...
   var draw = function() {
     var radius = Math.max(20, 80 * (1 + gaussian()));
     
     var startAngle = Math.PI * (Math.random() - 0.5);
     var deltaAngle = 2 * Math.PI / 4 * (1 + Math.random());

     if (flip) {
       startAngle = -startAngle;
       deltaAngle = -deltaAngle;
     }
     
     console.log("start: " + startAngle + ", delta: " + deltaAngle + ", radius: " + radius);
     
     if (mirrorEnabled) {
       ctx.strokeStyle = 'red';
       drawArcs(createMirror(current), radius, -startAngle, -deltaAngle);
     }
     ctx.strokeStyle = 'black';
     current = drawArcs(current, radius, startAngle, deltaAngle);
     
     flip = !flip;
   };
   
   setInterval(draw, 500);
 })();
