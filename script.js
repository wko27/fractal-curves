var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var windowSize = Math.max(window.innerWidth, window.innerHeight) - 200;
var replicationFactor = 16;
var mirrorEnabled = true;
var iters = 20;
var defaultLineWidth = window.devicePixelRatio <= 1 ? 2 : 1;

/**
 * @return Randomly chosen value from Gaussian distribution on (-inf, +inf)
 * Note this uses the Box-Muller method and is pretty slow
 */
function gaussian() {
  var u = 1 - uniform(); // Subtraction to flip [0, 1) to (0, 1].
  var v = 1 - uniform();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** @return Randomly chosen value from uniform distribution on [0, 1) */
function uniform() {
//  return 0.1;
  return Math.random();
}

/** @return Polar coordinates for the given cartesian coordinates */
function toPolar(c) {
  return {
    radius: Math.sqrt(c.x * c.x + c.y * c.y),
    angle: Math.atan2(c.y, c.x)
  };
}

/** @return Cartesian coordinates for the given polar coordinates */
function toCartesian(c) {
  return {
    x: c.radius * Math.cos(c.angle),
    y: c.radius * Math.sin(c.angle)
  };
}

/**
 * @param c Coordinate of interest in polar
 * @return Polar coordinates of the replicas
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
}

/**
 * Draw arcs
 * @param center Center of the circle in polar coordinates
 * @param radius Radius of the arc
 * @param startAngle Angle to start from
 * @param endAngle Angle to end at
 */
function drawArcs(center, radius, startAngle, deltaAngle) {
  var counterClockwise = deltaAngle < 0;
  var replicas = createReplicas(center);
  var i;
  for (i = 0; i < replicationFactor; i++) {
    var replica = toCartesian(replicas[i]);
    ctx.beginPath();
    var replicaStartAngle = startAngle + i * 2 * Math.PI / replicationFactor;
    var replicaEndAngle = (startAngle + deltaAngle) + i * 2 * Math.PI / replicationFactor;
    console.log(replicaStartAngle + " " + replicaEndAngle);
    // Please note that the end angle is measured CLOCKWISE FROM THE X-AXIS (according to spec)
    ctx.arc(replica.x, replica.y, radius, replicaStartAngle, replicaEndAngle, counterClockwise);
    ctx.stroke();
  }
}

/**
 * Draw a tiny circle at the given coordinates
 * @param center Center of the circle in cartesian coordinates
 */
function circle(center) {
  var oldWidth = ctx.lineWidth;
  var oldStyle = ctx.strokeStyle;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.lineWidth = oldWidth;
  ctx.strokeStyle = oldStyle;
}

// initialize canvas
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
   ctx.lineWidth = defaultLineWidth;

   var currentState = {
     /** @return end of the current path */
     end: function() {
       if (this.center == null) {
         return {
	   x: 0,
	   y: 0
	 };
       }
       
       return {
	 x: this.center.x + this.radius * Math.cos(this.angle + this.deltaAngle),
	 y: this.center.y + this.radius * Math.sin(this.angle + this.deltaAngle),
       };
     },
     /** Updates state */
     update: function() {
       var current = this.end();
//       var angle = (this.angle + this.deltaAngle + Math.PI) % (2 * Math.PI);
       var angle = (this.angle + this.deltaAngle + Math.PI);
       var radius = 10;
       radius = Math.min(windowSize / 4, 80 * Math.abs(gaussian()));
       var deltaAngle = 2 * Math.PI / 3;
       deltaAngle = Math.PI / 2 * (1 + uniform());

       if (currentState.clockwise) {
	 deltaAngle = -deltaAngle;
       }

       console.log("deltaAngle: " + deltaAngle);
       
       // Check if the end point would be out of the canvas
       if (Math.max(
	     Math.abs(current.x + radius * Math.cos(deltaAngle)),
	     Math.abs(current.y + radius * Math.sin(deltaAngle))) > windowSize * 0.25) {
	 console.log(currentState.clockwise);
	 var edge = {
	   x: current.x + radius * Math.cos(deltaAngle),
	   y: current.x + radius * Math.sin(deltaAngle)
	 };
	 console.log("At the edge!, window size: " + windowSize);
	 console.log(current);
	 circle(current);
	 
	 // If so, then adjust the radius so we go back to the center
	 deltaAngle = -angle;
	 radius = Math.sqrt(current.x * current.x + current.y * current.y);
	 console.log("angle: " + angle);
	 console.log("heading home: " + deltaAngle + " " + radius);
//	 throw new Error(i);
       }

       var center;
       if (this.center == null) {
	 center = {
	   x: -radius * Math.cos(currentState.angle),
	   y: -radius * Math.sin(currentState.angle)
	 };
       } else {
	 center = {
	   x: current.x + (current.x - this.center.x) * radius / currentState.radius,
	   y: current.y + (current.y - this.center.y) * radius / currentState.radius
	 };
       }

       this.center = center;
       this.radius = radius;
       this.angle = angle;
       this.deltaAngle = deltaAngle;
       this.clockwise = !this.clockwise;
     },
     arcLength: function() {
       return 2 * this.radius * deltaAngle;
     },
     // center of the arc
     center: null,
     // radius of the arc
     radius: 0,
     // starting angle of the arc
     angle: 0,
     // change in angle of the arc
     deltaAngle: -Math.PI,
     // whether we are clockwise or counterclockwise
     clockwise: false
   };
   
   // draw a single iteration
   var draw = function() {
     currentState.update();

     // debug
     console.log(currentState);
     console.log(currentState.end());

     if (mirrorEnabled) {
       ctx.strokeStyle = 'red';
       drawArcs(
	 createMirror(toPolar(currentState.center)),
	 currentState.radius,
	 -currentState.angle,
	 -currentState.deltaAngle
       );
     }
     
     ctx.strokeStyle = 'black';
     drawArcs(
       toPolar(currentState.center),
       currentState.radius,
       currentState.angle,
       currentState.deltaAngle
     );
   };
   
// setInterval(draw, 100);
   var i;
   for (i = 0; i < iters; i++) {
     draw();
   }
 })();
