// Lab 05 Peter Newman
"use strict"
let ctx;
let canvas;
let ro = 0;

// spinning flowers NEXT!!!

function setup() {
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 900;
   // drawTree(50,100);
   // drawTreeCircle(250,250,75,8);
   // drawTreeCircle(250,550,65,12);
    ctx.save();
    megaTrees(450,450);
    var magic = setInterval(aniTree,50);
    aniTree();
}

// Animation of the Trees who deal with own rotational schema but this clears
function aniTree() {
    ctx.clearRect(0,0,1200,900);
    megaTrees(450,450);
}

// Draws Multple circles of Trees 
function megaTrees(x,y){
    ctx.save();
    for ( let i = 0 ; i < 7 ; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        drawTreeCircle(x,y,(i+i)*32,4*(i+1));
    }
    ctx.restore();
    ro++;
}

// Draws a Circle of Trees ( changes Color ) 
function drawTreeCircle(x,y,r,count){
    ctx.save();
    ctx.translate(x,y);
    if ( count /4 % 2 == 0 ) { 
        ctx.rotate(ro*Math.PI/180);
    } else {
        ctx.rotate(-ro*Math.PI/180);
    }
    for ( let i = 0 ; i < count ; i++ ){
        ctx.rotate(2*Math.PI/count);
        let text = "hsl(" + i*360/count + ",100%,50%)"
        let colorX = text;
        drawFlora(0,-r*1.2,colorX,(count+2)/16);

    }
    ctx.restore();
}

function drawFlora(x,y,colorX,size){
    ctx.save();
    ctx.translate(x,y+20);
    ctx.fillStyle = colorX;
    ctx.beginPath();
    // ctx.moveTo(0,20);
    for (let i = 0 ; i < 10 ; i++){
        ctx.rotate(Math.PI/5);
        if (i%2==0){

             ctx.lineTo(0,20*size);
          //  ctx.quadraticCurveTo(20,20,0,40);
        } else {
            ctx.lineTo(0,10*size);
           // ctx.quadraticCurveTo(20,40,0,20);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}


// Draws Tree
function drawTree(x,y,colorX) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,-45);
    ctx.strokeStyle ='brown';
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0,-35,20,0,2*Math.PI);
    ctx.fillStyle = colorX;
    ctx.fill();
    ctx.restore();
}


