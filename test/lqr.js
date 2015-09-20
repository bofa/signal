describe('sorting the list of users', function() {
  it('sorts in descending order by default', function() {
    var users = ['jack', 'igor', 'jeff'];
    var sorted = sortUsers(users);
    expect(sorted).toEqual(['jeff', 'jack', 'igor']);
  });
});

// Example values for the control system.
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