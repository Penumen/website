// Turn based Tuile Game
var tile_files = ["grass","water_grass_wider","flora","mush","rocks","relic_sheet"];
var sprite_files = ["dwarf_sheet","evil_sheet"]
var canvas;
var ctx;
var map;		
var water_map;
var things;
var tiles = [];
var sprites = [];
var N = 24;	// next W*H
var T = 16; // tile art size 
var TL = 8; 
var TT = T*TL; // length of tile 
var TILE_NUM = 12;
var tile_size = 32;
var map_x = 0;
var map_y = 0;
var player;
var npc =[];
var time_beat =0; 
var animation_beat =0;
var clock;
var drawCycle;

function init(){
	canvas = document.getElementById("farm");
	ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth-3;
	canvas.height = window.innerHeight-4;
	forcePixels();


	window.addEventListener('keydown',handleKeyDown);
    //window.addEventListener('mousemove',handleMouseMove);
    //window.addEventListener('click',handleMouseClick);
	loadImgs();
	genMap(); 
	player = new Player();
	player.load();
	npc[0] = new NPC(0,0,0,true);
	npc[1] = new NPC(N-1,0,1,true);
	npc[2] = new NPC(0,N-1,2,false);
	clock = setInterval(timer,200);
	drawCycle = setInterval(drawAll,160);
	turn();
}

function turn(){
	for (let i = 0 ; i < npc.length ; i++ ){
		npc[i].thinkMove();
	}
	drawAll();
	// wait for input // or timer
	// updateWorld();
}

function timer(){
	time_beat = (time_beat+1)%2;
	animation_beat = (animation_beat+1)%3;
}

function drawAll(){
	drawMap(map_x,map_y);

	player.drawBody();
	for (let i = 0 ; i < npc.length ; i++ ){
		npc[i].drawBody();
	}
	player.drawHead();
	for (let i = 0 ; i < npc.length ; i++ ){
		npc[i].drawHead();
	}
	// drawInventory();
	// drawInfoScreen();
}

var NPC = function(x,y,curr,shake){
	this.x = x;
	this.y = y;
	this.spt =1;
	this.curr=curr;
	this.bodyShake = shake;
	this.update = function(x,y){
		let blocking = false;
		for (let i = 0 ; i < npc.length ; i++ ){
			if ((this.x+x) == npc[i].x && (this.y+y) == npc[i].y ){ blocking = true;}
		}
		if (!blocking){
			this.x+=x; this.y+=y;
			if ( this.x < 0 ){ this.x = 0; }
			else if ( this.x >= N ){ this.x = N-1; }
			if ( this.y < 0 ){ this.y = 0; }
			else if ( this.y >= N ){ this.y = N-1; }
		}
	}
	this.thinkMove = function(){
		if ( this.x == player.x && this.y == player.y ){
			console.log("Wrestle match!!!");
		} else if ( ( this.x == player.x -1 || this.x == player.x +1 ) && this.y == player.y ){
			console.log("NPC slmas into yor side! Ouch.");
		} else if ( ( this.y == player.y -1 || this.y == player.y +1 ) &&  this.x == player.x  ){
			console.log("NPC attacks! Bonk. Ouch.");
		} else {
			let vx = this.x - player.x;
			let vy = this.y - player.y;
			if ( vx == 0 ) {
				if ( vy > 0 ){ 
					this.update(0,-1); 
				}
				if ( vy < 0 ){ 
					this.update(0,1); 
				}
			} else if ( vy == 0 ) {
				if ( vx > 0 ){ this.update(-1,0); }
				if ( vx < 0 ){ this.update(1,0); }
			} else if ( Math.abs(vx) > Math.abs(vy) ) {
				if ( vx > 0 ){ this.update(-1,0); }
				if ( vx < 0 ){ this.update(1,0); }
			} else if ( Math.abs(vx) < Math.abs(vy) ) {
				if ( vy > 0 ){ this.update(0,-1); }
				if ( vy < 0 ){ this.update(0,1); }
			} else {
				if ( Math.random() < 0.5 ){
					if ( vx > 0 ){ this.update(-1,0); }
					if ( vx < 0 ){ this.update(1,0); }
				} else {
					if ( vy > 0 ){ this.update(0,-1); }
					if ( vy < 0 ){ this.update(0,1); }
				}
			}
		}
	}
	this.drawBody = function(){
		if (this.bodyShake){
			ctx.drawImage(sprites[this.spt],this.curr*T,T,T,T,this.x*tile_size,this.y*tile_size+time_beat,tile_size,tile_size);
		} else {
			ctx.drawImage(sprites[this.spt],this.curr*T,T,T,T,this.x*tile_size,this.y*tile_size,tile_size,tile_size);	
		}
	}
	this.drawHead = function(){
		ctx.drawImage(sprites[this.spt],this.curr*T,0,T,T,this.x*tile_size,this.y*tile_size-tile_size*.4-time_beat,tile_size,tile_size);
	}

}



