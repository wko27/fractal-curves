/**
 * 
 */
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var lineWidth = window.devicePixelRatio <= 1 ? 2 : 1;

/** Length of an arc to draw per tick (speed of animation) */
var lengthPerTick = 10;
/** Refresh interval in ms */
var refreshInterval = 30;
/** Duration of the fade in milliseconds */
var fadeDuration = 5000;

var primaryColors = ["031DFF", "0AA4FF", "03D0E8", "03FFD4"];

var replicationFactor = 16;
var mirrorEnabled = true;
var stop = false;

var debug = true;
var debug = false;
var debugTick = 0;
var debugWindowWidth = 1440;
var debugWindowHeight = 723;
var debugRandom = [36.66749472867343,0.5803072437061573,40.54311063412653,1.095065208473482,46.75566512044486,0.6889392227448371,29.39461449466377,1.5043404840968815,29.246486977465853,2.5270691827877942,44.89622222458398,2.071488964454456,28.47217691107543,2.240188308062647,34.22089343560671,0.45817129755060415,23.213031840674955,0.6949415143906211,29.466983116830487,0.3120763376537161,41.77709794833548,1.784254068181204,38.01305499867807,2.495799945044138,27.956854622509304,2.117407986280862,43.64856970759081,0.19928420169101,25.429133930898118,1.88075650939983,47.99592675205919,2.593528778243238,44.09284134601582,0.01697566665828437,37.40807511805197,2.990666831806416,20.656888777622818,2.368879535204684,34.244717669516575,1.1891090259144164,36.838805641252065,2.7983089096735982,30.798215746937565,1.1727125486292675,22.0588134958852,1.5163022590823703,45.68895137576213,1.7030539228309174,47.14459847209878,1.1955399131111042,26.42215870818317,0.6559075347919783,35.29876771475159,3.088209415524267];
var debugRandom = [27.962843813932935,3.0939100600351352,24.170794289120362,2.6219526639074973,30.041845891194583,0.6516121457289219,45.26320423775822,1.102265259939747,29.28763965305206,1.979026146019445,24.978783980135056,0.02843713285962057,24.35827389266104,3.0804393955318905,28.921820159641925,2.8366946770439365,33.235753572143125,0.19692795191124332,33.630051990377616,0.1435927902919604,33.06539334582426,1.7513902970366828,40.63615206999657,1.1678772010984182,20.522566541897923,0.34461070766055174,49.78821235011968,1.5294823386030196,36.12087691923132,3.0415662846349982,39.07220775143301,0.2506656342763163];
var debugRandom = [24.211414905190836,1.5516969722623675,42.844115515888745,0.005811902718701385,45.35917548990889,3.0944022059104928,48.64211635201818,2.1631624145821977,25.69107316341308,2.5250690970976053,31.308238857963882,2.8353846340899262,42.40947085085639,0.45270941516598917,32.030004179430584,2.61606620393954,33.56291171051288,2.0986699936005104];
var debugRandom = [22.114510674423848,2.3539754048546726,26.36204043344096,2.0095878245358,25.772525864273398,1.314034450479928,45.527751369124225,0.9160868361670123,42.234748471590954,2.4056515816243467,41.259034206580935,2.1073352837621653,42.98704943357763,1.201587529428262,33.37887892251614,0.45164352112689615,46.89729246507718,1.8592255075081188];
var debugRandom = [46.89542296488316,0.24844424592404007,47.77839694346281,0.33300522356409235,23.37836401511641,0.2399935295244348,26.52091418357685,1.5479701598892481,39.80642441399988,1.6692386805477546,45.47429476414752,0.8973942908074762,22.20269047446734,0.818289777579056,36.51407176213415,1.242609008709481,38.904141894693254,1.9200512303324722,49.96003863260442,1.2096756759511176,38.94627066745685,0.171768091259403,38.16813114036388,2.1018087708945234,32.37906924648506,3.1232263592132936,45.88693877137572,2.674441956251635,34.10904337771987,0.8209850834383963,43.47629550025222,2.3171634495615625,29.564943854377596,1.429492250494885,48.069651082009,2.89535893957082,36.086697105614704,0.6369580015455181,21.651906058543844,1.0482097862658775,29.577546245643756,1.729700237891406,44.998650527589426,1.1278257797508804,22.28194298011183,2.1648195309886336,35.55265653295428,0.5664509939526579,22.845460447998697,1.6369786934901922,37.189386820741234,2.5784678801581236,49.46245223262916,2.194439114575927,39.52896614827145,0.3108531270980144,48.95434076395904,2.0993602469370667,34.72657482774727,2.2551536264754706,23.408755462148044,1.9548065695286003,45.480705348068525,2.567705961518342,36.19078812122214,2.762126676210352,32.28113825801242,1.4887812352094827,28.301840401785,1.1355833772754993,31.10872727419713,1.1320495049229518,38.778154738242364,1.6734643366753221,35.32918708739314,0.12659800351928055,20.462915260024324,0.08742002154044719,37.67622042400069,0.33253764329584,46.17529026842899,0.1672125922818676,46.0785542728737,0.05972570524938322,44.98105172577162,2.150224658023357,22.51039132704272,0.6060889830272538,24.910620657240173,2.957946008807311,32.40217190521142,0.5529595095086501,31.87358363549705,0.7593852779794474,30.320176459781045,2.229861123198928,44.44992813666661,0.4046443469247972,20.173343327085583,0.6151969601032388,40.97952183946862,0.9093397990135009,28.736041241122855,1.9389086929843233,33.48484562918587,0.08178734453446641,48.4349189168141,0.9741697789783791,37.85886878935095,0.4932448067313524,25.68352464453782,2.581079896982615,23.26560916562289,2.472252908951514,47.726635646093804,1.3759180521460486,49.85032747956819,1.0779178282076596,27.1738556399931,0.9562821998147673,25.658661296446404,2.94618352233207,46.06689317687777,1.1634672436921254,41.63965250105693,1.427962921561304,39.92661339147874,0.41502336009565205,29.440838074677583,0.25651750773252696,39.75994887042093,0.2057517259955229,32.47984299196542,0.16551311824743456,40.855815078959616,1.6356244813488945,47.85819506033928,2.8585205905405777,49.25602313033846,2.302345355617418,42.649027121772534,2.3294235254965248,20.245829690819576,1.4880563667326543,33.65032314021775,0.12725451693600298,20.25215104770682,0.24846665928343117,38.818130205313935,3.0749369826966437,20.646535133090136,1.072372661756579,45.20963739279348,0.5133345066931593,20.72811447600678,1.3604875740750522,48.07386469425828,0.7447681936789058,29.16548012333552,2.5449049272146214,36.25696758361097,1.1823908378339267,21.252294060643557,2.472231322740372,24.67205275344343,2.1512760113103244,29.4595028121242,0.1479715993609877,26.113270990846768,2.096469553904677,30.17272424447058,1.8072424140328565,37.567122221263794,0.7283170316080917,26.03807640222928,0.8682890366356312,22.429137132993066,3.090136193086547,21.048503803225763,1.6735230764279643,23.168967184056342,0.42159176079588523,42.58081425586878,1.6285260558761772,34.39132522106465,3.053801077463905,25.71808979914399,2.0336192540959703,42.44751511073464,2.111214625025851,44.159589581604365,0.29242631387241885];
var debugRandom = [47.1898447436466,1.07717983788048,21.532234698822343,1.8723348279249639,44.62916000307403,0.5943389231384614,42.55267728709565,0.04490060593328688,29.17008255331229,2.1628186758076016,41.07860831725995,1.3386482068301202,20.750362701195723,1.6411890212277995,28.06551967269901,0.30903395947828366,40.32556842290387,1.4414819898183362,30.285433085342994,0.7291538031978385,39.12370228665961,2.5271798532713703,36.726096243174624,0.49850049164054727,45.98713735233552,0.26571156579476113,45.84171193761727,0.10582606035293507,44.366225205095745,2.218235780819926,46.332572712593894,2.5487658606593446,45.50490054716825,3.1192694046601197,40.26591104748046,3.074165361172974,20.91664040192469,2.4145813784870493,38.616031220889184,0.9866486108118528,22.84442576169203,0.2100294473176442,45.21590515522026,2.402389560813397,22.906304626162022,0.3657937295617002,43.39569597639551,1.738181164299975,36.99237767162826,0.7648299123900194,29.86306848911009,2.4614226137080033,35.62403900988286,1.3259519928445835,34.402473814405965,1.907464822231821,26.435202136764637,2.90505394419918,30.042836561742703,0.8468093988781522,45.85722831505138,0.7050138185260577,22.42861473682637,2.4546874147365747,41.61806077358483,1.0909515539293257,48.768289849942875,0.43265843009240007,44.3136135536961,0.42499521775103,24.040814699380554,2.761520798100188];
var storeRandom = [];

