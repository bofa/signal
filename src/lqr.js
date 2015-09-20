var numeric = require('./../node_modules/numeric-1.2.6.js');

function lqr() {

  var add = numeric.add;
  var trans = numeric.transpose;
  var inv = numeric.inv;
  var mult = numeric.dot;
  var sub = numeric.sub;
  var diag = numeric.diag;
  
  function interateP(P, A, B, R, Q) {
    var At = trans(A);
    var Bt = trans(B);
    
    var part1 = mult(mult(At,P),A);
    var part2 = mult(mult(At,P),B);
    var part3 = inv(add(R,mult(mult(Bt,P),B)));
    var part4 = mult(mult(Bt,P),A);
    
    var part5 = mult(mult(part2,part3),part4);
    
    /*
    console.log("p1", numeric.prettyPrint(part1));
    console.log("p2", numeric.prettyPrint(part2));
    console.log("p3", numeric.prettyPrint(part3));
    console.log("p4", numeric.prettyPrint(part4));
    console.log("p5", numeric.prettyPrint(part5));
    */
    
    return add(sub(part1, part5),Q);
    
  }
  
  function getFeedback(P, A, B, R){
    var Bt = trans(B);
    
    var part1 = add(R, mult(mult(Bt,P),B));
    var part2 = mult(mult(Bt,P),A);
    
    
    console.log("p1", numeric.prettyPrint(part1));
    console.log("p2", numeric.prettyPrint(part2));
    
    /*
    var out = numeric.solve(part1,part2);
    
    console.log("out", numeric.prettyPrint(out));
    
    return out
    */
    return mult(inv(part1),part2);
    
  }
  
  
  /*
  {m0: 10,m1: .5,L: 1,g: 9.81,theta: 0.2,dtheta: 0,x: -2,dx: 0,F: 0,T: 0})
  */
  
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
  var P = numeric.clone(Q);
  
  console.log("P", numeric.prettyPrint(P));
  console.log("A", numeric.prettyPrint(A));
  console.log("B", numeric.prettyPrint(B));
  console.log("R", numeric.prettyPrint(R));
  console.log("Q", numeric.prettyPrint(Q));
  
  for(var i=0; i<10000; ++i){
    P = interateP(P,A,B,R,Q);  
  }
  
  console.log("P", numeric.prettyPrint(P));
  
  var L = getFeedback(P,A,B,R);
  console.log("L", numeric.prettyPrint(L));
  
  var refx = 0;
  var refy = 150;
  
  function controlFunction(rocket)
  {
    refy -= 0.1;
    refy = Math.max(0,refy);
    
    refx -= 0.5;
    refx = Math.max(10,refx);
    
    var throttle = L[0][0]*(rocket.x-refx) + 
                    L[0][1]*rocket.dx  + 
              L[0][2]*(rocket.y-refy) + 
                    L[0][3]*rocket.dy  + 
                    L[0][4]*rocket.theta +
                    L[0][5]*rocket.dtheta;
    
    var gimbalAngle = L[1][0]*rocket.x + 
                      L[1][1]*rocket.dx  + 
                      L[1][2]*rocket.y + 
                      L[1][3]*rocket.dy  + 
                      L[1][4]*rocket.theta +
                      L[1][5]*rocket.dtheta;
    
    var u={throttle:-throttle+0.5,
          gimbalAngle:-gimbalAngle};
    
    return u;
    // return {throttle:1,gimbalAngle:-0.2};
  }

}