var Player = function(){
	this.x = Math.floor(N/2);
	this.y = Math.floor(N/2);
	this.spt = 0; 
	this.curr = 0;
	this.load = function(){
		this.img = new Image();			 
		this.img.src = ("lib/p_00.png");

	}
	this.update = function(x,y){
		this.x+=x; this.y+=y;
		if ( this.x < 0 ){ this.x = 0; }
		else if ( this.x >= N ){ this.x = N-1; }
		if ( this.y < 0 ){ this.y = 0; }
		else if ( this.y >= N ){ this.y = N-1; }
	}
	this.drawBody = function(){
		ctx.drawImage(sprites[this.spt],(this.curr+time_beat)*T,T,T,T,this.x*tile_size,this.y*tile_size,tile_size,tile_size);
	}
	this.drawHead = function(){
		ctx.drawImage(sprites[this.spt],(this.curr)*T,0,T,T,this.x*tile_size,this.y*tile_size-tile_size*.4+time_beat,tile_size,tile_size);
	}
}



function loadImgs(){
	for (let i = 0 ; i < tile_files.length ; i++ ){
		var t_load = new Image();		
		t_load.src = ("lib/"+tile_files[i]+".png");
		tiles[i] = t_load;
	}
	for (let j = 0 ; j < sprite_files.length ; j++ ){
		var s_load = new Image();		
		s_load.src = ("lib/"+sprite_files[j]+".png");
		sprites[j] = s_load;
	}
}

// context.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
function drawMap(x,y){
	ctx.save();
	ctx.translate(x,y);
	for ( let i = 0 ; i < N ; i++ ){
		for ( let j = 0 ; j < N ; j++ ){
			ctx.drawImage( tiles[0],((map[i][j]%TL)*T),(T*~~(map[i][j]/TL)),T,T,i*tile_size,j*tile_size,tile_size,tile_size);
			if ( water_map[i][j] != -1 ){
				ctx.drawImage(tiles[1],((water_map[i][j]%TL)*T),(T*~~(water_map[i][j]/TL)),T,T,i*tile_size,j*tile_size,tile_size,tile_size);
				// console.log( ((water_map[i][j]%TL)) + " " + (~~(water_map[i][j]/TL)) + " " +  water_map[i][j] );
			}
			if ( things[i][j][0] != 0 ){
				ctx.drawImage(tiles[things[i][j][0]],((things[i][j][1]%TL)*T),(T*~~(things[i][j][1]/TL)),T,T,i*tile_size,j*tile_size,tile_size,tile_size);
				// console.log( ((water_map[i][j]%TL)) + " " + (~~(water_map[i][j]/TL)) + " " +  water_map[i][j] );
			}
		}
	}

	ctx.restore();

}

function genMap(){
	map = new Array(N);
	water_map  = new Array(N);
	things = new Array(N);
	for ( let i = 0 ; i < N ; i++ ){
		map[i] = new Array(N);
		water_map[i] = new Array(N);
		things[i] = new Array(N);
		for ( let j = 0 ; j < N ; j++ ){
			map[i][j] = Math.max( (rollDice(4,3)-5), 0 );	
			if ( Math.random() > 0.8 ) { map[i][j] += TL; }
			water_map[i][j] = -1;
			things[i][j]=[0,0];
		}
	}
	let ponds = rand(8);
	let stream_num = rand(4);
	for ( let i = 0 ; i < stream_num ; i++ ){ 
		genStream();
	}
	addRandomPonds(ponds);
	if (stream_num>0 || ponds>0){ adjustWaterTiles(); }
	genThings();
}

