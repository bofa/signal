var numeric = require('./../node_modules/numeric-1.2.6.js');

function linearInterpolator (points) {
    var first, n = points.length - 1,
        interpolated,
        leftExtrapolated,
        rightExtrapolated;

    if (points.length === 0) {
        return function () {
            return 0;
        };
    }

    if (points.length === 1) {
        return function () {
            return points[0][1];
        };
    }

    points = points.sort(function (a, b) {
        return a[0] - b[0];
    });
  
    first = points[0];

    leftExtrapolated = function (x) {
        var a = points[0], b = points[1];
        return a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
    };

    interpolated = function (x, a, b) {
        return a[1] + (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
    };

    rightExtrapolated = function (x) {
        var a = points[n - 1], b = points[n];
        return b[1] + (x - b[0]) * (b[1] - a[1]) / (b[0] - a[0]);
    };

    return function (x) {
        var i;

        if (x <= first[0]) {
            return leftExtrapolated(x);
        }
        for (i = 0; i < n; i += 1) {
            if (x > points[i][0] && x <= points[i + 1][0]) {
                return interpolated(x, points[i], points[i + 1]);
            }
        }
        return rightExtrapolated(x);
    };
};

var sin = Math.sin;
var cos = Math.cos;

var T = 0;
var Tf = 2;

var x0 = [[-2],[0],[0],[0],[0],[0]];

// Init u(t)
var iterpolationArray0 = [];
var iterpolationArray1 = [];
var stepLength = 0.1;

for(var t=T; t<=Tf; t+=stepLength){
  var ut = 0;
  iterpolationArray0.push([t,ut]);
}

for(var t=T; t<=Tf; t+=stepLength){
  var ut = 0;
  iterpolationArray1.push([t,ut]);
}

var control = function(t) {
  return [
  [linearInterpolator(iterpolationArray0)(t)],
  [linearInterpolator(iterpolationArray1)(t)]];
}


function optimalControl(T, Tf, x0, control, iterations) {
  
  var g = 9.81;
  var L = 40;
  
  function dynamics(t, x){
      var u = control(t);
      return [ 
        		[ x[1][0] ], 
               	[ g*u[0][0]*Math.sin(x[4][0]+u[1][0]) ],
                [ x[3][0] ],
                [ g*(u[0][0]*Math.cos(x[4][0]+u[1][0])-1) ],
        		[ x[5][0] ],
        		[ -g*u[0][0]*6/L*Math.sin(u[1][0]) ]
             ];
  }
  
  function hamiltonianDx(t, l){
    // SIC
    var x = xs.at([Tf-t])[0];
    // var x = [0, 0];
    var u = control(Tf-t);

    // console.log("t", t, "x", x, "u", u, "l", l);

    return [ 
        		[ 0 ], 
               	[ l[0][0] ],
                [ 0 ],
                [ l[2][0] ],
        		[ x[4][0] + g*u[0]*( l[1][0]*Math.cos(x[4][0]+u[1]) - l[3][0]*Math.sin(x[4][0]+u[1]) ) ],
        		[ l[2][0] ]
             ];
  }
  
  function hamiltonianDu(t){
    var x = xs.at([t])[0];
    var u = control(t);
    var l = ls.at([Tf-t])[0];
    
    console.log("t", t, "x", x, "l", l, "u", u);

    return [[ u[0][0] + g*( l[1][0]*sin(x[4][0]+u[1][0]) + l[3][0]*cos(x[4][0]+u[1]) - l[5][0]*6/L*sin(u[1][0])) ],
  			[ u[1][0] + g*u[0][0]*( l[1][0]*cos(x[4][0]+u[1][0]) - l[3][0]*sin(x[4][0]+u[1][0]) - l[5][0]*6/L*cos(u[1][0])) ]];
  }
  
  for(var i=0; i<iterations; ++i){
    
    var xs = numeric.dopri(T, Tf, x0, dynamics);
	
    //var ltf = xs.at([Tf])[0]; // [ [0], [0] ];
    var ltf = [ [0], [0], [0], [0], [1], [1]];
    var ls = numeric.dopri(T, Tf, ltf, hamiltonianDx);

    // console.log(xs);
    // console.log(ls);
    
    var iterpolationArray0 = [];
    var iterpolationArray1 = [];
    
    var alpha = numeric.diag([0.01,0.01]);
	
    var endCondition = 0;
    
    for(var t=T; t<=Tf; t+=stepLength){
      var correction = hamiltonianDu(t);
      console.log("correction", numeric.transpose(correction));
      endCondition += numeric.dot(numeric.transpose(correction),correction);
      
      var ut = numeric.sub(control(t), numeric.dot(alpha,correction));

      iterpolationArray0.push([t,ut[0][0]]);
      iterpolationArray1.push([t,ut[1][0]]);
      
      //TODO Adapt to multi dim.
      // alpha *= 0.99;
    }

                               
    control = function(t) {
      return [
      [linearInterpolator(iterpolationArray0)(t)],
      [linearInterpolator(iterpolationArray1)(t)]];
    }
    
    // "Error"
    console.log("Error", endCondition);
  	
  }

  // console.log(iterpolationArray);
  
  return control;
  
}

// console.log("iterpolationArray", iterpolationArray);
control = optimalControl(T, Tf, x0, control, 2);
