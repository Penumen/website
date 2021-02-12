// Lab 05 Peter Newman
"use strict"
let ctx;
let canvas;
let leaf = 6;

// NEXT implementations
// different types of bark drawign fucntions at random 
// leaves to keep within specific color range
// different random set of leaves & leaf textue
// branchability ( limit number of offshooots)
// random circular nodes split up around circle

function setup() {
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = 1400;
    canvas.height = 1100;
    // ctx.translate(400,500);
   
//    background();
   // forest();
    ctx.translate(600,500);
    treeStar(randomInt(7)+2);
    //startTree(400,600,55,(100+randomInt(40)));
   // startTree(400,600,55,(110+randomInt(20)));
}
function background() {
    let bg =  ctx.createLinearGradient(0,0,0,canvas.height);
    bg.addColorStop(0,"rgb(100,100,255)");
    bg.addColorStop(0.499,"rgb(190,190,255)");
    bg.addColorStop(0.5,"rgb(150,100,100)");
    bg.addColorStop(1,"rgb(90,30,35)");
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

function treeStar(num){
    for ( let i = 0 ; i < num ; i++ ){
        ctx.rotate(Math.PI*randomInt(20)/180);
        startTree(0,0,39+randomInt(39),90+randomInt(30));
        ctx.rotate(Math.PI*2/num);
    }
}
function printSky(){
    let sky =  ctx.createLinearGradient(0,0,0,canvas.height);
    sky.addColorStop(0,"rgba(100,100,255,0)");
    sky.addColorStop(0.5,"rgba(255,255,170,0.1)");
    sky.addColorStop(1,"rgba(55,55,17,0.1)");
    ctx.fillStyle = sky;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

function forest() {
    let x = randomInt(10)+15;
    let layers = 12;
    let size = 15;
    let change = 5;
    ctx.save();

    for ( let i = 0 ; i < layers ; i++ ){
        printSky();
        for ( let across = 0 ; across < x ; across++ ) {
            startTree( across*canvas.width/x, 500+(i*i*canvas.height/7/2)/layers , size, (90+randomInt(60)) );

        }
        x-=1; size+=change;
    }

    ctx.restore();
}


function startTree(x,y,size,hue){
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,-size );
    ctx.translate(0,-size );
    ctx.lineWidth = size /3.7;
    ctx.strokeStyle = 'hsl(35, 60%, 10%,1)';
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.fillStyle = hueShift(hue);
    drawTree(size,hue); 
    ctx.restore();
}


function randomInt(max){
	return Math.floor( Math.random() * max); 
}

function randomRotate() {
	ctx.rotate(Math.PI *( randomInt(80) - 40 )/180);
}	

function bud(size,hue){
    ctx.save();
    randomRotate();
    ctx.beginPath();
    ctx.moveTo(0,0);
    let modication = randomInt(8);
    ctx.lineTo(0,-size + modication );
    ctx.translate(0,-size + modication );
    ctx.lineWidth = size /3.7;
    ctx.stroke();
    drawTree(size - randomInt(3),hue);
    ctx.restore();
}

function drawTree(size,hue) {
    let h = (Number(hue)+randomInt(9)-6);
	ctx.save();
	if ( size >= 6 ) { 
		let n = randomInt(7);
        switch(n) {
            case 6: 
                bud(size*.9,h)
            case 5:
                bud(size*.8,h)
            case 4:
                bud(size*.7,h)
                break;
            case 3:
                bud(size,h)
              //  drawLeaf(leaf,h);
            case 2:
                bud(size*.9,h)
              //  drawLeaf(leaf*.8,h);
            case 1: 
                bud(size*.8,h)
               // drawLeaf(leaf*.5,h);
               break;
            default:
                bud(size,h);
                bud(size/2,h);
               // drawLeaf(leaf*.8,h);
        }
	} else { 
        drawLeaf(leaf,h);
        //drawLeaf(leaf,h);
	}    
	ctx.restore();
}
function colourString(h,s,l){
    return "hsl(" +h+ "," +s+ "%," +l+ "%," +0.4 + ")";
}

function hueShift(h){
    return colourString(h,60,50);
}

function drawLeaf(size,hue) {
	ctx.save();
	randomRotate();
	ctx.fillStyle = hueShift(hue);
	ctx.beginPath();
	ctx.arc(0,0,size,0,Math.PI);
	ctx.lineTo(0,-2.5*size);
	ctx.fill();
	ctx.restore();
}



