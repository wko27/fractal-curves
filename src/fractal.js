/**
 * Draw some pretty arcs
 */
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const lineWidth = window.devicePixelRatio <= 1 ? 2 : 1;

/** Maximum radius of a circle */
const maxRadius = Math.min(windowWidth, windowHeight) * Math.PI / 8;
/** Length of an arc to draw per tick (speed of animation) */
const lengthPerTick = 10;
/** Refresh interval in ms */
const refreshInterval = 30;
/** Duration of the fade in milliseconds */
const fadeDuration = 5000;

const primaryColors = ["92FF2A", "4367FF", "CC3A0D", "F456FF", "3CFFD4"];

const mirrorEnabled = true;
var stop = false;

var debug = true;
var debug = false;
let debugTick = 0;
const debugWindowWidth = 1440;
const debugWindowHeight = 723;
var debugRandom = [36.66749472867343,0.5803072437061573,40.54311063412653,1.095065208473482,46.75566512044486,0.6889392227448371,29.39461449466377,1.5043404840968815,29.246486977465853,2.5270691827877942,44.89622222458398,2.071488964454456,28.47217691107543,2.240188308062647,34.22089343560671,0.45817129755060415,23.213031840674955,0.6949415143906211,29.466983116830487,0.3120763376537161,41.77709794833548,1.784254068181204,38.01305499867807,2.495799945044138,27.956854622509304,2.117407986280862,43.64856970759081,0.19928420169101,25.429133930898118,1.88075650939983,47.99592675205919,2.593528778243238,44.09284134601582,0.01697566665828437,37.40807511805197,2.990666831806416,20.656888777622818,2.368879535204684,34.244717669516575,1.1891090259144164,36.838805641252065,2.7983089096735982,30.798215746937565,1.1727125486292675,22.0588134958852,1.5163022590823703,45.68895137576213,1.7030539228309174,47.14459847209878,1.1955399131111042,26.42215870818317,0.6559075347919783,35.29876771475159,3.088209415524267];
var debugRandom = [13.42298084888047,24.80115325249382,1.8380026806310203,44.914203615025556,2.3988079560698226,48.39349077638127,2.732747984644082,45.50264840259338,1.9997805138517792,34.95876557391794,0.4587844822511333,37.99467221915827,3.090941524427886];
var storeRandom = [];

if (debug) {
  mirrorEnabled = false;
//  windowWidth = debugWindowWidth;
//  windowHeight = debugWindowHeight;
  lengthPerTick = 1000;

}

function drawAxis() {
  (function() {
     const ctx = createCanvasContext();
     const center = {
       radius: 0,
       angle: 0
     };
     const edge = {
       radius: Math.max(windowWidth, windowHeight),
       angle: 0
     };
     ctx.lineWidth = 1;
     ctx.strokeStyle = "grey";
     drawLines(8, ctx, center, edge);
   }());
}

function start(axisOn) {
  // draw axes
  if (axisOn) {
    drawAxis();
  }

  // draw first fractal
  drawFractal(0);
}

/**
 * @return Randomly chosen value from Gaussian distribution on (-inf, +inf)
 * Note this uses the Box-Muller method and is pretty slow
 */
