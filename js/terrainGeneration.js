TerrainBuilder = function(width, height, segments, smoothingFactor, boundaryHeight) {

	this.segments = segments;
	this.smoothingFactor = smoothingFactor;

	this.width = width;
	this.height = height;
	
	this.terrain = new Array();
	
	// internal functions
	this.init = function() {
		this.terrain = new Array();
		for(var i = 0; i <= this.segments; i++) {
			this.terrain[i] = new Array();
			for(var j = 0; j <= this.segments; j++) {
				this.terrain[i][j] = 0;
			}
		}
	};
	
	this.diamondSquare = function() {
		this.init();
		
		var size = this.segments+1;
		for(var length = this.segments; length >= 2; length /= 2) {
			var half = length/2;
			this.smoothingFactor /= 2;

			// generate the new square 
			for(var x = 0; x < this.segments; x += length) {
				for(var y = 0; y < this.segments; y += length) {
					var average = this.terrain[x][y]+ // top left
					this.terrain[x+length][y]+ // top right
					this.terrain[x][y+length]+ // lower left
					this.terrain[x+length][y+length]; // lower right
					average /= 4;
					average += 2*this.smoothingFactor*Math.random()-this.smoothingFactor;
					
					this.terrain[x+half][y+half] = average;
				}
			}

			// generate the diamond 
			for(var x = 0; x < this.segments; x += half) {
				for(var y = (x+half)%length; y < this.segments; y += length) {
					var average = this.terrain[(x-half+size)%size][y]+ // middle left
							this.terrain[(x+half)%size][y]+ // middle right
							this.terrain[x][(y+half)%size]+ // middle top
							this.terrain[x][(y-half+size)%size]; // middle bottom
					average /= 4;
					average += 2*this.smoothingFactor*Math.random()-this.smoothingFactor;
					
					this.terrain[x][y] = average;

					// values on the top and right edges
					if(x === 0)
						this.terrain[this.segments][y] = average;
					if(y === 0)
						this.terrain[x][this.segments] = average;
				}
			}
		}

		//set customize height
    	for (var i = 0; i < this.segments ; i++){ 
    		for (var j = 0; j < this.segments ; j++){ 
        	this.terrain[i][j] += boundaryHeight;

        	}
    	}

		//set boundary
    	for (var i = 0; i < this.segments ; i++){ 
        	this.terrain[0][i] = 0;
        	this.terrain[i][0] = 0;
        	this.terrain[this.segments-1][i] = 0;
        	this.terrain[i][this.segments-1] = 0;
    	}

		return this.terrain;
	};
};