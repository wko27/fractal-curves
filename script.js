var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var defaultLineWidth = window.devicePixelRatio <= 1 ? 2 : 1;
var windowSize;

/** Each iteration, we draw a full arc */
var iter = 0;
/** Each end iteration, we reach the edge of the canvas and traverse back to the center */
var endIter = 0;
/** Length of an arc to draw per tick (speed of animation) */
var lengthPerTick = 10;
/** Refresh interval in ms */
var refreshInterval = 30;

var primaryColors = ["000000"];
var primaryColors = ["031DFF", "0AA4FF", "03D0E8", "03FFD4"];
var mirrorColors = [];

var replicationFactor = 8;
var mirrorEnabled = true;
var maxIters = 50;
var maxEndIters = 4;

var debug = false;
var storeRandom = [];
var debugWindowSize = 679;
var debugRandom = [26.940239797108266,3.082881315349646,39.908285498437166,2.5616484469781677,27.000734163945992,1.8984444033437886,49.92217708035817,2.229463822493238,21.029851301634526,0.010437991815959655,22.44315941658912,2.382030670093369,31.385171969721526,1.0097977465863788,23.89710731513463,1.37210017579784,46.404332769512365,2.1420127061377667,42.05320099949865,0.6926920764888791,40.79656562709418,0.4271523548731313,42.2436978190472,1.2035645803568855,38.65259568013245,2.9426243938092767,24.7834154928548,2.7833627024822225,24.58675018396172,0.14570950607774896,23.299190997236362,2.5034707881814176,48.024258916169096,2.2297729998583407,36.31394277455227,2.3466018104543345,36.15671393501213,0.6906027783363308,42.31523537698024,1.6845550946718875,36.60672643453391,1.2384650187944668,40.197120415118576,1.3022272731468434,37.06708528021163,0.3730572895964945,35.6922713585612,0.2985769772173546,36.297917278872134,1.0394294113750677,36.93140779955076,0.7989099398881074,27.56042274570799,0.03207989974658804,24.369778534443647,0.5095025735006591,22.663566533507804,0.7882192435917591,46.265977923920204,0.6311659378155667,24.25858550758324,0.8380615074834942,28.906898549617978,1.0103768935744495,46.01805293865753,2.1562849484595916,44.003042086594775,2.7160686824990306,28.389735366213618,1.8280232136570744,42.759506947321995,0.7312088449022315,45.39418080748936,1.4145300482945493,38.77387896753385,0.548141227184111,44.099554133223364,2.717879600079727,25.992187726617097,2.55505118436093,35.09239632631704,0.5751957900506862,26.449488145384585,1.6626762053692588,30.277341733748095,1.9770386812062246,32.67250008654892,1.316675101953378,47.07871348625002,1.0692950361375473,47.14242980331655,0.7587027664616546,34.282363759226435,1.6472881571392033,22.223028726169765,0.34451849585998,36.49029439558298,1.385569271285071,45.97020991049736,0.5519270162160492];

if (debug) {
  replicationFactor = 1;
  mirrorEnabled = false;
  
}

/**
 * @return Randomly chosen value from Gaussian distribution on (-inf, +inf)
 * Note this uses the Box-Muller method and is pretty slow
 */
