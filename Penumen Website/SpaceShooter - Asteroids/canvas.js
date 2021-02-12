// Peter Newman Spring 2020 CPSC 1045
// debug = true; // in console to see more power ups etc.. 
"use strict"


/* TO DO LIST TASKS:
//// Movement and Physics
improve ship movement & drift 
collision effects: rotation & movement
shots -> connection spin & force push ( depends on dmg also )
condense amount of variable as mush as possible 
//// Turret overheat:
change glow on ship at turret
turret health bar ( nested if )
turret cooldown 
condense colour codes and palettes 
    // Asteroid and ship damage heat cooldowns
    - adjust color based on damage 
    - ship flare ups at near death
//// Enemy Ship
ship tracking intervals 
ship avoiding asteroid algs
//// Engine Flare Damage 
update multi touch buttons and graphics 
extend collision check to rear rect or arc damage depending on level of 
//// Power Ups!!!  
Pick up weapons start with none?!
//// Character Messages and notifications ( overheat )
//// Sound Effects???
//// move screen through larger world 
approach 25% of side scroll in that direction 
render only things near ship itself 
add tracking fleet and goal locations 
// add story mode and 
*/
let canvas;
let ctx;
let update;
let keys;
let debug = false;
let ship;
let bordSpc = 50; //  distance from edge of scrren asteroids spawn
let goneSpc = 400; // distance outside of realm to be goner deleted 
let asteroids = [];
let shots = [];
let lazers = [];
let explosions = [];
let dusts = [];
let activeKeys = [];
let powers = [];
let timer = 0;
let shotbase = 15;  // base shot dmg

//// SCORE:
let kills = 0;
let hits = 0;
let fired = 0;
//// STATS:
let stats = true;
let deaths = 0;
let highscore = 0;
let resets = 0;
let cannon = 0;
let duals = 0;
//// RESET BUTTON
let reset_x = 10;
let reset_y = 10;
let reset_w = 100;
let reset_h = 20;
/////////////////////////////////////////// END ENGINES
function drawSpace() {
    ctx.restore();
    ctx.fillStyle = '#000000';
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fill();
} 

