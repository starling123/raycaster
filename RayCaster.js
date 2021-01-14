export class RayCaster {
	constructor(x,y, map, width, height) {
		this.viewerX = x;
		this.viewerY = y;;
		this.viewAngle = 0.25*Math.PI;
		
		this.hitx = 0.0;
		this.hity = 0.0;
		
		this.hitc = 0;
		this.hitr = 0;
		
		this.map = map;
		this.width = width;
		this.height = height;
		this.distanceToScreen = 10;
		this.screenMiddle = 0.5*this.height;
		
   		let l = this.width*this.height*4;
		this.buffer = new Uint8ClampedArray(l);
	}	
	
	clearBuffer() {  
		this.buffer.fill(0);
	}
	
	setPixel(x, y, color) {
		let y1 = this.height - y;
		let pos = (x + y1 * this.width)*4;
		for(let i=0;i<4;i++) {
			this.buffer[pos+i] = color[i];
		}
	}
	
	renderLine(line) {
		let angle = this.viewAngle-Math.atan2((line-this.width/2)/50, this.distanceToScreen);
		let d = 1.5;
		let distance = 0.0;
		let posx = this.viewerX;
		let posy = this.viewerY;
		let hit = false;
		
		while(this.map.containsPoint(posx,posy) && !hit) {
			distance += d;
			posx = (distance * Math.cos(angle) + this.viewerX)|0;
			posy = (distance * Math.sin(angle) + this.viewerY)|0;
			
			hit = this.map.hitWall(posx,posy);
			if(hit) {
				let scaling = this.distanceToScreen/(distance*Math.cos(angle-this.viewAngle) + this.distanceToScreen);
				let projectHeight = 10000*scaling;
				for(let i=0; i < projectHeight; i++) {
					let sy = (this.screenMiddle - projectHeight/2 + i)|0;
					if(sy >= 0 && sy < this.height) {
						let ty = (i/scaling/50)|0;
						let color = this.map.getColor(ty);
						this.setPixel(line, sy, color);
					}
				}
			} else {
				// floor
				let floorColor = this.map.textures[4].getTexturePixel(posx,posy);
				let ceilingColor = this.map.textures[5].getTexturePixel(posx,posy);
				let scaling = this.distanceToScreen/(distance*Math.cos(angle-this.viewAngle) + this.distanceToScreen);
				let projectHeight = 10000*scaling;
				let sy = (this.screenMiddle - projectHeight/2 )|0;
				if(sy >= 0 && sy < this.height) {
					this.setPixel(line, sy, floorColor);
					this.setPixel(line, this.height-sy, ceilingColor);
				}
				//ceiling
				
			}
		}
	}
	
	render() {
		this.clearBuffer();
		for(let line = 0; line < this.width; line++) {
			this.renderLine(line);
		}
	}
	
	move(amount) {
		let nx = this.viewerX + Math.cos(this.viewAngle) * amount;  
		let ny = this.viewerY + Math.sin(this.viewAngle) * amount; 
		if(this.map.containsPoint(nx,ny) && !this.map.hitWall(nx,ny)) {
			this.viewerX = nx; 
			this.viewerY = ny;
		}  
	}
	
	rotate(angle) {
		this.viewAngle += angle;
	}
}