function gaussian(mu, sigma) {
  const u = 1 - uniform(0, 1); // Subtraction to flip [0, 1) to (0, 1].
  const v = 1 - uniform(0, 1);
  return mu + sigma * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** @return Randomly chosen value from uniform distribution on [0, 1) */
function uniform(lower, upper) {
  let r;
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
function createReplicas(replicationFactor, c) {
  const replicas = [];
  let x;
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
function drawLines(replicationFactor, ctx, current, next) {
  const currentReplicas = createReplicas(replicationFactor, current);
  const nextReplicas = createReplicas(replicationFactor, next);
  var x;
  for (x = 0; x < replicationFactor; x++) {
    let xCurrent = toCartesian(currentReplicas[x]);
    let xNext = toCartesian(nextReplicas[x]);

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
function drawArcs(replicationFactor, ctx, center, radius, startAngle, deltaAngle, style) {
  const counterClockwise = deltaAngle < 0;
  const replicas = createReplicas(replicationFactor, center);
  let i;
  for (i = 0; i < replicationFactor; i++) {
    const replica = toCartesian(replicas[i]);
    const replicaStartAngle = startAngle + i * 2 * Math.PI / replicationFactor;
    const replicaEndAngle = (startAngle + deltaAngle) + i * 2 * Math.PI / replicationFactor;
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
  const oldWidth = ctx.lineWidth;
  const oldStyle = ctx.strokeStyle;
  ctx.lineWidth = 1;
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
  const a = from.x - to.x;
  const b = from.y - to.y;

  // basically we're solving for two linear equations
  // (x - a)^2 + (x - b)^2 = x^2 + b^2 since the center's distance to the current point is equivalent to the center's distance to the origin
  // a = x + r * cos(theta) and b = x + r * sin(theta) since the angle to current is fixed
  // thanks yeager :P
  const x = (a * a - b * b + 2 * a * b * Math.tan(angle)) / (2 * (a + b * Math.tan(angle)));
  const y = ((a * a + b * b) / 2 - a * x) / b;
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
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  canvas.width = windowWidth;
  canvas.height = windowHeight;

  canvas.style.padding = 0;
  canvas.style.margin = "auto";
  canvas.style.display = "block";
  canvas.style.transition = "opacity " + fadeDuration + "ms ease-out";
  canvas.style.position = "absolute";

  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  return ctx;
}

function normalize(angle) {
  const mod = 2 * Math.PI;
  return ((angle % mod) + mod) % mod;
}

/** Draw a single randomized fractal that starts and ends at the origin */
function drawFractal(fractalIter) {
  const ctx = createCanvasContext();
  ctx.lineWidth = lineWidth;

  const currentState = {
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
    /** Set the target arc back to the origin */
    returnToOrigin: function() {
      const current = this.end();

      // If we've almost exceeded the boundary of the canvas, then this is the last arc of the fractal
      // and we return to the origin

      // Track whether we were clockwise or not
      const wasClockwise = this.deltaAngle > 0;

      // Track whether the new circle needs to be internal or external to the old circle
      // If the angle from the old center to the current point to the origin is obtuse, then the new circle
      // and old circle are internally tangent (in which case, our starting angle should be the same as the
      // last ending angle).
      const centerToCurrentDistSq = this.radius * this.radius;
      const currentToOriginDistSq = current.x * current.x + current.y * current.y;
      const centerToOriginDistSq = this.center.x * this.center.x + this.center.y * this.center.y;
      const flipCenter = centerToCurrentDistSq + currentToOriginDistSq > centerToOriginDistSq;
      let angle;
      if (flipCenter) {
        angle = normalize(this.angle + this.deltaAngle + Math.PI);
      } else {
	angle = normalize(this.angle + this.deltaAngle);
      }

      const target = circleAtTarget(current, {x: 0, y: 0}, angle);
      const center = target.center;
      const radius = target.radius;
      if (radius > maxRadius) {
	return false;
      }

      // Note that Math.acos's range is [0, pi]
      let startAngle = normalize(Math.acos(-(center.x - current.x) / radius));
      let endAngle = normalize(Math.acos(-center.x / radius));

      // Normalize the start and end angle to [0, 2pi]
      if (center.y > current.y) {
        startAngle = -startAngle;
      }

      if (center.y > 0) {
        endAngle = -endAngle;
      }

      angle = startAngle;
      let deltaAngle = endAngle - angle;

      if (flipCenter ^ wasClockwise) {
        // negative
        if (deltaAngle > 0) {
          deltaAngle -= 2 * Math.PI;
        }
      } else {
        // positive
        if (deltaAngle < 0) {
          deltaAngle += 2 * Math.PI;
        }
      }

      this.center = center;
      this.radius = radius;
      this.angle = angle;
      this.deltaAngle = deltaAngle;
      this.subArcPct = lengthPerTick / (radius * Math.abs(deltaAngle));

      return true;
    },
    /** Chooses a new target arc */
    chooseNewArc: function() {
      const current = this.end();
      // Add pi to switch from cw to cc
      const angle = normalize(this.angle + this.deltaAngle + Math.PI);
      const radius = uniform(20, 50);
      let deltaAngle = uniform(0, Math.PI);
      let center;

      // Switch from cw to cc or vice versa
      if (currentState.deltaAngle > 0) {
        deltaAngle = -deltaAngle;
      }

      // Check if the end point would be out of the canvas
      const edge = Math.max(
	Math.abs(current.x + radius * Math.cos(deltaAngle)),
	Math.abs(current.y + radius * Math.sin(deltaAngle))
      );
      const maxEdge = Math.min(windowHeight, windowWidth) * 2 / 6;

      // If this is the first arc of the fractal, then choose a center
      if (edge > maxEdge && this.returnToOrigin()) {
	this.lastArc = true;
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
	this.center = center;
	this.radius = radius;
	this.angle = angle;
	this.deltaAngle = deltaAngle;
	this.subArcPct = lengthPerTick / (radius * Math.abs(deltaAngle));
      }
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
    // also there's a chilly joke somewhere in here
    subArcTick: 0,
    // whether this is the last arc to draw for this fractal
    lastArc: false,
    // how many replicas
    replicationFactor: uniform(4, 16)
  };

  /**
   * Draw a single tick of an arc
   * @return True if the fractal is complete
   */
  const drawTick = function() {
    if (currentState.subArcPct === 0 || currentState.subArcTick * currentState.subArcPct >= 1) {
      if (currentState.lastArc) {
	return true;
      }

      currentState.chooseNewArc();
      currentState.subArcTick = 0;
    }

    const startAngle = currentState.angle + currentState.subArcTick * (currentState.deltaAngle * currentState.subArcPct);
    let deltaAngle = currentState.subArcPct * currentState.deltaAngle;
    if ((currentState.subArcTick + 1) * currentState.subArcPct >= 1) {
      deltaAngle = (1 - currentState.subArcTick * currentState.subArcPct) * currentState.deltaAngle;
    }

    currentState.subArcTick++;

    if (mirrorEnabled) {
      ctx.strokeStyle = '#A9A9A9';
      drawArcs(
	currentState.replicationFactor,
	ctx,
	createMirror(toPolar(currentState.center)),
	currentState.radius,
	  -startAngle,
	  -deltaAngle
      );
    }

    ctx.strokeStyle = "#" + primaryColors[fractalIter % primaryColors.length];
    drawArcs(
      currentState.replicationFactor,
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

  const draw = function() {
    const done = drawTick();

    debugTick++;
    if (debug) {
      if (debugTick == 5000) { stop = true; throw new Error(); }
      console.log(debugTick);
    }

    if (!done) {
      setTimeout(draw, refreshInterval);
    } else {
      ctx.canvas.style.opacity = 0;
      if (!stop) {
	setTimeout(function() {
	  drawFractal(fractalIter + 1);
	}, refreshInterval);
      }

      setTimeout(function() {
        document.body.removeChild(ctx.canvas);
      }, fadeDuration);
    }
  };

  draw();
};

module.exports = {
  start: start,
  stop: () => {
    stop = true;
  }
};

/*
var ctx = createCanvasContext();
var i = 0;
//for (a = 0; a < 5; a++) {
for (a = 0; a < 10; a++) {
	var startAngle = a * Math.PI / 5 + Math.PI;
//	var deltaAngle = Math.PI / 10;
	var deltaAngle = Math.PI / 10;
	var radius = 100;
	ctx.strokeStyle = "black";
	var center = {x: 0, y: 0};
//	var center = {x: 0, y: 0};
	drawArcs(
	  ctx,
	  toPolar(center),
	  radius,
	  startAngle,
	  deltaAngle
	);

	var current = {
		x: center.x + radius * Math.cos(startAngle + deltaAngle),
		y: center.y + radius * Math.sin(startAngle + deltaAngle)
	};
	ctx.strokeStyle = "orange";
	circle(ctx, current);

    var angle = normalize(startAngle + deltaAngle + Math.PI);

for (i = 0; i < 1; i++) {
	// Check if we need to rotate the angle by pi
	// Specifically, we're checking if the last center point is "closer" to the origin than the "current"
	// If it is further, i.e. the angle is obtuse, then we flip
	var centerToCurrentDistSq = (center.x - current.x) * (center.x - current.x) + (center.y - current.y) * (center.y - current.y);
	// old radius
	var currentToOriginDistSq = current.x * current.x + current.y * current.y;
	var centerToOriginDistSq = center.x * center.x + center.y * center.y;
	var wasClockwise = deltaAngle > 0;
	console.log(wasClockwise);
	var flipCenter = centerToCurrentDistSq + currentToOriginDistSq > centerToOriginDistSq;
	if (flipCenter) {
	  angle = normalize(angle + Math.PI);
	  console.log("acute (internal)");
	} else {
	  console.log("obtuse (external)");
	}

	var target = circleAtTarget(current, {x: 0, y: 0}, angle);
	var center = target.center;
	radius = target.radius;
	ctx.strokeStyle = "black";
	circle(ctx, center);
	circle(ctx, {x: 0,y: 0});

	// Note that Math.acos's range is [0, pi]
	var startAngle = normalize(Math.acos(-(center.x - current.x) / radius));
	var endAngle = normalize(Math.acos(-center.x / radius));

	// Correct in case the angle should really be in [pi, 2 pi]
	if (center.y > current.y) {
		startAngle = -startAngle;
	}

	if (center.y > 0) {
		endAngle = -endAngle;
	}

	// By here, angle and end angle are both between [0, 2pi]
	angle = startAngle;
	deltaAngle = endAngle - angle;

	if (flipCenter ^ wasClockwise) {
		console.log("want positive");
		// negative
		if (deltaAngle > 0) {
			deltaAngle -= 2 * Math.PI;
		}
	} else {
		// positive
		if (deltaAngle < 0) {
			deltaAngle += 2 * Math.PI;
		}
	}

	drawArcs(
	  ctx,
	  toPolar(center),
	  radius,
	  startAngle,
	  deltaAngle
	);
}
}
*/

/*
var ctx = createCanvasContext();
var i = 0;
var j = 0;
var k = 0;

for (j = -100; j <= 100; j+= 100) {
for (k = -100; k <= 100; k+= 100) {
for (i = 0; i < 10; i++ ) {
	var angle = 2 * i * Math.PI / 10;
	var current = {x: j, y: k};
	var target = circleAtTarget(current, {x: 0, y: 0}, angle);
	center = target.center;
	radius = target.radius;
	ctx.strokeStyle = "orange";
	circle(ctx, current);
	ctx.strokeStyle = "black";
	circle(ctx, center);
	circle(ctx, {x: 0,y: 0});

	console.log("angle is: " + angle);
	console.log("current is: " + current.x + " " + current.y);
	console.log("center is: " + center.x + " " + center.y);
	console.log("radius is: " + radius);

	// Note that Math.acos's range is [0, pi]
	var startAngle = normalize(Math.acos(-(center.x - current.x) / radius));
	var endAngle = normalize(Math.acos(-center.x / radius));

	if (center.y > current.y) {
		startAngle = -startAngle;
	}

	if (center.y > 0) {
		endAngle = -endAngle;
	}

	console.log("starting angle is: " + (startAngle / Math.PI) + " pi");
	console.log("ending angle is: " + (endAngle / Math.PI) + " pi");

	var startPoint = {
		x: center.x + radius * Math.cos(startAngle),
		y: center.y + radius * Math.sin(startAngle)
	};
	console.log("start point is: " + startPoint.x + " " + startPoint.y);
	var endPoint = {
		x: center.x + radius * Math.cos(endAngle),
		y: center.y + radius * Math.sin(endAngle)
	};

	ctx.strokeStyle = 'red';
	line(ctx, center, startPoint);
	ctx.strokeStyle = 'blue';
	line(ctx, center, endPoint);

}
}
}
*/