function genStream(){
	let start_x = rand(N*.6)+~~(N/3);
	let start_y = rand(N*.6)+~~(N/3);
	let end_x;
	let end_y;
	let r = Math.random();
	if ( r > 0.5 && start_x < N/2 ) {
		end_x = N-1;
		end_y = rand(N);
	} else if ( r > 0.5 && start_x > N/2  ) {
		end_x = 0;
		end_y = rand(N);
	} else if ( start_y > N/2 ){
		end_y = N-1;
		end_x = rand(N);
	} else {
		end_y = 0;
		end_x = rand(N);
	}
	let vx = (start_x-end_x);
	let vy = (start_y-end_y); 	//check vy ==0 
	// let mag = Math.sqrt( vx*vx + vy*vy );
	// let v_unit = (vx/vy)/mag;
	let deg = Math.atan2(vy,vx);
	let cx = 0.5*-Math.cos(deg); 
	let cy = 0.5*-Math.sin(deg);
	water_map[start_x][start_y]=1;
	water_map[end_x][end_y]=1;
	// console.log(end_x + "  " + end_y );
	
	while ( start_x > 0 && start_x < N && start_y > 0 && start_y < N ){
		// if ( inRange( Math.round(start_x),Math.round(start_y) ) ){
		// 	water_map[Math.round(start_x)][Math.round(start_y)]=0;
		// }
		if ( inRange( Math.floor(start_x),Math.floor(start_y) ) ){
			water_map[Math.floor(start_x)][Math.floor(start_y)]=0;
		}
		if ( inRange( Math.floor(start_x),Math.floor(start_y+cy) ) ){
			water_map[Math.floor(start_x)][Math.floor(start_y+cy)]=0;
		}
		if ( inRange( Math.floor(start_x+cx),Math.floor(start_y) ) ){
			water_map[Math.floor(start_x+cx)][Math.floor(start_y)]=0;
		}
		// if ( inRange( Math.round(start_x),Math.round(start_y) ) ){
		// 	water_map[Math.round(start_x)][Math.round(start_y)]=0;
		// }
		// if ( inRange( start_x>>0,start_y>>0 ) ){
		// 	water_map[start_x>>0][start_y>>0 ]=0;
		// }
		// console.log(start_x + "  " + start_y );
		start_x+=cx;
		start_y+=cy;
	}
}

function addRandomPonds(n){
	for (let i = 0 ; i < n ; i++ ){
		water_map[rand(N)][rand(N)]=0;
	}
}

function adjustWaterTiles(){
	for ( let i = 0 ; i < N ; i++ ){
		for ( let j = 0 ; j < N ; j++ ){
			if (water_map[i][j]!=-1){
				let top = j-1;
				let bot = j+1;
				let rgh = i+1;
				let lft = i-1; 
				if (inWater(i,top)){ water_map[i][j] += 1; }
				if (inWater(i,bot)){ water_map[i][j] += 8; }
				if (inWater(rgh,j)){ water_map[i][j] += 4; }
				if (inWater(lft,j)){ water_map[i][j] += 2; }
				
				     if (water_map[i][j] ==  3 && inWater(lft,top)){ water_map[i][j] = 16; }
				else if (water_map[i][j] ==  5 && inWater(rgh,top)){ water_map[i][j] = 17; }
				else if (water_map[i][j] == 10 && inWater(lft,bot)){ water_map[i][j] = 18; }
				else if (water_map[i][j] == 12 && inWater(rgh,bot)){ water_map[i][j] = 19; }

				else if (water_map[i][j] ==  7 ){
					if ( inWater(lft,top) && inWater(rgh,top)) { water_map[i][j] = 22; }
					else if ( inWater(lft,top)){ water_map[i][j] = 20; }
					else if ( inWater(rgh,top)){ water_map[i][j] = 21; }
				}
				else if (water_map[i][j] == 11) {
					if ( inWater(lft,top) && inWater(lft,bot)) { water_map[i][j] = 25; }
				 	else if ( inWater(lft,top)){ water_map[i][j] = 23; }
					else if ( inWater(lft,bot)){ water_map[i][j] = 24; }
				}
				else if (water_map[i][j] == 13){
					if ( inWater(rgh,top) && inWater(rgh,bot)) { water_map[i][j] = 28; }
					else if ( inWater(rgh,top)){ water_map[i][j] = 26; }
					else if ( inWater(rgh,bot)){ water_map[i][j] = 27; }
				}
				else if (water_map[i][j] == 14 ){ 
					if ( inWater(lft,bot) && inWater(rgh,bot)) { water_map[i][j] = 31; }
					else if ( inWater(rgh,bot)){ water_map[i][j] = 29; }
					else if ( inWater(lft,bot)){ water_map[i][j] = 30; }
				}
				else if ( water_map[i][j] == 15 ){
					let top_lft = inWater(lft,top);
					let top_rgh = inWater(rgh,top);
					let bot_rgh = inWater(rgh,bot);
					let bot_lft = inWater(lft,bot);
					if ( !top_lft && !top_rgh && !bot_rgh && !bot_lft ){ }
					else if ( top_lft && top_rgh && bot_rgh && bot_lft ){ water_map[i][j] = 32; }
					else if ( top_lft && top_rgh && bot_rgh && !bot_lft ){ water_map[i][j] = 33; }
					else if ( top_lft && top_rgh && !bot_rgh && bot_lft ){ water_map[i][j] = 34; }
					else if ( top_lft && !top_rgh && bot_rgh && bot_lft ){ water_map[i][j] = 35; }
					else if ( !top_lft && top_rgh && bot_rgh && bot_lft ){ water_map[i][j] = 36; }
					else if ( top_lft && top_rgh && !bot_rgh && !bot_lft ){ water_map[i][j] = 37; }
					else if ( !top_lft && top_rgh && bot_rgh && !bot_lft ){ water_map[i][j] = 38; }
					else if ( top_lft && !top_rgh && !bot_rgh && bot_lft ){ water_map[i][j] = 39; }
					else if ( !top_lft && !top_rgh && bot_rgh && bot_lft ){ water_map[i][j] = 40; }
					else if ( top_lft && !top_rgh && bot_rgh && !bot_lft ){ water_map[i][j] = 41; }
					else if ( !top_lft && top_rgh && !bot_rgh && bot_lft ){ water_map[i][j] = 42; }
					else if ( !top_lft && !top_rgh && !bot_rgh && bot_lft ){ water_map[i][j] = 43; }
					else if ( !top_lft && !top_rgh && bot_rgh && !bot_lft ){ water_map[i][j] = 44; }
					else if ( !top_lft && top_rgh && !bot_rgh && !bot_lft ){ water_map[i][j] = 45; }
					else if ( top_lft && !top_rgh && !bot_rgh && !bot_lft ){ water_map[i][j] = 46; }
				}



				// console.log("Q@ " + i + "," + j + "  = " + water_map[i][j]);
			}
		}
	}
}

