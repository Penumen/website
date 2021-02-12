// Peter Newman // Ass08, CPSC:2130 
/// GOALS: eyes look at mouse ,, eye run from mouse, don't overlap , don't go off screen
// overlap with eye using mouse and have them pain shake and pop // blood in different array
var canvas;
var ctx;
var eyes=[];                           
var atcol = 186;                        // s 55 // l 60  
var atmos = getHSLA(atcol,55,60,0.01);  // "rgba(100,199,210,0.01)"; // also this colourish
var mouseX;
var mouseY;
var cross;
var chosen;                             // this is the player controlled eye also the one that spawns more
function setup(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
	window.addEventListener('keydown',handleKeyDown);
    window.addEventListener('mousemove',handleMouseMove);
    window.addEventListener('click',handleMouseClick);
    mouseX = canvas.width/2;             // in case no mouse in window eyes look to centre
    mouseY = canvas.height/2;            // in case no mouse in window eyes look to centre
    cross = Math.sqrt(Math.pow(canvas.width*.5,2)+Math.pow(canvas.height*.5,2));    // quick canvas relative calc for dist 
    insertEyes(7+randomInt(4));                                                     // add multiple "Eye"s to eyes array
    eyes.forEach(function(eye){ eye.setEye(); } );                                  // set em all up! saves processing while running
    chosen = eyes[eyes.length-1];                                                   // one eye has unique powers
    devileyes();                                                                    // gives visual uniqueness to the chosen eye 
    main();
}

var Eye = function(x,y,rad,hue) {
    this.x = x;                         // x location 
    this.y = y;                         // y location
    this.dx = 1 + randomInt(2);         // eye speed x
    this.dy = 1 + randomInt(2);         // eye speed y
    this.rad = rad;                     // eye radius
    this.maxPuRad = rad*.45;            // maximum pupil radius for dialation
    this.hue = hue;                     // hue of iris
    this.pupRot = 0;                    // make this the roation in degrees to locate lens
    this.dist = 0;                      // *dist* number from mouse to calc in iris move and pupil dialation 
    this.p = 13+randomInt(8);           // random number of iris lines to create eye diversity
    // posiible this.?? if wish to insert change of colour or size when hover...
    this.render = function(){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.beginPath();
        ctx.fillStyle = this.wht;                  // Eye White
        ctx.arc(0,0,this.rad,0,Math.PI*2);
        ctx.fill();         // ctx.strokeStyle = "#000000";    ctx.stroke();    // uncomment for outlined eyes
        ctx.save();
        //////////////////////////////////////////////   MOVE TO LENS HERE
        ctx.translate(Math.min(this.dist,1)*this.maxPuRad*Math.cos(this.pupRot),Math.min(this.dist,1)*this.maxPuRad*Math.sin(this.pupRot));  
        ctx.beginPath();
        ctx.fillStyle = "#445566";
        ctx.fillStyle = getHSL(this.hue,50,30);
        ctx.arc(0,0,this.rad*.5,0,Math.PI*2);
        ctx.fill();
       /////////////////////////////////////////////// Iris Lines
        ctx.beginPath();
        ctx.lineWidth = 5;
        for (let i = 0 ; i < this.p ; i++ ){
            ctx.rotate(2*Math.PI/this.p);
            ctx.moveTo(0,0);
            ctx.lineTo(this.rad*.46,0);
        }
        ctx.strokeStyle = getHSL(this.hue,50,40);
        ctx.stroke();
        //////////////////////////////////////////////// Pupil
        ctx.fillStyle = "#000000";                 
        ctx.beginPath();
       // ctx.arc(0,0,this.rad*.3,0,Math.PI*2); // no pupil change
        ctx.arc(0,0,Math.max(Math.min(1/(1+this.dist),1),.5)*this.rad*.4,0,Math.PI*2); // swap above to unchange pupil 
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = getHSL(this.hue,50,30);
        ctx.stroke();
        //////////////////////////////////////////////// Overlay Shadow & glare
        ctx.restore();
        ctx.beginPath();
        ctx.fillStyle = this.over;              // subtle colour overlay 
        ctx.arc(0,0,this.rad,0,Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0,0,this.rad,0,Math.PI*2);
        ctx.fillStyle = this.dk;                // Overlay Shadow & Sphere highlight gradient
        ctx.fill();
       // ctx.stroke();
        ctx.restore();
    }
    this.updatePupil = function (){             // location relative angle to mouse pointer and point pupil to those degrees     // mouseX    // mouseY
        let deg =  Math.atan2((mouseY-this.y),(mouseX-this.x));
        this.pupRot = deg;
        var d = Math.sqrt((mouseY-this.y)*(mouseY-this.y)+(mouseX-this.x)*(mouseX-this.x));
        this.dist = d/cross;
    }
    this.moveTo = function(x,y){                // unused // could be fun to create trail of eyes 
        this.x = x;
        this.y = y;				
    }
    this.moveBy = function(dx,dy){              // increased/decreases movement speed in direction according to arrows 
        this.dx += dx;
        this.dy += dy;
    }
    this.slow = function() {                    // used when space bar pushed ... slows movement of control eye ( chosen )
        this.dx *=.9;
        this.dy *=.9;
    }
    this.setEye = function() {                  // presets needed gradients and som calculated numbers to save calculation / update
        this.xs = Math.floor(this.rad*.2);
        this.ys = -Math.floor(this.rad*.2);
        this.rs = Math.floor(this.rad*1);
        this.re = Math.floor(this.rad*1.8);
        this.wht = ctx.createRadialGradient(this.xs,this.ys,this.rs,this.xs,this.ys,this.re);
        this.wht.addColorStop(0,"#FFFFFF");
        this.wht.addColorStop(1,"#FF88BB");
        this.over = ctx.createRadialGradient(-this.xs,this.ys,this.rs,-this.xs,this.ys,this.re);
        this.over.addColorStop(0,"rgba(200,200,180,0.2)");
        this.over.addColorStop(1,"rgba(0,0,0,1)");
        this.dk = ctx.createRadialGradient(0,0,0,0,0,this.rad*1.1);
        this.dk.addColorStop(0,"rgba(255,255,222,.2)");
        this.dk.addColorStop(0.2,"rgba(255,255,255,0)");
        this.dk.addColorStop(0.8,"rgba(255,255,255,0)");
        this.dk.addColorStop(1,"rgba(80,30,77,.6)");
    }
}