/////////////////////////////////////////////////////////// INIT
function init() {
    canvas = document.getElementById("spaceCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth-3;
    canvas.height = window.innerHeight-4;
	ship = new Ship( canvas.width*.5,canvas.height*.7, 0.7 ,72 ,90);	// console.log(ship);
    window.addEventListener('keydown', handleKeyDown );
    window.addEventListener('keyup', handleKeyUp );
    document.addEventListener('click', handleMouseClick );
    update = setInterval(updateWorld,40);
    updateWorld();
}

function drawAll(){
    drawSpace();
	for ( let j = 0 ; j < dusts.length ; j++ ){	dusts[j].render();  } 
	powers.forEach( function(p){ p.render(); });
    for ( let i = 0 ; i < asteroids.length ; i++ ){	drawAst(asteroids[i]); }
	shots.forEach(function(s){ s.render(); }); 
	lazers.forEach(function(l){ l.render(); }); 
	for ( let i = 0 ; i < explosions.length ; i++ ){ drawExplosion( explosions[i] ); }  
	drawShip();  
    drawDisplay();
}

function updateWorld(){
    handleKeys();
    drawAll();              // DRAW
    updateShip();
    if ( ship.hp <= 0 ){ gameOver(); }  
    updateAsteroids();
	shots.forEach( function(s){ s.move(); }); 
	lazers.forEach( function(l){ l.move(); }); 
	powers.forEach( function(p){ p.move(); });
    timer++;
    timer%=1000;
	if (timer % 42 == 0 ){ spawnAsteroid(); }
	if (timer == 0 || (debug && timer % 100 == 0) ){ genPowerUp(); }
    updateExplosions();
	updateDust();
	cleanShots();
    checkCollision();
}

function gameOver(){
// drawGameOverMenu();
// clearInterval(update);
// console.log("GAME OVER");
    deaths++;
// console.log("DEATHS: "+deaths);
	explosiveDeath();
	lazerBurst();
	resetShip();
	ship.invince = 80;
    if ( kills > highscore ) { highscore = kills; }
    kills = 0;
}

function cleanShots(){
	for ( let i = shots.length -1 ; i>=0 ; i-- ) {
		if ( shots[i].x < -goneSpc || shots[i].y < -goneSpc || shots[i].x > canvas.width+goneSpc || shots[i].y > canvas.height+goneSpc ){
			shots.splice(i,1);
		}
	}
	for ( let i = lazers.length -1 ; i>=0 ; i-- ) {
		if ( lazers[i].x < -goneSpc || lazers[i].y < -goneSpc || lazers[i].x > canvas.width+goneSpc || lazers[i].y > canvas.height+goneSpc ){
			lazers.splice(i,1);
		}
	}
}

function checkCollision() {         
    let poof;
    let ex;
    let ey;
	let et;
	let eh;
    for ( let k = shots.length-1 ; k >= 0 ; k-- ){                  // for each shot
        for ( let h = asteroids.length-1 ; h >= 0 ; h-- ){      	// and each asteroid
            if ( shots[k] != undefined && asteroids[h] != undefined  ) {
                let d = Math.sqrt(Math.pow((shots[k].y - asteroids[h].y),2)+Math.pow(( shots[k].x - asteroids[h].x),2));
                if ( d <= ( asteroids[h].size + shots[k].size ) ){
                    hits++;
                    asteroids[h].hp -= shots[k].dmg*shotbase;      
                    ex = shots[k].x;
                    ey = shots[k].y;
					et = 10*shots[k].size + randomInt(10);
					eh = shots[k].hue;
                    poof = new Explosion(ex,ey,et,eh);
                    explosions.push(poof);
                    shots.splice(k,1);
                }
            }
        }
	}
	for ( let l = lazers.length-1 ; l >= 0 ; l-- ){                  // for each shot
        for ( let h = asteroids.length-1 ; h >= 0 ; h-- ){      	// and each asteroid
            if ( lazers[l] != undefined && asteroids[h] != undefined  ) {
				let d = Math.sqrt(Math.pow((lazers[l].y - asteroids[h].y),2)+Math.pow(( lazers[l].x - asteroids[h].x),2));
                if ( d <= ( asteroids[h].size + lazers[l].size ) ){
                    hits++;
                    asteroids[h].hp -= lazers[l].dmg;      
                    ex = lazers[l].x;
                    ey = lazers[l].y;
					et = 10*lazers[l].size;
					eh = lazers[l].hue;
                    poof = new Explosion(ex,ey,et,eh);
					explosions.push(poof);
					lazers[l].dmg = Math.floor( lazers[l].dmg * 0.95);
					lazers[l].size*=.95;
                    if ( lazers[l].dmg < 1 ) { lazers.splice(l,1); }
                }
            }
        }
    }
    for ( let j = 0 ; j < asteroids.length ; j++ ){               // check ship aseroid collision
        let d = Math.sqrt(Math.pow((ship.y-asteroids[j].y),2)+Math.pow((ship.x-asteroids[j].x),2));
        if  ( d <= (ship.w + asteroids[j].size*1.25)) {    // posible hit check further
            if ( d <= (ship.w + asteroids[j].size*.75) ) { // direct hit!
                connect(asteroids[j]);
            } else if ( d <= (ship.w + asteroids[j].size) ) {       // hit 
                // console.log("Hit at asteroid x/y: " + asteroids[j].x +"/"+  asteroids[j].y );
                asteroids[j].hp -= 5;
				if ( ship.invince < 1 ) { ship.hp -= 3; }
				  
            } // else if ( d <= (ship.size*ship.w + asteroids[j].size*1.25) ) {  
        // console.log("possible hit at asteroid of size: " + asteroids[j].size + " x/y: " + asteroids[j].x +"/"+  asteroids[j].y );
        // } else { //     console.log("" +d+ "  vs  " +(  ship.size*ship.w  ) ); // }
        }
	}
	for ( let p = powers.length-1 ; p >= 0 ; p-- ){
		let d = Math.sqrt(Math.pow((ship.y-powers[p].y),2)+Math.pow((ship.x-powers[p].x),2));
		if ( d < 20 + ship.w ) {
			switch (powers[p].type ){
				case "CAN": 
					if ( !ship.shot_type ) { ship.update_weapon(true); }
					if ( ship.shot_power < 5 ) { 
						ship.shot_power++; 
					} else {
						shotBurst(); 
					}
					break;
				case "LZR":
					if ( ship.shot_type ) { ship.update_weapon(false); }
					if ( ship.lazer_power < 3 ) { 
						ship.lazer_power++; 
					} else {
						lazerBurst();
					}
					break;
				case "ENG":
					ship.update_engine(false);
					break;
				case "INV":
					ship.invince = 300;
					break;
				case "HP":
					if ( ship.hp == ship.max_hp && ship.max_hp < 200 ){
						ship.max_hp+=10;
					}
					ship.hp = ship.max_hp;	// or MAX HP
					if ( ship.invince < 20 ){ ship.invince = 20; }
					break;
			}
			powers.splice(p,1);
		}
	}
}

               // console.log("Direct Hit: " + asteroids[j].x +"/"+  asteroids[j].y + " HP: "+ asteroids[j].hp  );
                //spawnExplosion();
                /* spawn at trig the arttan2 angle then blast in the direction of ship then  
sin cos the angles for x/y coords with * size *.75
then 
http://director-online.dasdeck.com/buildArticle.php?id=532
                */
                // calculate FLING!

/*
    for ( let i = 0 ; i < eyes.length  ; i++ ){
        eyes[i].x += eyes[i].dx;
        eyes[i].y += eyes[i].dy;
        eyes[i].updatePupil();
        if ( eyes[i].x - eyes[i].rad < 0 ){
           if ( eyes[i].dx < 0 ){ eyes[i].dx *=-1; }
        }
        if ( eyes[i].x + eyes[i].rad > canvas.width ){
            if ( eyes[i].dx > 0 ){ eyes[i].dx *=-1; }
        } 
        if ( eyes[i].y - eyes[i].rad < 0 ){
            if ( eyes[i].dy < 0 ){ eyes[i].dy *=-1; }
        }
        if ( eyes[i].y + eyes[i].rad > canvas.height ){
            if ( eyes[i].dy > 0 ){ eyes[i].dy *=-1; }
        }
    let v1y = ship.speed* Math.cos(ship.r);
    let v1x = ship.speed* Math.sin(ship.r);
    let v2y = spd* Math.cos(dir);
    let v2x = spd* Math.sin(dir);
*/

/////////////////////////////////////////////////////////// PHYSICS CHANGE ASTEROID AND SHIP ///// to do..
// connection hit with asteroid ( not graze )
function connect(a){
    let vxShip = ship.speed* Math.cos(ship.rot); // switch to .r
    let vyShip = ship.speed* Math.sin(ship.rot);
    let vxAst = a.speed* Math.cos(a.r);
    let vyAst = a.speed* Math.sin(a.r);
    let dx = vxShip - vxAst;    // 
    let dy = vyShip - vyAst;    // 
    let phi;                    // angle between centers of objects
    if ( dx == 0 ) {
        phi = Math.PI/2; 
    } else {
        phi = Math.atan2(dy,dx);
    }
    a.hp -= 5;
    if ( ship.invince < 1 ) { ship.hp -= 5; }  
    if  ( ship.x < a.x ) {
        // a.dir ->
    } else if ( ship.x > a.x ) {
        // a.dir <-
    }
    if  ( ship.y < a.y ) {

    } else if ( ship.y > a.y ) {

    }
}


function spawnAsteroid(){
    let side = randomInt(4);
    let a;
    if ( side == 0 ){       //function Asteroid(x,y,dir,speed,size,points)
        a = new Asteroid(-bordSpc,randomInt(canvas.height),180+randomInt(180),randomInt(4)+1,26+randomInt(42),5+randomInt(5)); 
    } else if ( side == 1 ){
        a = new Asteroid(randomInt(canvas.width),-bordSpc,90-randomInt(180),randomInt(4)+1,26+randomInt(42),5+randomInt(5));
    } else if ( side == 2 ){
        a = new Asteroid(canvas.width+bordSpc,randomInt(canvas.height),90+randomInt(180),randomInt(4)+1,26+randomInt(42),5+randomInt(5));
    } else if ( side == 3 ){
        a = new Asteroid(randomInt(canvas.width),canvas.height+bordSpc,randomInt(180),randomInt(4)+1,26+randomInt(42),5+randomInt(5));
    }
    asteroids.push(a);
}
/////////////////////////////////////////////////  KEY DOWN
function handleKeyDown(e){
    if ( e.key == "ArrowLeft" || e.keyCode == 37 ){
        e.preventDefault();
        activeKeys[37] = true;          //pushLeft();
    } 
    if ( e.key == "ArrowUp" || e.keyCode == 38 ){
        e.preventDefault();
        activeKeys[38] = true;          //pushUp();
    }
    if ( e.key == "ArrowRight" || e.keyCode == 39 ){
        e.preventDefault();
        activeKeys[39] = true;          //pushRight();
    }
    if (  e.key == "ArrowDown" || e.keyCode == 40 ){
        e.preventDefault();
        activeKeys[40] = true;          //pushDown();
    } 
    if ( e.key == "b" || e.key == "B" ){
        e.preventDefault();
        activeKeys[66] = true;          //dualShot();
    } 
    if ( e.key == " " || e.keyCode == 32 ){
        e.preventDefault();
        activeKeys[32] = true;          //shoot();
    } 
    if ( e.key == "Tab" || e.keyCode == 9 ){
        e.preventDefault();
        toggleStats();
    }
} 
function handleKeys(){
    if ( activeKeys[37] ){ 
        pushLeft();
    } 
    if ( activeKeys[38] ){
        pushUp();
    }
    if ( activeKeys[39] ){
        pushRight();
    }
    if ( activeKeys[40] ){
        pushDown();
    } 
    if ( activeKeys[66] ){
        if ( ship.turret_timer == 0  ) { 
			dualShot(); 
			ship.turret_timer = ship.shot_interval;
		}
    } 
    if ( activeKeys[32] ){
		if ( ship.shot_type ) {
			ship.charge++;
		} else {
			if ( ship.cannon_timer == 0  ) {
				shoot();
				ship.charge = 0;
				ship.cannon_timer = ship.shot_interval;
			}
		}
    } 
} 
function handleKeyUp(e){
    if ( e.key == "ArrowLeft" || e.keyCode == 37 ){
        activeKeys[37] = false;
    } 
    if ( e.key == "ArrowUp" || e.keyCode == 38 ){
        activeKeys[38] = false;
    }
    if ( e.key == "ArrowRight" || e.keyCode == 39 ){
        activeKeys[39] = false;
    }
    if (  e.key == "ArrowDown" || e.keyCode == 40 ){
        activeKeys[40] = false;
    } 
    if ( e.key == "b" || e.key == "B" ){
        activeKeys[66] = false;
    } 
    if ( e.key == " " || e.keyCode == 32 ){
		activeKeys[32] = false;
		if ( ship.shot_type ) {
        	shoot();
			ship.charge = 0;
		}
    } 
    if ( e.key == "r" || e.keyCode == 82 ){
        e.preventDefault();
        resetWorld();
    }
} 


function pushLeft(){
    ship.speedR -= ship.change; // change per tick or increase in rotation
    ship.speed += 1;
  //  if ( ship.rightEng  < 5 ) { ship.rightEng+=2; } ;
   // add the vector of direction
   // ship.speedX -= change;
   // ship.speedY -= change;
   // ship.rot -= 5;
   ship.rightEng = 5;
}
function pushRight(){
   // ship.speedX += change;
   // ship.speedY -= change;
   // ship.rot += 5;
   ship.speedR += ship.change; // change per tick or increase in rotation
   ship.speed += 1;
   ship.leftEng = 5;
}
function pushUp() {
    ship.speed += ship.change;
    if ( ship.engineStatus <= 40 ) { ship.engineStatus+= 10; }
}

function pushDown() {   /// must halt 
    if ( ship.speedY < 0 ) {
        ship.speed /=2;
    } else {
        ship.speed -= ship.change;
    }
    ship.rev = 3;
    // ship.engineStatus = 0;
}


function handleMouseClick(){
    if ( event.clientX >= reset_x && event.clientX <= reset_x+reset_w && event.clientY >= reset_y && event.clientY <= reset_y+reset_h  ){
        resetWorld();
    } 

}

function resetWorld(){
    resets++;
    resetShip();
    asteroids.splice(0,asteroids.length);
	shots.splice(0,shots.length);
	lazers.splice(0,lazers.length);
    dusts.splice(0,dusts.length);
    explosions.splice(0,explosions.length);
    if ( kills > highscore ) { highscore = kills; }
    kills = 0;
}


function resetShip(){
    ship.rot = 0;
    ship.x = canvas.width*.5;
    ship.y = canvas.height*.7;
    ship.hp = 100;
    ship.speedR = 0;     
	ship.speed = 0;
	ship.update_weapon(true);
	ship.update_engine(true);
	ship.lazer_power = 0;
	ship.shot_power = 1;
	ship.max_hp = 100;
	ship.eng_upgrade = 1;
	ship.change = 1;
  //  ship.r
  //  ship.rPrev = 0;
  //  ship.drift = 0;      
  //  ship.prvr = 0;    
  //  ship.speedX = 0;
  //  ship.speedY = 0;
}

function tickDown(value){
    return value*.97; 
}
////////////////////////////////////////////// UPDATE

function updateShip() { ////////// drift is old half life of average prev rot/speed + change from 
    ship.x += Math.cos((ship.rot-90)*Math.PI/180)*ship.speed ; // plus drift //ship.speedX;
    ship.y += Math.sin((ship.rot-90)*Math.PI/180)*ship.speed ; // plus drift // ship.speedY;
    if ( ship.x > canvas.width ) { ship.x %= canvas.width; }
    if ( ship.y > canvas.height) { ship.y %= canvas.height; }
    if ( ship.x < 0 ) { ship.x += canvas.width; }
    if ( ship.y < 0 ) { ship.y += canvas.height; }
    ship.speed = tickDown(ship.speed);
    if ( ship.engineStatus > 0 ) { ship.engineStatus -=2; }
    ship.engineLevel = Math.floor(ship.engineStatus/10);
    if ( ship.rightEng > 0 ) { ship.rightEng --; }
    if ( ship.leftEng > 0 ) { ship.leftEng --; }
    ship.rot += ship.speedR;
    ship.speedR = tickDown(ship.speedR);
    if ( ship.speedR > ship.speedMAX ) { ship.speedR = ship.speedMAX; } 
    if ( ship.speedR < -ship.speedMAX ){ ship.speedR = -ship.speedMAX; } 
    if ( ship.rev >  0 ) { ship.rev--; }
    if ( ship.speed > ship.speedMAX ){ ship.speed = ship.speedMAX; } 
    if ( ship.speed < -ship.speedMAX ){ ship.speed = -ship.speedMAX; } 
	if ( ship.turret_timer > 0 ){ ship.turret_timer--; }
	if ( ship.cannon_timer > 0 ){ ship.cannon_timer--; }
	if ( ship.invince > 0 ) { 
		ship.invince--;
		if ( ship.invince % 4 == 1 ) {
			ship.update_skin_base( ( ship.skin_base - ship.invince )%360 );
		} else if (  ship.invince % 2  == 1) {
			ship.update_skin_base(ship.skin_base );
		}
	}
} 

// updates rotation and position of asteroid
function updateAsteroids() {
    // timer = (timer+1)%50; 
    // if ( timer == 0 ) { dirX*=-1; }
     for ( let i = 0 ; i < asteroids.length ; i++ ){
         asteroids[i].r = ( asteroids[i].rotSpeed + asteroids[i].r )%360;
         asteroids[i].x += Math.cos(asteroids[i].dir)*asteroids[i].speed;
         asteroids[i].y += Math.sin(asteroids[i].dir)*asteroids[i].speed;
     }
     for ( let i = 0 ; i < asteroids.length ; i++ ){
        if  ( asteroids[i].hp <= 0 || asteroids[i].x < -goneSpc || asteroids[i].y < -goneSpc || asteroids[i].x > canvas.width+goneSpc || asteroids[i].y > canvas.height+goneSpc) {
            if ( asteroids[i].hp <= 0 ) { 
				kills++; 
				if ( kills % 100 == 0 ) { genPowerUp(); }
                let size =  asteroids[i].size;
                let x = asteroids[i].x;
                let y = asteroids[i].y;
                let dir = asteroids[i].dir;
                let debris = new Dust(x,y,size);
                if ( asteroids[i].size >= 25 ) {
                    let n = randomInt(5)+2;
                    for ( let k = 0 ; k < n ; k++ ){
//       a = new Asteroid(,,26+randomInt(42),5+randomInt(5)); 
                        ///
                        let ast = new Asteroid(x,y,dir+randomInt(180)-90,randomInt(8)+1,randomInt(10)+2+asteroids[i].size/n,asteroids[i].points);
                        asteroids.push(ast);
                    }
                }
                dusts.push(debris);
            } // switch when move to enemy && asteroids
            asteroids.splice(i,1);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////
/*
Ship nose -> apply in color gradient
Forward thrusters -> cone shape
left rigt thrusters -> use ship-wide fade apply gradient as 
*/
    /*
    function dirForce(){
        let alpha = 0.5;
        this.drift = this.drift*alpha + (1-alpha)*this.speed;
        // Math.atan2(y,x) * 180 / Math.PI
    }
    function speedForce(d) {
         // this.r vs d // (rotational speed is rot) // apply a force to diretion d
        // if () { speed += x; }
        // force need not change the angle of ship just the direction of drift
        if ( this.speed > this.speedMAX ) { this.speed = this.speedMAX; }
    }
    function coneHeat(){
    }
    function turretHeat(){
    }
    */   


let Ship = function(x,y,size,w,h){
    // stroke width = ??? 
	this.hp = 100;
	this.max_hp = 100;
    this.x = x;
    this.y = y;
    this.size = size;
    this.h = Math.ceil(h * size);
    this.w = Math.ceil(w * size);
	this.speed = 0;
	this.change = 1;
  //  this.r = 0;
 //   this.rprev = 0;
//    this.prvr = 0;  // last rotational direction
    this.rot = 0;             // actual facing rotation
    this.speedR = 0;          // rotational speed for rot
//    this.prevrot= 0;          // previous roational angle
//this.drift = 0;         // previous speed last directional speed
this.speedX = 0;        // save on trig calc each turn don't use to move
this.speedY = 0;        // same
    this.speedMAX = 12;

    this.sideTurretStatus = 0; // 1 -> 10  
    this.mainTurretStatus = 0;
    this.engineStatus = 0;
	this.engineLevel = 0;
	this.eng_upgrade = 1;
this.leftEng = 0;
this.rightEng = 0;
this.rev = 0;
this.charge = 0;        // cannon blaster charge

	this.shot_type = true;
	this.w_type = "CANNON";
	this.shot_hue = 300;
	this.lazer_power = 0;
	this.shot_power = 1;
	this.bridgeLight = getHSL(this.shot_hue ,25,47);
	this.shot_color1 = getHSLA(this.shot_hue,100,100,0.6);
	this.shot_color2 = getHSLA(this.shot_hue,90,70,0.7);
	this.skin_base = 216;
    this.skin = getHSL(this.skin_base,30,42); 
    this.skinShadow = getHSL(this.skin_base,35,36); 
	this.deets = getHSL(this.skin_base,32,23);
	this.eng_hue = 180;
	this.flareColor = [getHSLA(this.eng_hue+30,100,24,1),
					   getHSLA(this.eng_hue+10,100,35,0.9),
					   getHSLA(this.eng_hue+5,71,53,0.8),
					   getHSLA(this.eng_hue,100,70,0.7),
					   getHSLA(this.eng_hue,100,70,0.2)];
	this.flareFade = getHSLA(this.eng_hue+30,100,39,0);
	
	this.cannon_timer = 0;
	this.turret_timer = 0;
	this.shot_interval = 5;
	this.invince = 0;
////////////////////////////////////////////// Positioning:
    this.wingF = 0;           				// forewing
    this.wingB = this.h*.25;   				// backwing
    this.tw = this.w*.75;     				// turret distance
    this.tin = Math.round(this.w*.66);    	// inner turret distance
    this.th = -this.h*.25;    				// turret height
    this.tvar = Math.round(this.h*0.05);
    this.core = this.h/3;     				// center h of the base engineering core 
    this.girth = this.w/3;    				// how thicc engineering is 
    this.crg = Math.round(this.w/3*.7); 	//core girth
    this.aft = this.h*.25+this.h/6;
    this.noseW = Math.round(this.w*.1);   	// width of nose cone base
    this.noseH = Math.round(-this.h*.7);  	// location from center the nosecone is
    this.noseTip = -this.h*.9;  			// actual tip of nosecone
    this.bridgePos = Math.round(-this.h*.2);// good position to control thigns from
    this.bridgeRad = Math.round(this.h*.1); // should be roughly <= "noseW" but change possible??
    this.flare = this.h/4;
    this.blastRadius = .25;
    this.flareL = Math.PI*(0.5-this.blastRadius);
    this.flareR = Math.PI*(0.5+this.blastRadius);
	//ship.glow = setEngineFlare();
	this.update_shot_hue = function(hue){
		this.shot_hue = hue;
		this.shot_color1 = getHSLA(hue,100,100,0.6);
		this.shot_color2 = getHSLA(hue,90,70,0.7);
		this.bridgeLight = getHSL(hue,25,47);
	}
	this.update_skin_base = function(hue){
		// this.skin_base = hue;
		this.skin = getHSL(hue,30,42); 
		this.skinShadow = getHSL(hue,35,36); 
		this.deets = getHSL(hue,32,23);
	}
	this.update_engine_hue = function(hue){
		this.eng_hue = hue;
		this.flareColor = [getHSLA(hue+30,100,24,1),
						   getHSLA(hue+10,100,35,0.9),
						   getHSLA(hue+5,71,53,0.8),
						   getHSLA(hue,100,70,0.7),
						   getHSLA(hue,100,70,0.2)];
		this.flareFade = getHSLA(hue+30,100,39,0);
	}
	this.update_weapon = function(type){
		if (type) {
			this.update_shot_hue(300);
			this.shot_type = true;  
			this.shot_interval = 5;
			this.w_type = "CANNON";
		} else {
			this.update_shot_hue(65);
			this.shot_type = false; 
			this.shot_interval = 6 - this.lazer_power;
			this.w_type = "LAZERS!";
		}
	}
	this.update_engine = function(type){
		if (type) {
			this.update_engine_hue(180); 
			this.speedMAX = 12;
			this.blastRadius = .25;
			this.flareL = Math.PI*(0.5-this.blastRadius);
			this.flareR = Math.PI*(0.5+this.blastRadius);
			this.change = .75;
		} else {
			if ( this.eng_upgrade < 5) { 
				this.eng_upgrade++;
				this.change += 0.2;
			} 
			this.update_engine_hue(180 + this.eng_upgrade*20);
			this.speedMAX = 12 + 2*this.eng_upgrade;
			this.blastRadius = .25 + 0.05*this.eng_upgrade;
			this.flareL = Math.PI*(0.5-this.blastRadius);
			this.flareR = Math.PI*(0.5+this.blastRadius);
			this.change = 1.5;
		}
	}
}


///////////////
/*
max speed 
speed move 
prev speed aka drift
move direction 
ship pointing direction ( thrusters applied to this ) 
    left - 45  ro apply force
    right + 45  to apply force
    frontleft ~+ 135
    frontright ~- 135
    just adjust actual speed ..! then each tick do alpha tick towardss actual
rotational direction & speed
*/
//////////////////////

function shipVector(spd,dir){
    let v1y = ship.speed* Math.cos(ship.r);
    let v1x = ship.speed* Math.sin(ship.r);
    let v2y = spd* Math.cos(dir);
    let v2x = spd* Math.sin(dir);
    let ry = (v1y+v2y);
    let rx = (v1x+v2x);
  //  let angle = Math.atan2(ry,rx);
    let calcSpeed = Math.sqrt((ry*ry)+(rx*rx));  
    if ( calcSpeed > ship.speedMAX ) { calcSpeed = ship.speedMAX; } 
  //  ship. 
  //  ship.
  //  ship.speed = 
  //  ship.r
}

//////////////////////////////////////////  ENGINES
function setEngineFlare(level){
    let glow = ctx.createRadialGradient(0,ship.core,0,0,ship.core,level*ship.h*.25);
    glow.addColorStop(0,ship.flareColor[4-level]); 
    glow.addColorStop(1,ship.flareFade);
    return glow;
}
function flareBurst(size,level){
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.fillStyle = setEngineFlare(level);
    ctx.arc(0,ship.core,size*ship.flare,ship.flareL,ship.flareR);
    ctx.fill();
}
function flarePrime(size,level){
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.fillStyle = ship.flareColor[level];
    ctx.lineTo(ship.girth/2,ship.core);
    ctx.lineTo(0,size*ship.core*.9);
    ctx.lineTo(-ship.girth/2,ship.core);
    ctx.fill();
}
function drawBurner(level){
    for( let i = level ; i > 0 ; i-- ) {
        flareBurst(i,i);
	}
	if ( activeKeys[38] ) {
    	for( let i = 0, j = 5-level ; i < level ; i++ , j++ ) {
    	    flarePrime(level-i,j);
		}
	}
}

// function fixLevel(level){
// 	if (level <= 0 ) return 0;
// 	if (level >= 5 ) return 5;
// 	return Math.round(level);
// }

// function radialBurn(x,y,level){
//     ctx.save();
// 	ctx.translate(x,y);
// 	let glow = ctx.createRadialGradient(0,0,50,40,0,1000);
// 	glow.addColorStop(0,ship.flareColor[2]); 
// 	glow.addColorStop(0.8,ship.flareColor[3]); 
//     glow.addColorStop(1,ship.flareColor[1]);
//     ctx.fillStyle = glow;
//     ctx.beginPath();
//     ctx.moveTo(0,0);
//     if (x < 0) {
//         ctx.arc(0,0,6,0,ship.flareR);
//     } else {
//         ctx.arc(0,0,6,ship.flareL,Math.PI);
//     }
//     ctx.fill();
//     ctx.restore();
// }
// function radialBurn(x,y,level){
//     ctx.save();
//     ctx.translate(x,y);
//     let i = level;
//     let j = 0;
//     while( j <= level ){
//         ctx.fillStyle = ship.flareColor[j];
//         ctx.beginPath();
//         ctx.moveTo(0,0);
//         if (x < 0) {
//             ctx.arc(0,0,i*6,0,ship.flareR);
//         } else {
//             ctx.arc(0,0,i*6,ship.flareL,Math.PI);
//         }
//         ctx.fill();
//         i--; j++;
//     }
//     ctx.restore();
// }
function radialBurn(x,y,level){
    ctx.save();
    ctx.translate(x,y);
    let i = level;
    let j = 0;
    while( j <= level ){
        ctx.fillStyle = ship.flareColor[j];
        ctx.beginPath();
        ctx.moveTo(0,0);
        if (x < 0) {
            ctx.arc(0,0,i*6,0,ship.flareR);
        } else {
            ctx.arc(0,0,i*6,ship.flareL,Math.PI);
        }
        ctx.fill();
        i--; j++;
    }
    ctx.restore();
}

function reverseBurn(level){
    if (level > 0 ) {	 	//	console.log(level);
      let glow = ctx.createLinearGradient(0,ship.wingF,0,ship.bridgePos);
	  glow.addColorStop(0, ship.flareColor[level]);
	  glow.addColorStop(0.2, ship.flareColor[level-1]);
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
     ctx.fillRect(-ship.tw*.8,ship.wingF,2*ship.tw*.8,ship.bridgePos*(level/4+0.25));
    }
}

/////////////////////////////////////////////   LIGHTING MODIFICATION
function lightsource(lightx,lighty){
    let steel = ctx.createLinearGradient(0,-ship.h/2,lightx,lighty);
    // steel.addColorStop(0,ship.skinLight);
    steel.addColorStop(0,ship.skin);
    steel.addColorStop(0.5,ship.skinShadow);
    // steel.addColorStop(0.9,'slategrey');
    steel.addColorStop(1,ship.deets);
    return steel;
}

function shipSkinning(){
    let steel = ctx.createLinearGradient(0,-ship.h,0,ship.h/2);
    // steel.addColorStop(0,ship.skinLight);
    steel.addColorStop(0,ship.skin);               ////////// TIP of NOSECONE
    steel.addColorStop(0.1,ship.skin); 
    steel.addColorStop(0.25,ship.skin);
    steel.addColorStop(0.5,ship.skinShadow);
    // steel.addColorStop(0.9,'slategrey');
    steel.addColorStop(1,ship.deets);
    return steel;
}
function turretColour( num ) {
    return "rgba(255,255,150," + num/10 + ")";
} 
//////////////////////////////////////////// DRAW SHIP
function drawShip() {
	let x = ship.x;
	let y = ship.y;
	let level = ship.engineLevel;
	let rot = ship.rot;
    ctx.save();
    ctx.translate(x,y); // current location of ship 
    ctx.rotate(rot*Math.PI/180);
	drawBurner(level);
	// console.log(ship.rightEng + "  " + ship.leftEng );
	// radialBurn(-ship.tw,ship.wingB,ship.leftEng);
    // radialBurn(ship.tw,ship.wingB,ship.rightEng);  
	if (ship.leftEng > 0 ){ 
		radialBurn(-ship.tw,ship.wingB,ship.leftEng);
	}
    if (ship.rightEng > 0 ){ 
		radialBurn(ship.tw,ship.wingB,ship.rightEng); 
	}
    reverseBurn(ship.rev);
    // ctx.fillStyle = lightsource(lightx,lighty);
    ctx.fillStyle = shipSkinning();///////////////////////////////////////////////////////////// LIGHT
    ctx.strokeStyle = ship.deets;
    ctx.lineWidth = 2;  // scale this with >= 1 ??
    // WING: wingspan
    ctx.beginPath(); // WING: main form 
    ctx.moveTo(-ship.tin,ship.wingB); 
    ctx.lineTo(-ship.w,ship.core);
    ctx.lineTo(-ship.tw,ship.th);
    ctx.lineTo(-ship.tin,ship.wingF);
    ctx.lineTo(ship.tin,ship.wingF);
    ctx.lineTo(ship.tw,ship.th);
    ctx.lineTo(ship.w,ship.core);
    ctx.lineTo(ship.tin,ship.wingB);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath(); // WING: start darker region
    ctx.fillStyle = ship.skinShadow;
    //ctx.moveTo(-ship.tin,(ship.wingF+ship.wingB*.66));
    ctx.lineTo(-ship.tin,ship.wingB); 
    ctx.lineTo(-ship.w,ship.core);
    ctx.lineTo(-ship.tin,(ship.wingF+ship.wingB*.33));
    ctx.lineTo(ship.tin,(ship.wingF+ship.wingB*.33));
    ctx.lineTo(ship.w,ship.core);
    ctx.lineTo(ship.tin,ship.wingB);
    // ctx.lineTo(ship.tin,(ship.wingF+ship.wingB*.66));
    ctx.closePath();
    ctx.fill();
    // lside / srside engines
    // ctx.fillStyle = lightsource(lightx,lighty);
    ctx.fillStyle = shipSkinning();///////////////////////////////////////////////////////////// LIGHT
    ctx.beginPath();
    ctx.moveTo(-ship.tw,(ship.wingF+ship.wingB*.33));
    ctx.lineTo(-ship.tw + ship.noseW ,ship.wingB);
    ctx.lineTo(-ship.tw,ship.core);                  // left wing engine rear
    ctx.lineTo(-ship.tw - ship.noseW,ship.wingB); 
    ctx.closePath();   // end left engine
    ctx.fill();
    ctx.stroke();                               
    ctx.beginPath();
    ctx.moveTo(ship.tw,(ship.wingF+ship.wingB*.33));
    ctx.lineTo(ship.tw + ship.noseW ,ship.wingB);
    ctx.lineTo(ship.tw,ship.core);                  // right wing engine rear
    ctx.lineTo(ship.tw - ship.noseW,ship.wingB); 
    ctx.closePath();   // end right engine
    ctx.fill();
    ctx.stroke();
    // DETAILS: detailing
    ctx.beginPath();
    ctx.setLineDash([2,4]);
    ctx.moveTo(-ship.tin,(ship.wingF+ship.wingB*.33));
    ctx.lineTo(ship.tin,(ship.wingF+ship.wingB*.33));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-ship.tin,(ship.wingF+ship.wingB*.66));
    ctx.lineTo(ship.tin,(ship.wingF+ship.wingB*.66));
    ctx.stroke();
    ctx.setLineDash([]);
    // hull //ctx.arc(0,ship.core,ship.girth,1.9*Math.PI,1.1*Math.PI);
    ctx.beginPath();
    ctx.moveTo(ship.girth,ship.core); // right side 
    ctx.lineTo(ship.crg,ship.core);//;/
    ctx.lineTo(ship.noseW,ship.aft);
    ctx.lineTo(-ship.noseW,ship.aft);
    ctx.lineTo(-ship.crg,ship.core);   
    ctx.lineTo(-ship.girth,ship.core); // left side
    ctx.lineTo(-ship.noseW,ship.noseH);
    ctx.lineTo(0,ship.noseTip);
    ctx.lineTo(ship.noseW,ship.noseH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath(); // HULL: start darker region
    ctx.fillStyle = ship.skinShadow;
    ctx.moveTo(-ship.crg,ship.wingB);
    ctx.lineTo(-ship.bridgeRad,-ship.bridgeRad);
    ctx.lineTo(ship.bridgeRad,-ship.bridgeRad);
    ctx.lineTo(ship.crg,ship.wingB);
    ctx.lineTo(0,ship.core);
    ctx.closePath();
    ctx.fill()
    ctx.setLineDash([2,4]);
    ctx.stroke();
    ctx.setLineDash([]);
    // engine
    // ctx.beginPath();
    // bridge
    ctx.fillStyle = ship.bridgeLight;
    ctx.beginPath();
    ctx.arc(0,ship.bridgePos,ship.bridgeRad,Math.PI,0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
/////////////////////////////////////// nose glow
    if ( activeKeys[32] && ship.charge > 0 ){
		ctx.beginPath(); 
		let r = Math.random();
		ctx.fillStyle = getHSLA(ship.shot_hue,80,80,Math.min(ship.charge*0.01*r,r*0.5));
        ctx.arc(0,ship.noseTip,Math.min(ship.charge,10),0,Math.PI*2);
      
		ctx.fill();
		ctx.beginPath();
		r = Math.random();
		ctx.strokeStyle = getHSLA(ship.shot_hue,80+r*20,80+r*10,Math.min(ship.charge*0.01*r,r*0.6));
		ctx.arc(0,ship.noseTip,Math.min(ship.charge,11)+r*2,0,Math.PI*2);
		ctx.stroke();
    }
    ctx.restore();
}

// draws all the asteroids
function drawAsteroids(x,y){
    ctx.save();
    ctx.translate(x,y);
    for ( let i = 0 ; i < asteroids.length ; i++ ){		//	console.log(asteroids[i]);
        drawAst(asteroids[i]);
    }
    ctx.restore();
}
// draws an asteroid
function drawAst( ast ){
    ctx.save();
    ctx.translate(ast.x,ast.y);
    ctx.rotate(ast.r * Math.PI /180);	
    ctx.beginPath();
    ctx.moveTo(0,ast.p[0]);
    let diff;
    let latent = ast.size/5;
    for ( let i = 1 ; i < ast.points ; i++ ){		// rotates around center and creates curves 
        ctx.rotate(Math.PI*2/ast.points);
        diff =  (ast.p[i] - ast.p[i-1]);
        ctx.quadraticCurveTo(ast.w,ast.p[i]-diff-latent,0,ast.p[i]);
        latent *=-1;		
    }
    ctx.rotate(Math.PI*2/ast.points);
    diff = (ast.p[0] - ast.p[ast.points-1]);
    ctx.quadraticCurveTo(ast.w,ast.p[0]-diff-latent,0,ast.p[0]);
    ctx.closePath();
    ctx.fillStyle = "#776666";
    ctx.fill();
    ctx.strokeStyle = "#443322";
    ctx.lineWidth = 2;
    ctx.stroke();
//  ctx.save();
//  ctx.clip();
//  ctx.strokeStyle = "red";
//  ctx.lineWidth = 5;
//  drawLocalTexture(ast);
//  ctx.restore();
    ctx.restore();
}

// ship.x += Math.cos((ship.rot-90)*Math.PI/180)*ship.speed ;  // plus drift   //ship.speedX;
// ship.y += Math.sin((ship.rot-90)*Math.PI/180)*ship.speed ;  // plus drift // ship.speedY;
function explosiveDeath(){
	// change values to not magic d < POW  where POW is relative to size
	let x1 = new Explosion(ship.x,ship.y,80,ship.eng_hue);
	let x2 = new Explosion(ship.x-10,ship.y+10,50,ship.eng_hue);
	let x3 = new Explosion(ship.x-10,ship.y-10,50,ship.eng_hue);
	let x4 = new Explosion(ship.x+10,ship.y+10,50,ship.eng_hue);
	let x5 = new Explosion(ship.x+10,ship.y-10,50,ship.eng_hue);
	let x6 = new Explosion(ship.x,ship.y,70,ship.shot_hue);
	let x7 = new Explosion(ship.x-25,ship.y,40,ship.shot_hue);
	let x8 = new Explosion(ship.x-25,ship.y,40,ship.shot_hue);
	let x9 = new Explosion(ship.x,ship.y+25,40,ship.shot_hue);
	let x0 = new Explosion(ship.x,ship.y-25,40,ship.shot_hue);
	explosions.push(x1);
	explosions.push(x2);
	explosions.push(x3);
	explosions.push(x4);
	explosions.push(x5);
	explosions.push(x6);
	explosions.push(x7);
	explosions.push(x8);
	explosions.push(x9);
	explosions.push(x0);
	for ( let i = asteroids.length -1 ; i >= 0 ; i-- ){
		let d = Math.sqrt(Math.pow((ship.y-asteroids[i].y),2)+Math.pow((ship.x-asteroids[i].x),2));
		if ( d < 200 ){ asteroids[i].hp -= 300; }
	}
}

let Explosion = function(x,y,f,h){
    this.x = x;
    this.y = y;
    this.f = f;
	this.t = 1;
	this.hue = h;
	this.sparkle = getHSLA(h,100,100,1);
	this.ring = getHSLA(h,90,80,1);
    // this.move() = function(){
    //     this.t -= 1; 
    // }
    // this.render() = function(){
    //     ctx.save();
    //     ctx.translate(this.x,this,y);
    //     ctx.beginPath();
    //     ctx.arc(0,0,0.5/this.t,0,Math.PI*2);
    //     ctx.fillStyle = getHSLA(120,80,10*this.t,this.t/10);
    //     ctx.fill();
    //     ctx.restore();
    // }
}

function drawExplosion( explo ){
    ctx.save();
    ctx.translate(explo.x,explo.y);
    ctx.beginPath();
    ctx.arc(0,0,explo.t,0,Math.PI*2);
    ctx.fillStyle = getHSLA(explo.hue,80,100-explo.t,Math.min(2/explo.t,1));
    ctx.fill();
    ctx.fillStyle = explo.sparkle;
    for (let i = 0 ; i < randomInt(6)+6 ; i++){
        ctx.fillRect(randomInt(explo.t*2)-explo.t,randomInt(explo.t*2)-explo.t,2,2); 
    }
    ctx.strokeStyle = explo.ring;
    ctx.stroke();
    ctx.restore(); 
}


function updateExplosions(){
    for ( let i = explosions.length-1 ; i >=0 ; i-- ){
        explosions[i].t += 2;
        if ( explosions[i].t >= explosions[i].f ){
            explosions.splice(i,1); 
        } 
    }
}

let Shot = function(x,y,r,size,dmg,hue){
    this.s = 24;
    this.x = x;
    this.y = y;
    this.r = r;
	this.dmg = dmg;
	this.hue = hue;
    this.dx = Math.cos(Math.PI*(this.r-90)/180)*this.s;
    this.dy = Math.sin(Math.PI*(this.r-90)/180)*this.s;
    this.size = size;
    this.col1 = ship.shot_color1;
    this.col2 = ship.shot_color2;
    this.move = function(){
        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
    }
    this.render = function() {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.r*Math.PI/180);
        ctx.strokeStyle = this.col2;
        ctx.lineWidth = this.size;
        ctx.fillStyle = this.col2;
        ctx.beginPath()
        ctx.arc(0,0-this.size,3*this.size,Math.PI,0);
        ctx.lineTo(0,16+this.size);
        ctx.closePath();
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.stroke();
        ctx.fillStyle = this.col1;
        ctx.beginPath()
        ctx.moveTo(-3,2);
        ctx.lineTo(0,1);   
        ctx.lineTo(3,2);
        ctx.lineTo(1,1-this.size);
        ctx.lineTo(0,8+this.size);
        ctx.lineTo(-1,1-this.size);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
}

let Lazer = function(x,y,r,size,dmg,hue){
    this.s = 24;
    this.x = x;
    this.y = y;
    this.r = r;
	this.dmg = dmg;
	this.hue = hue;
    this.dx = Math.cos(Math.PI*(this.r-90)/180)*this.s;
    this.dy = Math.sin(Math.PI*(this.r-90)/180)*this.s;
    this.size = size;
    this.col1 = ship.shot_color1;
    this.col2 = ship.shot_color2;
    this.move = function(){
        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
    }
    this.render = function() {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.r*Math.PI/180);
		ctx.beginPath();
		ctx.moveTo(-this.size,-6*this.size);
		ctx.lineTo(this.size,-3*this.size);
		ctx.lineTo(-this.size,0*this.size);
		ctx.lineTo(this.size,3*this.size);
		ctx.lineTo(-this.size,6*this.size);
		ctx.lineTo(this.size,9*this.size);
		ctx.lineTo(-this.size,12*this.size);
		ctx.lineTo(this.size,15*this.size);
		ctx.lineCap = "round";
		ctx.globalAlpha = 0.5;
		ctx.strokeStyle = this.col2;
        ctx.lineWidth = this.size*2.5;
        ctx.stroke();
		ctx.globalAlpha = 0.8;
		ctx.strokeStyle = this.col2;
		ctx.lineWidth = this.size;
        ctx.stroke();
        ctx.restore();
    }
}


///////////////////////////////////////  ACTION FUNCTION  add shot(s)!
function shoot(){
    let shotpointY =  ship.y - Math.sin(Math.PI*(ship.rot-90)/180)*(-ship.h);
    let shotpointX =  ship.x + Math.cos(Math.PI*(ship.rot-90)/180)*(ship.h);
	if ( ship.shot_type ) {
		let s = new Shot(shotpointX,shotpointY,ship.rot,Math.min(ship.charge/4,4),(ship.charge+1)*ship.shot_power/6,ship.shot_hue);
		shots.push(s);
	} else {
		// let l = new Lazer(shotpointX,shotpointY,ship.rot,Math.min(ship.charge+4/16,4),Math.max(ship.charge,15),ship.shot_hue);
		let l = new Lazer(shotpointX,shotpointY,ship.rot,ship.size*2,ship.lazer_power*6,ship.shot_hue);
		lazers.push(l);
	}
    fired++;
    cannon++;
}
// ship.tw = ship.w*.75;     // turret distance
// ship.th = -ship.h*.25;    // turret height
function dualShot(){
    let spYL =  ship.y + Math.cos(Math.PI*((ship.rot-90)%360)/180)*(-ship.tw);
    let spXL =  ship.x + Math.sin(Math.PI*((ship.rot-90)%360)/180)*(ship.tw);
    let spYR =  ship.y + Math.cos(Math.PI*((ship.rot-90)%360)/180)*(ship.tw);
	let spXR =  ship.x + Math.sin(Math.PI*((ship.rot-90)%360)/180)*(-ship.tw);
	if ( ship.shot_type ) {
		let sL = new Shot(spXL,spYL,ship.rot,Math.min(ship.shot_power,3)*ship.size,ship.shot_power,ship.shot_hue);
		let sR = new Shot(spXR,spYR,ship.rot,Math.min(ship.shot_power,3)*ship.size,ship.shot_power,ship.shot_hue);
		shots.push(sL);
		shots.push(sR);
	} else {
		let lL = new Lazer(spXL,spYL,ship.rot,ship.size*2,ship.lazer_power*6,ship.shot_hue);
		let lR = new Lazer(spXR,spYR,ship.rot,ship.size*2,ship.lazer_power*6,ship.shot_hue);
		lazers.push(lL);
		lazers.push(lR);
	}

   
    fired++;
    duals++;
}

///function drawLocalTexture(ast) {
    // for (let i = 0 ; i < ast.points ; i++ ){
    //     ctx.beginPath();
    //     ctx.rotate(Math.PI*2/ast.points);
    //     ctx.arc(0,ast.p[i],ast.p[i]**2,0,Math.PI);
    //     ctx.stroke();
    // }
//}

// creates Asteroid "lumpy space rock"
function Asteroid(x,y,dir,speed,size,points){
    this.x = x; 						// x co-ord
    this.y = y;							// y co-ord  
    this.r = 0;							// rotation 
    this.speed = speed;					// for animation later 
    this.dir = dir; //randomInt(360);	// direction of movement
    this.size = size;					// the base size ( roughly )
    this.points = points;				// number of random fluctuations on curved asteroid structure
    this.rotSpeed  = randomInt(10)-5; 	// for animation later 
    this.w = genW(points,size);			// rough middle ground between variant points
    this.p = genArray(points,size);  	// example ast.points = 8 ast.p = [10,12,11,8,11,10,9,9]
    this.hp = size+size;
}
// generates w for each asteroid
function genW(points,size){
    return Math.sqrt(2*(size*size)-Math.cos(points*Math.PI/360))/2;
}
// generates array of points for an asteroid 
function genArray(points,size){
    let arr = new Array();
    for( let i = 0 ; i < points ; i++ ) {
        let x = +(randomInt(Math.floor(size*.5)) + Math.floor(size*.75));
        arr.push( x );
    }
    return arr; 	
}

function Dust(x,y,size){
    this.x = x;
    this.y = y;
    this.size = size;
    this.t = 1.0;
    this.render = function(){
        ctx.save();
        ctx.translate(this.x,this.y);
        //ctx.fillStyle = "yellow";  
        ctx.fillStyle = getHSLA(0,8,43,this.t);         // "#776666" == hsla(0, 8%, 43%, 1)
        for (let i = 0 ; i < randomInt(this.size)+this.size ; i++){
            ctx.fillRect(randomInt(this.size*2)-this.size,randomInt(this.size*2)-this.size,2,2); 
        }
        ctx.restore();
    }
}
function updateDust(){
    for ( let i = dusts.length -1 ; i >= 0 ; i-- ){
        dusts[i].t -= 0.1;
        if ( dusts[i].t <= 0 ){
            dusts.splice(i,1);
        }
    }
}

function genPowerUp(){
	let pr = randomInt(5);
	let type;
	let px;
	let py;
	let pdx;
	let pdy;
	let hue;
	switch(pr){
		case 0:
			type = "CAN";
			hue = 300;		
			break;
		case 1:	
			type = "LZR";
			hue = 65;
			break;
		case 2:
			type = "ENG";
			hue  = 260;
			break;
		case 3:
			type = "INV";
			hue = 180;
			break;
		case 4:
			type = "HP";		
			hue = 0;
			break;
		// case 5:	
		// 	type = "hp"; 
		// 	hue = 0;		break;
		// default:
		// 	type = "hp"; 
		// 	hue = 0;
	}
	pr = randomInt(4);
	switch(pr){
		case 0: 			// LEFT
			px = -30;
			py = 30+ randomInt(canvas.height -60);
			pdx = 5;
			if ( py < canvas.height /2 ) {
				pdy = randomInt(2)+1;
			} else {
				pdy = -(randomInt(2)+1);
			}
			break;
		case 1:				// TOP
			px = randomInt( canvas.width -60 ) + 30;
			py = -30
			pdy = 5;
			if ( px < canvas.width /2 ) {
				pdx = randomInt(2)+1;
			} else {
				pdx = -(randomInt(2)+1);
			}
			break; 
		case 2: 			// RIGHT
			px = canvas.width + 30;
			py = 30+ randomInt(canvas.height -60);
			pdx = -5;
			if ( py < canvas.height /2 ) {
				pdy = randomInt(2)+1;
			} else {
				pdy = -(randomInt(2)+1);
			}
			break;
		case 3: 			// BTM
			px = randomInt( canvas.width -60 ) + 30;
			py = canvas.height + 30
			pdy = -5;
			if ( px < canvas.width /2 ) {
				pdx = randomInt(2)+1;
			} else {
				pdx = -(randomInt(2)+1);
			}
			break;
	}
	let p = new PowerUp(px,py,pdx,pdy,type,hue);
	powers.push(p);
}

let PowerUp = function(x,y,dx,dy,type,hue){
	this.x = x;
	this.y = y;
	this.type = type;
	this.dx = dx;
	this.dy = dy; 
	this.hue = hue;
	this.size = 20;
	this.pulse = 0.2;
	this.move = function(){
        this.x = this.x + this.dx;
		this.y = this.y + this.dy;
		if ( this.size >= 21 ) { 
			this.pulse = -0.2;;
		} else if ( this.size <= 19 ) {
			this.pulse = 0.2;
		}
		this.size += this.pulse;
	}
	this.render = function(){
		ctx.save();
		ctx.translate(this.x,this.y);
		ctx.beginPath();
		ctx.arc(0,0,this.size,0,Math.PI*2);
		ctx.lineWidth = 2;
		ctx.strokeStyle = getHSLA(this.hue,80,70+ this.pulse*10,0.6-this.pulse);
		ctx.fillStyle = getHSLA(this.hue,60,60,0.2+this.size*0.02);
		ctx.stroke();
		ctx.fill();
		ctx.fillStyle = getHSLA(this.hue,90,65+ this.pulse*10,0.8+this.size*0.1);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(this.type,0,0);
		ctx.restore();
	}
}


///////////////////////////////////////  TOOLS:  GET HSL string
function getHSL(h,s,l){
    var str = "hsl("+h+","+s+"%,"+l+"%)";
    return str;
} 
// with alpha channel
function getHSLA(h,s,l,a){
    var str = "hsl("+h+","+s+"%,"+l+"%,"+a+")";
    return str;
}
// returns random int
function randomInt( range ){
    let i = Math.floor( Math.random()* Math.floor(range)  );
    //console.log(i);
    return i;
}
function updateScore(){
    kills++;

}


//////////////////////////////////////////////////  INFO DISPLAYS
function drawDisplay(){
    let spacing = 20;
    let textCol = getHSLA(310,70,70,1);
    let textCol2 = getHSLA(222,70,70,1);
    let dispCol = getHSLA(0,0,50,.4);
    let dispBorder = getHSLA(222,50,50,1);
    let f1 = "bold 12px sans-serif";
    let f2 = "11px sans-serif";
    ctx.font = f1;
	
	ctx.save(); 
    ctx.beginPath();
    ctx.translate(reset_x+reset_w+20,reset_y);
    ctx.beginPath();
    ctx.fillStyle = dispCol;
    ctx.strokeStyle = dispBorder;
    ctx.rect(0,0,200,reset_h);
    ctx.fill();
    ctx.stroke();
	ctx.fillStyle = getHSLA(60,70,70,1);
    ctx.fillText("SCORE:  " + kills,10,15);
	ctx.restore();

    let side = canvas.width -130;
    if ( stats ) { 
        ctx.save(); 
        ctx.beginPath();
        ctx.translate(side,10);
        ctx.fillStyle = dispCol;
        ctx.strokeStyle = dispBorder;
        ctx.rect(0,0,120,250);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = dispBorder;
        ctx.fillText("press TAB to hide",10,spacing*1);
        ctx.fillStyle = textCol;
        ctx.fillText("HIGHSCORE: "+highscore,10,spacing*2);
        ctx.fillText("DEATHS: "+deaths,10,spacing*3);
        ctx.fillText("RESETS: "+resets,10,spacing*4);
        ctx.font = f2;
        if (fired > 0 ){ 
            ctx.fillText("ACCURACY: % "+Math.floor(hits/fired*100),10,spacing*5); 
        } else {
            ctx.fillText("ACCURACY: % "+0,10,spacing*5);
        }
        ctx.fillText("SHOTS: "+cannon,10,spacing*6);
        ctx.fillText("DUAL SHOTS: "+duals,10,spacing*7);
        ctx.fillStyle = textCol2;
//        ctx.fillText("",10,spacing*9);
        ctx.font = f1;
        ctx.fillText("Controls:",10,spacing*8);
        ctx.font = f2;
        ctx.fillText("R - Reset ",10,spacing*9);
        ctx.fillText("B - Dual Shot",10,spacing*10);
        ctx.fillText("SPACE - Cannon",10,spacing*11);
        ctx.fillText("⬅,⬆,⬇,➡ - Move",10,spacing*12);
      	// ctx.fillText(" ft Thruster",10,spacing*13);
        // ctx.fillText(" Right Thruster",10,spacing*14);
        ctx.restore();
    } else {
        ctx.save(); 
        ctx.beginPath();
        ctx.translate(side,10);
        ctx.fillStyle = dispBorder;
        ctx.fillText("press TAB for info ",10,20);
        ctx.restore();
    }
///// RESET BOX / BUTTON:
    ctx.save(); 
    ctx.beginPath();
    ctx.translate(reset_x,reset_y);
    ctx.beginPath();
    ctx.fillStyle = dispCol;
    ctx.strokeStyle = dispBorder;
    ctx.rect(0,0,reset_w,reset_h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = textCol2;
    ctx.fillText("RESET GAME",10,15);
	ctx.restore();
	
//////// WEAPONS:
	
	ctx.save();
	ctx.translate(0,reset_h+15);
	ctx.beginPath();
	//ctx.fillText("WEAPON:",10,spacing*1);
	//ctx.fillStyle = getHSLA(ship.shot_hue,70,70,1);
	//ctx.fillText(ship.w_type,70,spacing*1);
	ctx.strokeStyle	= getHSLA(0,70,70,1); 
	for ( let i = 0 ; i < ship.max_hp/20 ; i++ ){
		ctx.beginPath();
		ctx.rect(i*10+75,spacing*0.58,9,8);
		ctx.stroke();
	}
	ctx.fillStyle = getHSLA(0,70,70,1); 
	ctx.fillText("HP:  " + ship.hp,10,1*spacing);

	for ( let i = 0 ; i < ship.hp/20 ; i++ ){
		ctx.fillRect(i*10+75,spacing*0.58,9,8);
	}
	if ( ship.shot_type ) { 
		ctx.fillStyle = getHSLA(ship.shot_hue,70,70,1);
	} else {
		ctx.fillStyle = dispBorder;
	}
	ctx.fillText("CANNON:",10,spacing*2);
	for ( let i = 0 ; i < ship.shot_power ; i++ ){
		ctx.fillRect(i*10+75,spacing*1.58,9,8);
	}
	
	if ( !ship.shot_type ) { 
		ctx.fillStyle = getHSLA(ship.shot_hue,70,70,1); 
	} else {
		ctx.fillStyle = dispBorder;
	}
	ctx.fillText("LAZERS:",10,spacing*3);
	for ( let i = 0 ; i < ship.lazer_power ; i++ ){
		ctx.fillRect(i*10+75,spacing*2.58,9,8);
	}
	// ctx.strokeStyle	= getHSLA(ship.eng_hue,50,50,1); 
	// ctx.lineWidth = 1.3;
	// for ( let i = 0 ; i < 5 ; i++ ){
	// 	ctx.beginPath();
	// 	ctx.rect(i*10+75,spacing*3.58,9,8);
	// 	ctx.stroke();
	// }
	ctx.fillStyle = getHSLA(ship.eng_hue,70,70,1); 
	ctx.fillText("ENGINE:",10,spacing*4);
	for ( let i = 0 ; i < ship.eng_upgrade ; i++ ){
		ctx.fillRect(i*10+75,spacing*3.58,9,8);
	}
	ctx.restore();
}

function toggleStats(){
    stats = !stats;
}

function shotBurst(){
	let x = ship.x;
	let y = ship.y;
	for ( let i = 0 ; i < 8 ; i++ ){
		let s = new Shot(x,y,i*360/8,ship.shot_power*ship.size,ship.shot_power*ship.size,ship.shot_hue);
		shots.push(s);
	}
} 	

function lazerBurst(){
	let x = ship.x;
	let y = ship.y;
	for ( let i = 0 ; i < 32 ; i++ ){
		let l = new Lazer(x,y,i*360/32,ship.size*2,ship.lazer_power*6,ship.shot_hue);
		lazers.push(l);
	}
}