function genThings(){
	let num = rand(10)+5;
	let i; let j; let family; let type; 
	family = rand(3)+2;	// flower, mush, rock
	// relic = 5
	let x;
	things[rand(N-4)+2][rand(N-4)+2][0]=5;
	things[rand(N-4)+2][rand(N-4)+2][0]=5;
	for (let n = 0 ;  n< num ; n++){
		
		type = rand(3); // add more up to 8 each?
		i = rand(N);
		j = rand(N);
		if ( things[i][j][0] == 0 ){
			if (water_map[i][j] == -1 ){
				things[i][j] = [family,type];
			} else {
				things[i][j] = [family,(type+TL)];
			}
			console.log("Set thing = " +i+","+ j+"  "+family+" "+type);
		}
	}
	

}


function inRange(x,y){
	if ( x >=0 && x < N && y >=0 && y < N ){ return true;} 
	return false;
}
function inWater(x,y){
	return ( (!inRange(x,y) || (inRange(x,y) && water_map[x][y]!=-1) ));
}

function rollDice( n , sides ){
	let sum = 0;
	for ( let i = 0 ; i < n ; i++ ){
		sum += (rand(sides) + 1);
	}
	return sum;
}

function rand(n){
	let r = Number(Math.floor( Math.random() * n ));
	return r;
}

function handleKeyDown(e) {
    if (e.key == "ArrowUp"){	
		e.preventDefault();
		player.update(0,-1);
    }
    if (e.key == "ArrowDown"){
		e.preventDefault();
		player.update(0,1);
    }
    if (e.key == "ArrowLeft"){
		e.preventDefault();
		player.update(-1,0);
    }
    if (e.key == "ArrowRight"){
		e.preventDefault();
		player.update(1,0);
    }
	//console.log(e.key);
	turn();
}

function forcePixels(){
	ctx['imageSmoothingEnabled'] = false;       /* standard */
    ctx['mozImageSmoothingEnabled'] = false;    /* Firefox */
    ctx['oImageSmoothingEnabled'] = false;      /* Opera */
    ctx['webkitImageSmoothingEnabled'] = false; /* Safari */
    ctx['msImageSmoothingEnabled'] = false;     /* IE */
}