/////////////////////////////////////// GET HSL string
function getHSL(h,s,l){
    var str = "hsl("+h+","+s+"%,"+l+"%)";
    return str;
} 
// with alpha channel
function getHSLA(h,s,l,a){
    var str = "hsl("+h+","+s+"%,"+l+"%,"+a+")";
    return str;
}
/////////////////////////////////////// Iniatiate EYES array
function insertEyes(n){
    for (let i=0 ; i < n ; i++) { // x,y,size,hue
        var me = new Eye(randomInt(canvas.width),randomInt(canvas.height),40+randomInt(20),20+randomInt(265))
        eyes.push(me);
    }
}

/////////////////////////////////////////[ M A I N ]
function main() {
    window.requestAnimationFrame(drawAll);
}

/////////////////////////////////////////////////////////////// KEY DOWN
function handleKeyDown(event) {
    if (event.key == "ArrowUp"){	
        event.preventDefault();
        chosen.moveBy(0,-1);
    }
    if (event.key == "ArrowDown"){
        event.preventDefault();
        chosen.moveBy(0,1);
    }
    if (event.key == "ArrowLeft"){
        event.preventDefault();
        chosen.moveBy(-1,0);
    }
    if (event.key == "ArrowRight"){
        event.preventDefault();
        chosen.moveBy(1,0);
    }
    if (event.key == " "){
        event.preventDefault();
        chosen.slow();
    }
}
/////////////////////////////////////////////////////////////// MOUSE MOVE
function handleMouseMove(){
    var canvasRect = canvas.getBoundingClientRect();
    mouseX =  event.clientX -canvasRect.left;
    mouseY =  event.clientY -canvasRect.top;
}

/////////////////////////////////////////////////////////////// MOUSE CLICK
function handleMouseClick(){
    var d = Math.sqrt((mouseY-chosen.y)*(mouseY-chosen.y)+(mouseX-chosen.x)*(mouseX-chosen.x));
    if (d <= chosen.rad) {
       var n = new Eye(chosen.x,chosen.y,16+randomInt(16),(330+randomInt(60))%360);
       n.setEye(); 
       eyes.splice(eyes.length-1,0,n);
       if ( atcol > 0 ) { atcol /= 2; }
       atmos = getHSLA(atcol,55,60,0.01); 
    }

}

/////////////////////////////////////////////////////////////// DRAW ALL LOGIC
function drawAll(){
    ctx.fillStyle = "#dfdddd";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    eyes.forEach(function(eye){ 
        ctx.fillStyle = atmos;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        eye.render();  } );
    update();
    window.requestAnimationFrame(drawAll);
}

/////////////////////////////////////////////////////////////// UPDATE LOGIC
function update() {
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
    } 
   // updateText("my","y: "+mouseY);
   // updateText("mx","x: "+mouseX); 
   // updateText("lastDeg","Last Eye Degree: "+eyes[eyes.length-1].pupRot);
}

// returns random int  0 -> < r
function randomInt( range ){
    let i = Math.floor( Math.random()* Math.floor(range)  );
    return i;
}

// updates a text element used for debugging
function updateText(id,str){
	document.getElementById(id).innerHTML = str;
}

// Devilizes // gives uniqueness to the chosen eye // pink hue
function devileyes(){
    chosen.hue = 0;
    var devil = ctx.createRadialGradient(chosen.xs,chosen.ys,chosen.rs,chosen.xs,chosen.ys,chosen.re);
    devil.addColorStop(0,"#ffeeee");
    devil.addColorStop(.5,"#ff8888");
    devil.addColorStop(1,"#550000");
    chosen.wht = devil;

}