if (debug) {
  replicationFactor = 1;
  mirrorEnabled = false;
//  windowWidth = debugWindowWidth;
//  windowHeight = debugWindowHeight;
  lengthPerTick = 1000;

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
  // thanks yeager :P
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
//  ctx.translate(0, -300);
  
  return ctx;
}

function normalize(angle) {
  var mod = 2 * Math.PI;
  return ((angle % mod) + mod) % mod;
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
      // Add pi to switch from cw to cc
      var angle = normalize(this.angle + this.deltaAngle + Math.PI);
      var radius = uniform(20, 50);
      var deltaAngle = uniform(0, Math.PI);

      // Switch from cw to cc or vice versa
      if (currentState.deltaAngle > 0) {
        deltaAngle = -deltaAngle;
      }

      var center;
      // Check if the end point would be out of the canvas
      var edge = Math.max(
      Math.abs(current.x + radius * Math.cos(deltaAngle)),
      Math.abs(current.y + radius * Math.sin(deltaAngle)));
      var maxEdge = Math.min(windowHeight, windowWidth) * 2 / 6;
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
        
        // Track whether we were clockwise or not
        var wasClockwise = this.deltaAngle > 0;
        
        // Track whether the new circle needs to be internal or external to the old circle
        // If the angle from the old center to the current point to the origin is obtuse, then the new circle
        // and old circle are internally tangent (in which case, our starting angle should be the same as the
        // last ending angle).
        var centerToCurrentDistSq = this.radius * this.radius;
        var currentToOriginDistSq = current.x * current.x + current.y * current.y;
        var centerToOriginDistSq = this.center.x * this.center.x + this.center.y * this.center.y;
        var flipCenter = centerToCurrentDistSq + currentToOriginDistSq > centerToOriginDistSq;
        
        if (flipCenter) {
          angle = normalize(angle + Math.PI);
        }
        
	    var target = circleAtTarget(current, {x: 0, y: 0}, angle);
    	center = target.center;
    	radius = target.radius;
    	
    	// Note that Math.acos's range is [0, pi]
    	var startAngle = normalize(Math.acos(-(center.x - current.x) / radius));
    	var endAngle = normalize(Math.acos(-center.x / radius));
    	
    	// Normalize the start and end angle to [0, 2pi]
    	if (center.y > current.y) {
    		startAngle = -startAngle;
    	}
	    
    	if (center.y > 0) {
	    	endAngle = -endAngle;
    	}

    	angle = startAngle;
    	deltaAngle = endAngle - angle;
        
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
    // also there's a chilly joke somewhere in here
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
    console.log(debugTick);
    if (debug && debugTick == 50) {
      stop = true;
      throw new Error();
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