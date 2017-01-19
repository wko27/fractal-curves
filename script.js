var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var stop = false;
var windowSize;
var defaultLineWidth = window.devicePixelRatio <= 1 ? 2 : 1;
// I was going to make a border control joke here
var margin = 0.8;

var iter = 0;
var endIter = 0;

var primaryColors = ["000000"];
var primaryColors = ["031DFF", "0AA4FF", "03D0E8", "03FFD4"];
var mirrorColors = [];

var replicationFactor = 8;
var mirrorEnabled = true;
var maxIters = 50;
var maxEndIters = 4;

var debug = false;
var storeRandom = [];
var fakeRandom = [46.26466278951179,1.3531117222330236,41.330530788711904,1.8718397504545032,42.38583754743207,0.13781037782204525,22.484468838268683,2.750881809866685,29.16686842207973,0.5238803685574092,25.73630655318655,2.5561647864477552,34.6295488383019,0.002953619589451574,45.76912882377218,0.5797053551224277,40.31859692758661,0.5023497525329003,21.21050793846852,0.7722906928646434,43.32242099819483,1.8737170601684747,38.89514063212586,2.6358988937599492,22.46111854760044,2.5025681108267412,43.04811087751042,0.43092308339266977,41.88597584800249,1.517014727684606,21.432359648561775,0.13164319595251342,34.19997790869224,0.30981446220734415,36.506145920794786,2.4212041534747364,47.155457214263116,2.4375607006288513,34.57369202074159,1.9935975599243054,42.11684673868001,0.858647735190806,44.762359497875046,0.8108920676968376,29.018866563908617,1.0173409812209675,44.45831236580453,2.716046075034544,26.675488392994623,0.40218938510006474,49.81554867927158,0.06217522572963817,21.599683838195727,0.4935411365977172,27.036507598065903,2.8277242326321415,27.435503182756975,2.750582037545409,40.9947593320155,1.72786335698188,35.70857063527947,1.728400716354371,48.921624807783886,0.006481648380954019,44.66692168657447,0.6655871777214549,32.22919229822575,0.4495324702021018,21.137140154985666,1.135951888700134,49.526942640277596,1.9866021153265372,32.087080611634576,1.52530503910198,25.49576373828412,2.305307996238835,28.908852657182116,0.9572338804555899,38.97232069941694,2.7883581640081636,34.23513068705127,0.6713741211181998,46.8648130021447,2.26240446862154,20.065964237731645,1.9507564209253734,49.01065253013551,2.2765842615850387,30.80028416894678,2.2133605336025184,31.275652578339876,3.0337738434281882,42.8834366640105,3.0072260352153277,26.19999766899899,0.6309132334301144,37.351463146047266,2.821980297583562,44.8944884374323,1.0731927481135377];

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
  if (debug) {
      return fakeRandom.shift();
  }
  var r = lower + Math.random() * (upper - lower);
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
     /** Updates state */
     update: function() {       
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
     deltaAngle: -Math.PI
   };
   
   // draw a single iteration
   var draw = function() {
     currentState.update();
     
     if (mirrorEnabled) {
       ctx.strokeStyle = '#A9A9A9';
       drawArcs(
	 createMirror(toPolar(currentState.center)),
	 currentState.radius,
	 -currentState.angle,
	 -currentState.deltaAngle
       );
     }

     ctx.strokeStyle = "#" + primaryColors[endIter % primaryColors.length];
     drawArcs(
       toPolar(currentState.center),
       currentState.radius,
       currentState.angle,
       currentState.deltaAngle
     );
     
     if (debug) {
       line(currentState.center, currentState.end());
     }
   };
   
   var timedDraw = function() {
     draw();
     
     iter ++;
     var end = currentState.end();
     if (end.x * end.x + end.y * end.y < 0.1) {
       endIter ++;
     }
     
     if (iter < maxIters && endIter < maxEndIters) {
       setTimeout(timedDraw, 100);
     } else {
       throw Error(storeRandom);
     }
   };
   
   timedDraw();
 })();
