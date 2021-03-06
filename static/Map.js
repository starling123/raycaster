import { loadFile, loadImage } from "./util.js";

class Texture {
	
	async load(url) {
		let img = await loadImage(url);
//		let img = new Image();
//		img.src = url;
//		document.body.appendChild(img);

		let w = img.naturalWidth;
		let h = img.naturalHeight;

		this.width = w;
		this.height = h;

		let canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		let ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, w, h);
		this.data = [];
		for(let y=0; y < h;y++) {
			for(let x=0; x < w;x++) {
				this.data[x+y*w] = ctx.getImageData(x,y,1,1).data; 
			}
		}
	}

	getTexturePixel(x, y) {
		try {
			let ty = y%this.height;
			ty = this.height - ty -1;
			return this.data[x%this.width + ty*this.width];
		} catch(e) {
			return [255,200,100,255];
		}
	}
	
}
//----------------------------------------------------------------------
export class Map {
	
	constructor() {
		this.textures = [];
	}

	containsPoint(x,y) {return false};
	
}

//----------------------------------------------------------------------
export class MazeMap extends Map {
	
	constructor(r, c, unit) {
		super();
		this.textures = [];
		this.unit = unit;
		this.rows = r;
		this.cols = c;
		this.width = this.cols*unit;
		this.height = this.rows*unit;
		this.maze = [];

		for(let r=0; r < this.rows; r++) {
			this.maze[r] = []; 
			for(let c=0; c < this.cols; c++) {
				this.maze[r][c] = Math.random() < 0.3?0:-1;
			}
		}
		
		this.maze[(this.rows/2)|0][(this.cols/2)|0] = -1;
		this.maze[(this.rows/2)|0][(this.cols/2+2)|0] = 0;
	}
	
	async load(url) {
		let data = await loadFile(url);
		this.maze = [];
		let row = [];
		for(let i=0; i < data.byteLength; i++) {
			switch(data[i]) {
			case 32: row.push(-1);break;
			case 10: 
				this.maze.push(row);
			  	row = [];
	          	break;
			default:
				row.push(0);
			}
		}
		if(row.length > 0) {
			this.maze.push(row);
		}
		this.rows = this.maze.length;
		this.cols = this.maze[0].length;
		this.width = this.cols*this.unit;
		this.height = this.rows*this.unit;
	}
	
	containsPoint(x,y) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	async addTexture(url) {
		let t = new Texture();
		await t.load(url);
		this.textures.push(t);
	}
		
	hitWall(x,y) {
		this.hit = false;
		if(this.containsPoint(x,y)) {
			this.c = (x/this.unit)|0;
			this.r = (y/this.unit)|0;
			// texture index
			this.t = this.maze[this.r][this.c]; 
			this.hit = this.t >= 0;
			
			let cx = (this.c+0.5)*this.unit;
			let cy = (this.r+0.5)*this.unit;;
			let a = x - cx;
			let b = y - cy;
			let angle = Math.atan2(b,a);
			let side = ((4*(angle + 2.25*Math.PI)/(2*Math.PI))|0)%4;
			this.t = side;
 			let tscale = this.textures[this.t].width/this.unit;
			if(side%2==0){
				this.tx = (Math.abs(y - this.r * this.unit)*tscale)|0;
			} else {
				this.tx = (Math.abs(x - this.c * this.unit)*tscale)|0;
			}
		} else {
			this.hit = false;
		}	
		return this.hit;
	}

	getColor(h) {
		if(this.t>-1) {
			return this.textures[this.t].getTexturePixel(this.tx, h);
		}
		return [200,100,0,255];
	}
	
	
	
}