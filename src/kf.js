// var numeric = require('./../node_modules/numeric-1.2.6.js');

function ekf(T, x0, P0, A, B, C, Q, R) {	
	
	return {
		
		T : T,
		
		//var state = {
		x : x0,
		P : P0,
		A : A,
		C : B,
		Q : Q,
		R : R,
		//};
		
		/*
		state.x = [[100],[0]];
		
		state.P = [[10,0],[0,10]];
		
		state.A = [[1,T],[0,1]];
		
		state.C = [[1,0]];
		
		state.Q = [[0.05*T,0],[0,0.003*T]];
		
		state.R = [[20.0]];
		
		var y = [[100]];
		var battery = 100;
		*/
		
		// ukf.X = [[]];
		
		/*
		// Simulation
		var time = 0
		var f = 2*Math.PI*0.02*Math.random();
		for (; time<100; ++time) {
			battery -= 0.4 + 0.4*Math.sin(f*time) + 0.3*Math.random();
			y[0][0] = battery + 5.0*(Math.random()-0.5);
			
			timeUpdate(state);
			measurementUpdate(y, state);
			values.push({x: time, y: state.x[0]});
			valuesMeasurements.push({x: time, y: y[0][0]});
		}
		
		// Prediction
		--time;
		for (; time<150; ++time) {
			
			timeUpdate(state);
			
			console.log(state.x[0][0]);
			var std = Math.sqrt(state.P[0][0]);
			
			valuesPredicitonMean.push({x: time, y: state.x[0][0]});
			valuesPredicitonOptimistic.push({x: time, y: (state.x[0][0] + std)});
			valuesPredicitonPesemistic.push({x: time, y: (state.x[0][0] - std)});
		
			battery -= 0.4 + 0.4*Math.sin(f*time) + 0.3*Math.random();
			y[0][0] = battery + 3.0*(Math.random()-0.5);
			valuesMeasurements.push({x: time, y: y[0][0]});
		}
		*/
		
		timeUpdate : function(state){
		
			var dot = numeric.dot;
			var trans = numeric.transpose;
			var add = numeric.add;
			var sub = numeric.sub;
			var inv = numeric.inv;
		
			var x = dot( state.A, state.x );
			var P = add( dot( state.A, dot(state.P, trans(state.A) ) ), state.Q);
			
			this.x = x;
			this.P = P;
			
			return this;
			
		},
		
		/*
		function timeUpdateUkf(state){
		
			var dot = numeric.dot;
			var trans = numeric.transpose;
			var add = numeric.add;
			var sub = numeric.sub;
			var inv = numeric.inv;
		
			var x = dot( state.A, state.x );
			var P = add( dot( state.A, dot(state.P, trans(state.A) ) ), state.Q);
			
			state.x = x;
			state.P = P;
			
			return state;
			
		};
		*/
		
		measurementUpdate : function (y, state) {
			
			var dot = numeric.dot;
			var trans = numeric.transpose;
			var add = numeric.add;
			var sub = numeric.sub;
			var inv = numeric.inv;
			
			var CT = trans(state.C);
			
			var eps = sub( y, dot( state.C, state.x ) );
			var S = add( dot( state.C, dot( state.P, CT ) ), state.R );
			var K = dot( state.P, dot( CT, inv(S) ) );
			
			this.x = add( state.x, dot(K, eps) );
			this.P = sub( state.P, dot( K, dot( state.C, state.P) ) );
			
			return this;
		}
		
	}
}