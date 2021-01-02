var WIDTH = 1200;
var HEIGHT = 400;
var MAZESIZE = 1001;
var UNIT = 100;
var PI = Math.PI;
var SPEED = 20;

var keyState = {};
var wallTexture = [
	[0,0,0,0,0,0,0,0]
	,[0,1,1,1,1,1,1,0]
	,[0,1,1,0,0,1,1,0]
	,[0,1,1,1,1,1,1,0]
	,[0,0,0,0,0,0,0,0]
];

function inCirkel(x,y,r) {
	x = x - r;
	y = y - r;
	return x*x + y*y < r*r;	
}

function run() {
   let ag = document.getElementById("achtergrond").getContext("2d");
   ag.fillStyle = "#0000CC";
   ag.fillRect(0, 0, WIDTH, (0.6*HEIGHT)|0);
   ag.fillStyle = "#333333";
   ag.fillRect(0, (0.6*HEIGHT)|0, WIDTH, (0.6*HEIGHT)|0);

   let rc = new RayCaster();
   
   let ctx = document.getElementById("screen").getContext("2d");
   rc.renderMaze();
   imageData = new ImageData(rc.buffer, WIDTH);
   ctx.putImageData(imageData, 0,0);
   
   document.addEventListener('keydown', (event) => {
  		keyState[event.key] = true;
  	},false);

   document.addEventListener('keyup', (event) => {
  		keyState[event.key] = false;
  	},false);

	function gameLoop() {
		let update = false;
		if(keyState["ArrowRight"]) {
			rc.rotate(-PI/64);
			update = true;
		}
		if(keyState["ArrowLeft"]) {
			rc.rotate(+PI/64);
			update = update || true;
		}
		if(keyState["ArrowUp"]) {
			rc.move(SPEED);
			update = update || true;
		}
		if(keyState["ArrowDown"]) {
			rc.move(-SPEED);
			update = update || true;
		}
	   rc.renderMaze();
	   imageData = new ImageData(rc.buffer, WIDTH);
	   ctx.putImageData(imageData, 0,0);
		
		setTimeout(gameLoop, 10);
	}
	gameLoop();

}


class RayCaster {
	constructor() {
		this.viewerX = MAZESIZE/2*UNIT;
		this.viewerY = MAZESIZE/2*UNIT;;
		this.viewAngle = 0.0;
		
		this.hitx = 0.0;
		this.hity = 0.0;
		
		this.hitc = 0;
		this.hitr = 0;
		
		this.maze = [];
   		let l = WIDTH*HEIGHT*4;
		this.buffer = new Uint8ClampedArray(l);
		
		this.initMaze();
	}	

	initMaze() {
		for(let c=0; c < MAZESIZE; c++) {
			this.maze[c] = []; 
			for(let r=0; r < MAZESIZE; r++) {
				this.maze[c][r] = Math.random() < 0.15?1:0;
			}
		}
		
		this.maze[(MAZESIZE/2)|0][(MAZESIZE/2)|0] = 0;
	}
	
	clearBuffer() {  
		this.buffer.fill(0);
	}
	
	determineHitSide(c,r, x,y) {
		let cx = c*UNIT + UNIT/2;
		let cy = r*UNIT + UNIT/2;

		let a = x - cx;
		let b = y - cy;

		let angle = Math.atan2(b,a);
		let side = (4*(angle + 2.25*PI)/(2*PI))|0;
		return side;
	}
	
	setPixel(x, y, R, G, B, A) {
		let pos = (x + y * WIDTH)*4;
		this.buffer[pos++] = R;
		this.buffer[pos++] = G;
		this.buffer[pos++] = B;
		this.buffer[pos] = A;
	}
	
	renderLine(line) {
		let angle = this.viewAngle-Math.atan2((line-WIDTH/2)/40, 10);
		let d = 1.0;
		let distance = 0.0;
		let posx = this.viewerX;
		let posy = this.viewerY;
		let hit = false;
		let hitc = 0;
		let hitr = 0;
		while(posx >= 0 && posx < MAZESIZE*UNIT 
			&& posy >= 0 && posy < MAZESIZE*UNIT && !hit) {
			distance += d;
			posx = (distance * Math.cos(angle) + this.viewerX)|0;
			posy = (distance * Math.sin(angle) + this.viewerY)|0;
			hitc = (posx/UNIT)|0;
			hitr = (posy/UNIT)|0;
			if(hitc < MAZESIZE && hitr < MAZESIZE && this.maze[hitc][hitr] > 0) {
				let side = this.determineHitSide(hitc,hitr,posx,posy)|0; 
				let distanceToScreen = 10;
				let scaling = distanceToScreen/(distance*Math.cos(angle-this.viewAngle) + distanceToScreen);
				let projectHeight = 50*UNIT * scaling;
				let screenMiddle = 0.6*HEIGHT;
				let tx = 0;
				if(side % 2 == 1) {
					tx = (Math.abs(posx - hitc * UNIT))|0;
				} else {
					tx = (Math.abs(posx - hitr * UNIT))|0;
				}
								
				tx = tx % 10;
				let ty = 0;
				for(let i=0; i < projectHeight; i++) {
					let sy = (screenMiddle - projectHeight/2 + i)|0;
					if(sy >= 0 && sy < HEIGHT) {
						ty = (i/scaling/50)|0;
						ty = ty%10;
						if(side % 2 == 0) {
							if(tx < 20 && ty < 20) {
								if(inCirkel(tx,ty,5)) {
									this.setPixel(line, sy, 200,50,50,255);
								} else {
									this.setPixel(line, sy, 150,150,150,255);
								}
							}
						} else  {
							if(tx < 20 && ty < 20) {
								if(inCirkel(tx,ty,5)) {
									this.setPixel(line, sy, 200,50,50,255);
								} else {
									this.setPixel(line, sy, 150,150,150,255);
								}
							}
						}
					}
				}
				hit = true;	
			}
		}
	}
	
	renderMaze() {
		this.clearBuffer();
		for(let line = 0; line < WIDTH; line++) {
			this.renderLine(line);
		}
	}
	
	move(amount) {
		this.viewerX += Math.cos(this.viewAngle) * amount;  
		this.viewerY += Math.sin(this.viewAngle) * amount;  
	}
	
	rotate(angle) {
		this.viewAngle += angle;
	}
}
