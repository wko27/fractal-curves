var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var stop = false;
var windowSize;
var defaultLineWidth = window.devicePixelRatio <= 1 ? 2 : 1;
var storeRandom = [];

var replicationFactor = 1;
var mirrorEnabled = false;
var iters = 20;
var debug = true;
var fakeRandom = [0.7778169248644149,0.3032784609438026,0.23358253119279104,0.6042392429654362,0.9671697149202039,0.8708810228803734,0.8885994880311516,0.028774254564111645,0.8051740260120732,0.9561311113217195,0.9576430384995658,0.07989189678983566,0.08925746760259812,0.6875554537391972,0.5851639400050501,0.02875269496621602,0.9021217290221515,0.6512297127057727,0.665704406535889,0.7459025552064804,0.5071069059011113,0.2974100652496088,0.5615271049056128,0.5702717079311244,0.7799439726475679,0.07377870097553774,0.7936336403605424,0.2573303626331911,0.149534321267357,0.6830052031359368,0.5720800134038633,0.9723027399880797,0.9378813841465801,0.3905765508500778,0.026930411435833967,0.06567485246080706,0.41795747204425404,0.9101694007506771,0.5316464678997059,0.04812329200522636,0.868956376511288,0.2620807392095499,0.12735554660503712,0.8500486589496874,0.39402444205429465,0.7639615813130265,0.695715685668902,0.5017901158855969,0.5887280992080408,0.4788202525415075,0.39236444086784084,0.6978467595352438,0.8542365488937165,0.17083215783180883,0.8278558831415834,0.3193951713452954,0.729537039944977,0.6171247769465766,0.7469400034604605,0.23278819283114682];

/**
 * @return Randomly chosen value from Gaussian distribution on (-inf, +inf)
 * Note this uses the Box-Muller method and is pretty slow
 */
function gaussian(mu, sigma) {
  var u = 1 - uniform(); // Subtraction to flip [0, 1) to (0, 1].
  var v = 1 - uniform();
  return mu + sigma * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** @return Randomly chosen value from uniform distribution on [0, 1) */
function uniform() {
//  return 0.5;
  if (debug) {
      return fakeRandom.shift();
  }
  var r = Math.random();
  storeRandom.push(r);
  return r;
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
    var replicaStartAngle = startAngle + i * 2 * Math.PI / replicationFactor;
    var replicaEndAngle = (startAngle + deltaAngle) + i * 2 * Math.PI / replicationFactor;
//    console.log(replicaStartAngle + " " + replicaEndAngle);
    // Please note that the end angle is measured CLOCKWISE FROM THE X-AXIS (according to spec)
    ctx.beginPath();
    ctx.arc(replica.x, replica.y, radius, replicaStartAngle, replicaEndAngle, counterClockwise);
    ctx.stroke();
  }
  
/*  ctx.beginPath();
  var old = ctx.strokeStyle;
  ctx.strokeStyle = "blue";
  ctx.arc(center.x, center.y, radius, startAngle + deltaAngle, startAngle + deltaAngle + 1);
  ctx.stroke();
  ctx.strokeStyle = old;
*/
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
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
   ctx.translate(canvas.width / 2, canvas.height / 2);
   windowSize = Math.min(canvas.width, canvas.height);
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
       if (stop) {
	 throw Error(storeRandom);
       }
       
       var current = this.end();
       var angle = (this.angle + this.deltaAngle + Math.PI) % (2 * Math.PI);
       var radius = Math.max(0, gaussian(20, 10));
       var deltaAngle = Math.PI / 2 * (1 + uniform());

       if (currentState.clockwise) {
	 deltaAngle = -deltaAngle;
       }

       var center;
       // Check if the end point would be out of the canvas
       if (Math.max(
	     Math.abs(current.x + radius * Math.cos(deltaAngle)),
	     Math.abs(current.y + radius * Math.sin(deltaAngle))) > windowSize * 0.25) {
	 // If so, then adjust the arc to return to the origin
	 console.log(this.angle);
	 console.log(angle);
	 angle = (angle + Math.PI) % (2 * Math.PI);
	 console.log("angle outside is: " + angle);

	 center = ((function() {
	   var a = current.x;
	   var b = current.y;

	   // basically we're solving for two linear equations
	   // (x - a)^2 + (x - b)^2 = x^2 + b^2 since the center's distance to the current point is equivalent to the center's distance to the origin
	   // a = x + r * cos(theta) and b = x + r * sin(theta) since the angle to current is fixed
           var x = (a * a - b * b + 2 * a * b * Math.tan(angle)) / (2 * (a + b * Math.tan(angle)));
	   var y = ((a * a + b * b) / 2 - a * x) / b;
	   return {
	     x: x,
	     y: y
	   };
	 })());
	 
	 radius = Math.sqrt(center.x * center.x + center.y * center.y);
	 deltaAngle = Math.PI - Math.acos(-center.x / radius);
	 
	 
	 console.log()

	 this.clockwise = !this.clockwise;
	 stop = true;
//	 throw new Error(i);
       } else {
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
       }

       if (stop) {
	 var startX = center.x + radius * Math.cos(angle);
	 var startY = center.y + radius * Math.sin(angle);
	 console.log("start is at " + startX + " " + startY);
	 console.log(currentState.end());
	 
	 var endX = center.x + radius * Math.cos(angle + deltaAngle);
	 var endY = center.y + radius * Math.sin(angle + deltaAngle);
	 console.log("end is currently at:")
	 console.log(current);
	 console.log("angle is: " + angle);

	 console.log("center: ");
	 console.log(center);
	 console.log("end up at: ");
	 console.log(endX + " " + endY);
	 circle(current);
	 circle(center);
	 circle({x: endX, y: endY});
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
//     console.log(currentState);
//     console.log(currentState.end());

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
     
     var end = currentState.end();
     ctx.moveTo(currentState.center.x, currentState.center.y);
     ctx.lineTo(end.x, end.y);
     ctx.stroke();

   };
   
// setInterval(draw, 100);
   var i;
   for (i = 0; i < iters; i++) {
     draw();
   }
   stop = true;
   draw();
 })();
