// var numeric = require('./../node_modules/numeric-1.2.6.js');

/*
// Example values for the control system.

var add = numeric.add;
var trans = numeric.transpose;
var inv = numeric.inv;
var mult = numeric.dot;
var sub = numeric.sub;
var diag = numeric.diag;

var M = 50;
var r = 0.1;
var I = 1/3*M*r*r;

var Acont = [[0,  1,  0,  0,  0,  0],
            [0,  0,  0,  0,  0,  0],
            [0,  0,  0,  1,  0,  0],
            [0,  0,  0,  0,  0,  0],
            [0,  0,  0,  0,  0,  1],
            [0,  0,  0,  0,  0,  0],
        ];

var Bcont = [ 	[0, 0],
              [0, -0.5/M],
              [0, 0],
              [1/M, 0],
              [0, 0],
              [0, -0.5*I*r],
            ];

var dtA = diag([0.02,0.02,0.02,0.02,0.02,0.02]);
var dtB = diag([0.02,0.02]);

var A = add(diag([1,1,1,1,1,1]), mult(Acont,dtA));
var B = mult(Bcont,dtB);

var Q = numeric.diag([2e2,1e2,1e-1,1e1,1e2,1e1]);
var R = numeric.diag([1e2,1e-1]);

var L = lqr(A,B,Q,R,10);
*/

/*
A,B is the discrete dynamics for the system.
Q,R is the state and control signal penalty.
*/
module.exports = function lqr(A,B,Q,R,iterations) {
  
  // Default 1000 iterations
  iterations = typeof iterations !== 'undefined' ? iterations : 1000;

  var add = numeric.add;
  var trans = numeric.transpose;
  var inv = numeric.inv;
  var mult = numeric.dot;
  var sub = numeric.sub;
  var diag = numeric.diag;
  
  // To solve the algebraic Riccati equation by iterating the dynamic Riccati equation of the finite-horizon case until it converges.
  // https://en.wikipedia.org/wiki/Linear-quadratic_regulator
  function interateP(P, A, B, R, Q) {
    var At = trans(A);
    var Bt = trans(B);
    
    var part1 = mult(mult(At,P),A);
    var part2 = mult(mult(At,P),B);
    var part3 = inv(add(R,mult(mult(Bt,P),B)));
    var part4 = mult(mult(Bt,P),A);
    
    var part5 = mult(mult(part2,part3),part4);
    
    return add(sub(part1, part5),Q);
  }
  
  function getFeedback(P, A, B, R){
    var Bt = trans(B);
    
    var part1 = add(R, mult(mult(Bt,P),B));
    var part2 = mult(mult(Bt,P),A);

    return mult(inv(part1),part2);    
  }
  
  // Init P to Q
  var P = numeric.clone(Q);
  
  for(var i=0; i<iterations; ++i){
    P = interateP(P,A,B,R,Q);  
  }
  
  return getFeedback(P,A,B,R);

}