function gaussian(mu, sigma) {
  var u = 1 - uniform(0, 1); // Subtraction to flip [0, 1) to (0, 1].
  var v = 1 - uniform(0, 1);
  return mu + sigma * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** @return Randomly chosen value from uniform distribution on [0, 1) */
function uniform(lower, upper) {
  var r;
  if (debug) {
    r = debugRandom.shift();
  } else {
    r = lower + Math.random() * (upper - lower);
  }
  storeRandom.push(r);
  return r;
}

/** @return Polar coordinates for the given Cartesian coordinates */
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

    ctx.beginPath();
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
function drawArcs(center, radius, startAngle, deltaAngle, style) {
  var counterClockwise = deltaAngle < 0;
  var replicas = createReplicas(center);
  var i;
  for (i = 0; i < replicationFactor; i++) {
    var replica = toCartesian(replicas[i]);
    var replicaStartAngle = startAngle + i * 2 * Math.PI / replicationFactor;
    var replicaEndAngle = (startAngle + deltaAngle) + i * 2 * Math.PI / replicationFactor;
    // Note that the end angle is measured CLOCKWISE FROM THE X-AXIS (according to spec)
    ctx.beginPath();
    ctx.arc(replica.x, replica.y, radius, replicaStartAngle, replicaEndAngle, counterClockwise);
    ctx.stroke();
  }  
}

/**
 * Draw a line from start to end
 */
function line(start, end) {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

/**
 * Draw a tiny circle at the given coordinates
 * @param center Center of the circle in Cartesian coordinates
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

/**
 * Find the circle which intersects both the from and to points (in Cartesian coordinates)
 * intersecting the from point at the given angle
 */
function circleAtTarget(from, to, angle) {
  // shift the circle so the to is at the origin
  var a = from.x - to.x;
  var b = from.y - to.y;
  
  // basically we're solving for two linear equations
  // (x - a)^2 + (x - b)^2 = x^2 + b^2 since the center's distance to the current point is equivalent to the center's distance to the origin
  // a = x + r * cos(theta) and b = x + r * sin(theta) since the angle to current is fixed
  var x = (a * a - b * b + 2 * a * b * Math.tan(angle)) / (2 * (a + b * Math.tan(angle)));
  var y = ((a * a + b * b) / 2 - a * x) / b;
  return {
    center: {
      x: x + to.x,
      y: y + to.y
    },
    radius: Math.sqrt((x - a) * (x - a) + (y - b) * (y - b))
  };
}

// initialize canvas
(function() { 
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
   ctx.translate(canvas.width / 2, canvas.height / 2);
   windowSize = Math.min(canvas.width, canvas.height);
   if (debug) {
     windowSize = debugWindowSize;
   }
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
	 y: this.center.y + this.radius * Math.sin(this.angle + this.deltaAngle)
       };
     },
     /** Chooses a new arc */
     chooseNewArc: function() {       
       var current = this.end();
       var angle = (this.angle + this.deltaAngle + Math.PI) % (2 * Math.PI);
       var radius = uniform(20, 50);
       var deltaAngle = uniform(0, Math.PI);

       // Switch from clockwise to cc or vice versa
       if (currentState.deltaAngle > 0) {
	 deltaAngle = -deltaAngle;
       }

       var center;
       // Check if the end point would be out of the canvas
       var edge = Math.max(
	     Math.abs(current.x + radius * Math.cos(deltaAngle)),
	     Math.abs(current.y + radius * Math.sin(deltaAngle)));
       if (edge > windowSize / 2) {
	 // If so, then adjust the arc to return to the origin

	 // Continue in the same clockwise/cc direction
	 angle = (angle + Math.PI) % (2 * Math.PI);
	 
	 var target = circleAtTarget(current, {x: 0, y: 0}, angle);
	 center = target.center;
	 radius = target.radius;
	 
	 // Ensure we go back to center on a clockwise or cc arc
	 if (this.deltaAngle > 0) {
	   deltaAngle = 2 * Math.PI + Math.acos(-center.x / radius) - angle;
	 } else {
	   deltaAngle = - Math.acos(-center.x / radius) - angle;
	 }
	 
	 endIter++;
       } else if (this.center == null) {
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
       this.subArc = lengthPerTick / (radius * Math.abs(deltaAngle));
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
     // percentage of arc we draw in each tick
     subArc: 0,
     // current tick of the current arc
     tick: 0
   };
   
   // draw a single iteration
   var draw = function() {
     if (currentState.subArc === 0 || currentState.tick * currentState.subArc >= 1) {
       currentState.chooseNewArc();
       currentState.tick = 0;
     }
     
     var startAngle = currentState.angle + currentState.tick * (currentState.deltaAngle * currentState.subArc);
     var deltaAngle = currentState.subArc * currentState.deltaAngle;
     if ((currentState.tick + 1) * currentState.subArc >= 1) {
       deltaAngle = (1 - currentState.tick * currentState.subArc) * currentState.deltaAngle;
       // ok this is kind of sneaky ...
       iter++;
     }
     
     currentState.tick++;
     
     if (mirrorEnabled) {
       ctx.strokeStyle = '#A9A9A9';
       drawArcs(
	 createMirror(toPolar(currentState.center)),
	 currentState.radius,
	 -startAngle,
	 -deltaAngle
       );
     }

     ctx.strokeStyle = "#" + primaryColors[endIter % primaryColors.length];
     drawArcs(
       toPolar(currentState.center),
       currentState.radius,
       startAngle,
       deltaAngle
     );
     
     if (debug) {
       line(currentState.center, currentState.end());
     }
   };
   
   var timedDraw = function() {
     draw();
          
     if (iter < maxIters && endIter < maxEndIters) {
       setTimeout(timedDraw, refreshInterval);
     } else {
       console.log("window size: " + windowSize);
       console.log("random: " + JSON.stringify(storeRandom));
     }
   };
   
   timedDraw();
 })();
