import { MazeMap } from "./Map.js";
import { RayCaster } from "./RayCaster.js";


var SPEED = 20;
var keyState = {};

export async function start() {
//   let r = await loadFile("/static/wall.png");
   let ag = document.getElementById("achtergrond");
   let agCtx = ag.getContext("2d");
   let w = ag.clientWidth;
   let h = ag.clientHeight;
   agCtx.fillStyle = "#0000CC";
   agCtx.fillRect(0, 0, w, 0.6*h);
   agCtx.fillStyle = "#333333";
   agCtx.fillRect(0, 0.6*h, w, 0.4*h);

   let map = new MazeMap(1,1, 150);
   await map.load("/static/map_data.txt")
   await map.addTexture("/static/wall.png");
   await map.addTexture("/static/wall.png");
   await map.addTexture("/static/wall.png");
   await map.addTexture("/static/clock.jpg");
   await map.addTexture("/static/floor.jpg");
   await map.addTexture("/static/wood.jpg");

   let c = document.getElementById("screen");
   let rc = new RayCaster(map.width/2,map.height/2,map, w, h);
   let ctx = c.getContext("2d");

   document.addEventListener('keydown', (event) => {
  		keyState[event.key] = true;
  	},false);

   document.addEventListener('keyup', (event) => {
  		keyState[event.key] = false;
  	},false);
    let update = true;
	function gameLoop() {
		if(keyState["ArrowRight"]) {
			rc.rotate(-Math.PI/64);
			update = true;
		}
		if(keyState["ArrowLeft"]) {
			rc.rotate(+Math.PI/64);
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
	   if(update) {
		   rc.render();
		   let imageData = new ImageData(rc.buffer, rc.width);
		   ctx.putImageData(imageData, 0,0);
           update = false;
       }		
	   setTimeout(gameLoop, 10);
	}
	gameLoop();

}


