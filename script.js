/**
 * 
 */
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var lineWidth = window.devicePixelRatio <= 1 ? 2 : 1;

/** Length of an arc to draw per tick (speed of animation) */
var lengthPerTick = 10000;
/** Refresh interval in ms */
var refreshInterval = 30;
/** Duration of the fade in milliseconds */
var fadeDuration = 5000;

var primaryColors = ["031DFF", "0AA4FF", "03D0E8", "03FFD4"];

var replicationFactor = 9;
var mirrorEnabled = true;
var stop = false;

var debug = true;
var debugTick = 0;
var debugWindowWidth = 1440;
var debugWindowHeight = 723;
var debugRandom = [36.66749472867343,0.5803072437061573,40.54311063412653,1.095065208473482,46.75566512044486,0.6889392227448371,29.39461449466377,1.5043404840968815,29.246486977465853,2.5270691827877942,44.89622222458398,2.071488964454456,28.47217691107543,2.240188308062647,34.22089343560671,0.45817129755060415,23.213031840674955,0.6949415143906211,29.466983116830487,0.3120763376537161,41.77709794833548,1.784254068181204,38.01305499867807,2.495799945044138,27.956854622509304,2.117407986280862,43.64856970759081,0.19928420169101,25.429133930898118,1.88075650939983,47.99592675205919,2.593528778243238,44.09284134601582,0.01697566665828437,37.40807511805197,2.990666831806416,20.656888777622818,2.368879535204684,34.244717669516575,1.1891090259144164,36.838805641252065,2.7983089096735982,30.798215746937565,1.1727125486292675,22.0588134958852,1.5163022590823703,45.68895137576213,1.7030539228309174,47.14459847209878,1.1955399131111042,26.42215870818317,0.6559075347919783,35.29876771475159,3.088209415524267];
var storeRandom = [];

if (debug) {
  replicationFactor = 1;
  mirrorEnabled = false;
  windowWidth = debugWindowWidth;
  windowHeight = debugWindowHeight;
}

// register a mouse event listener
document.addEventListener("click", function(){
   stop = true;
});

// draw axes
(function() {
   var ctx = createCanvasContext();
   var center = {
     radius: 0,
     angle: 0
   };
   var edge = {
     radius: Math.max(windowWidth, windowHeight),
     angle: 0
   };
   ctx.lineWidth = 1;
   ctx.strokeStyle = "grey";
   drawLines(ctx, center, edge);
}());

// draw first fractal
drawFractal(0);

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
 * @param ctx Canvas context
 * @param current Current location in polar coordinates
 * @param next Next location in polar coordinates
 */
function drawLines(ctx, current, next) {
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
 * @param ctx Canvas context
 * @param center Center of the circle in polar coordinates
 * @param radius Radius of the arc
 * @param startAngle Angle to start from
 * @param endAngle Angle to end at
 */
function drawArcs(ctx, center, radius, startAngle, deltaAngle, style) {
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
function line(ctx, start, end) {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

/**
 * Draw a tiny circle at the given coordinates
 * @param center Center of the circle in Cartesian coordinates
 */
function circle(ctx, center) {
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

/** Create a new canvas and initialize */
function createCanvasContext() {
  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  
  canvas.width = windowWidth;
  canvas.height = windowHeight;

  canvas.style.padding = 0;
  canvas.style.margin = "auto";
  canvas.style.display = "block";
  canvas.style.transition = "opacity " + fadeDuration + "ms ease-out";
  canvas.style.position = "absolute";
  
  var ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  return ctx;
}

/** Draw a single randomized fractal that starts and ends at the origin */
function drawFractal(fractalIter) {
  var ctx = createCanvasContext();
  ctx.lineWidth = lineWidth;

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
      var maxEdge = Math.min(windowHeight, windowWidth) / 2;
      this.lastArc = edge > maxEdge;

      // If this is the first arc of the fractal, then choose a center
      if (this.center == null) {
	center = {
	  x: -radius * Math.cos(currentState.angle),
	  y: -radius * Math.sin(currentState.angle)
	};
      } else if (this.lastArc) {
	// If we've almost exceeded the boundary of the canvas, then this is the last arc of the fractal
	// and we return to the origin

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
      this.subArcPct = lengthPerTick / (radius * Math.abs(deltaAngle));
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
    subArcPct: 0,
    // current tick of the current arc
    subArcTick: 0,
    // whether this is the last arc to draw for this fractal
    lastArc: false
  };
  
  /** 
   * Draw a single tick of an arc
   * @return True if the fractal is complete
   */
  var drawTick = function() {
    if (currentState.subArcPct === 0 || currentState.subArcTick * currentState.subArcPct >= 1) {
      if (currentState.lastArc) {
	return true;
      }
      
      currentState.chooseNewArc();
      currentState.subArcTick = 0;
    }
    
    var startAngle = currentState.angle + currentState.subArcTick * (currentState.deltaAngle * currentState.subArcPct);
    var deltaAngle = currentState.subArcPct * currentState.deltaAngle;
    if ((currentState.subArcTick + 1) * currentState.subArcPct >= 1) {
      deltaAngle = (1 - currentState.subArcTick * currentState.subArcPct) * currentState.deltaAngle;
    }
    
    currentState.subArcTick++;
    
    if (mirrorEnabled) {
      ctx.strokeStyle = '#A9A9A9';
      drawArcs(
	ctx,
	createMirror(toPolar(currentState.center)),
	currentState.radius,
	  -startAngle,
	  -deltaAngle
      );
    }

    ctx.strokeStyle = "#" + primaryColors[fractalIter % primaryColors.length];
    drawArcs(
      ctx,
      toPolar(currentState.center),
      currentState.radius,
      startAngle,
      deltaAngle
    );
    
    if (debug) {
      line(ctx, currentState.center, currentState.end());
    }
    
    return false;
  };
  
  var draw = function() {
    if (stop) {
      console.log("window height: " + windowHeight);
      console.log("window width: " + windowWidth);
      console.log("random: " + JSON.stringify(storeRandom));
      return;
    }
    
    var done = drawTick();
    debugTick++;
    
    if (debugTick == 11) {
      stop = true;
    }

    if (!done) {
      setTimeout(draw, refreshInterval);
    } else {
      ctx.canvas.style.opacity = 0;
      setTimeout(function() {
	drawFractal(fractalIter + 1);
      }, refreshInterval);
      
      setTimeout(function() {
	document.body.removeChild(ctx.canvas);
      }, fadeDuration);
    }
  };
  
  draw();
};
