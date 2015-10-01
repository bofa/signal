// Double inverted pendulum: https://math.hawaii.edu/home/theses/MA_2007_Langdon.pdf

var M = 10,
    p = 2,
	q = 4,
	lp = 0.618,
	lq = 1,
	g = 2;
	

var A = [[0, 0, 0, 0, (-q*g*p -p*p*g)/(p*M), 0],
		 [0, 0, 0, 0, (-q*g*M - q*g*p - p*g*M - p*p*g)/(lp*p*M), q*g/(p*lp)],
		 [0, 0, 0, 0, (-q*g - g*p)/(p*lp), (g*p + g*q)/(p*lq)],
		 [1, 0, 0, 0, 0, 0],
		 [0, 1, 0, 0, 0, 0],
		 [0, 0, 1, 0, 0, 0]];
		 
var B = [[1],
		 [-1/lp],
		 [0],
		 [0],
		 [0],
		 [0]];