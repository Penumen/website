/*
Easy implementation:
beach/water scalar, colour change, populous point and click to raise as per brush style 
redraw feature  
styles and types.. round island vs.. else 
*/
///
var canvas;
var ctx;
var N = 128; // 256 = nice
var size = 4; // 2 is nice
var mouseX; 
var mouseY;
var p1;
var map1 = [];
var map2 = [];
var map3 = [];
var map4 = [];
var oct = 256;
var scalar = .8    ; // .8 grainy and okay ... 0.4 smooth af
var cutMod = .05;
var baseColour;

function init(){
	canvas = document.getElementById("farm");
	ctx = canvas.getContext("2d");
	window.addEventListener('keydown',handleKeyDown);
    window.addEventListener('mousemove',handleMouseMove);
    // window.addEventListener('click',handleMouseClick);
    baseColour = Math.random()*100;
    map1 = myNoise2D(map1);
    map2 = myNoise2D(map2);
    genMap3Cut();
    cutMapBorder()
    drawAll();
}

function handleKeyDown(e) {
    if (e.key == "ArrowUp"){	
        e.preventDefault();
    }
    if (e.key == "ArrowDown"){
        e.preventDefault();
    }
    if (e.key == "ArrowLeft"){
        e.preventDefault();
    }
    if (e.key == "ArrowRight"){
        e.preventDefault();
    }
    console.log(e.key);
}
function handleMouseMove(e) {
    var canvasRect = canvas.getBoundingClientRect();
    mouseX = event.clientX -canvasRect.left;
    mouseY = event.clientY -canvasRect.top;
}

function myNoise2D(map){
    let seed2D = new Array(N);
    for (let i = 0 ; i < N ; i++ ){
        seed2D[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            seed2D[i][j] = Math.random();
        }
    }
    map = [];
    for (let i = 0 ; i < N ; i++ ){ 
        map[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            map[i][j]=0;
        }
    } 
    var scale = oct;
    var jump = N;
    var sum = 0;  
    while ( jump >= 1 ){
     //   console.log("Scale: " + scale + "    jump: " + jump);
        for(let g = 0 ; g < N ; g+= jump){
            /////if offsetG ==
            var offsetG;
            if (g+jump >= N){
                offsetG = Math.floor(g+jump-1);
            } else {
                offsetG = Math.floor(g+jump);
            }

            for ( let j = 0 ; j < N ; j+=jump ){
                let offsetJ;
                if (j==0 && g==0 ){ 
                    map[g][j]+= seed2D[g][j]*scale; 
                } 
                if (j==0 ) {
                    map[offsetG][j]+= seed2D[offsetG][j]*scale;
                }
                if (j+jump >= N){
                    offsetJ = Math.floor(j+jump-1);
                } else {
                    offsetJ = Math.floor(j+jump);
                }
                if (g==0 ) {
                    // if (j+jump >= N){
                    //     offsetJ = Math.floor(j+jump-1);
                    // } else {
                    //     offsetJ = Math.floor(j+jump);
                    // }
                    map[g][offsetJ]+= seed2D[g][offsetJ]*scale;    
                }
               
                map[offsetG][offsetJ]+= seed2D[offsetG][offsetJ]*scale;
                interpolate2D(g,offsetG,j,offsetJ,map);
       
                
                // console.log("-");
            }
        }
        jump = Math.floor(jump/2);
        sum+=scale;
        scale*=scalar;
        // console.log(".");
    }
    for (let h = 0 ; h < N ; h++ ){
        for (let i = 0 ; i < N ; i++ ){
            map[h][i] = map[h][i]/sum;
        }   
    }   
    return map; 
}
function interpolate2D(startG,endG,startJ,endJ,map){
    //  console.log("Enter Interpolate: "+start+" , " +end+ " , "+ scale);
    var midG = Math.floor((startG + endG)/2);
    var midJ = Math.floor((startJ + endJ)/2);
    if ( midG > startG && midG < endG && midJ > startJ && midJ < endJ ){
        map[midG][midJ] = (( map[startG][startJ]+map[endG][endJ]+map[endG][startJ]+map[startG][endJ])/4);
        map[startG][midJ] = ((map[startG][startJ]+map[startG][endJ])/2);
        map[midG][startJ] = ((map[startG][startJ]+map[endG][startJ])/2); 
        map[midG][endJ] = ((map[startG][endJ]+map[endG][endJ])/2);
        map[endG][midJ] = ((map[endG][startJ]+map[endG][endJ])/2);
        interpolate2D(startG,midG,startJ,midJ,map);
        interpolate2D(midG,endG,startJ,midJ,map);
        interpolate2D(startG,midG,midJ,endJ,map);
        interpolate2D(midG,endG,midJ,endJ,map);
    } else if (  midJ > startJ && midJ < endJ){ 
        map[startG][midJ] = ((map[startG][startJ]+map[startG][endJ])/2);
        map[endG][midJ] = ((map[endG][startJ]+map[endG][endJ])/2);
        interpolate2D(startG,endG,startJ,midJ,map);
        interpolate2D(startG,endG,midJ,endJ,map);
    } else if ( midG > startG && midG < endG  ){
        map[midG][startJ] = ((map[startG][startJ]+map[endG][startJ])/2); 
        map[midG][endJ] = ((map[startG][endJ]+map[endG][endJ])/2);
        interpolate2D(startG,midG,startJ,endJ,map);
        interpolate2D(midG,endG,startJ,endJ,map);
    }
  
}

function genMap3Cut(){
    for (let i = 0 ; i < N ; i++ ){ 
        map3[i] = new Array(N);
        map4[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            map3[i][j]=0;
            map4[i][j]=0;
        }
    }
    let M = Math.floor(N*0.5);
  
    for (let i = 0 ; i < M ; i++ ){ 
        for (let j = 0 ; j < M ; j++ ){
            // round corners 
            // map3[M-i-1][M-j-1]= N/((M-i)*(M-j));
            // map3[M+i][M-j-1]= N/((M-i)*(M-j));
            // map3[M-i-1][M+j]= N/((M-i)*(M-j));
            // map3[M+i][M+j]= N/((M-i)*(M-j));
            // round center B 
            // map4[M-i-1][M-j-1]= N/((M-i)*(M-j)+1);
            // map4[M+i][M-j-1]= N/((M-i)*(M-j)+1);
            // map4[M-i-1][M+j]= N/((M-i)*(M-j)+1);
            // map4[M+i][M+j]= N/((M-i)*(M-j)+1);
            // round center A
            map3[M-i-1][M-j-1]= (M-i)/M*(M-j)/M;
            map3[M+i][M-j-1]= (M-i)/M*(M-j)/M;
            map3[M-i-1][M+j]= (M-i)/M*(M-j)/M;
            map3[M+i][M+j]= (M-i)/M*(M-j)/M;
            // Fun removal of rounded corners
            // map3[i][j]= (M-i)/M*(M-j)/M;
            // map3[N-1-i][j]= (M-i)/M*(M-j)/M;
            // map3[i][N-j-1]= (M-i)/M*(M-j)/M;
            // map3[N-i-1][N-j-1]= (M-i)/M*(M-j)/M;

            // starburst
            // map3[i][j]= M/(M-i)/(M-j);
            // map3[N-1-i][j]= M/(M-i)/(M-j);
            // map3[i][N-j-1]= M/(M-i)/(M-j);
            // map3[N-i-1][N-j-1]= M/(M-i)/(M-j);
        }
    }
    
    for (let i = 0 ; i < M ; i++ ){ 
        for (let j = 0 ; j < M ; j++ ){ 
            map4[M-i-1][M-j-1]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
            map4[M+i][M-j-1]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
            map4[M-i-1][M+j]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
            map4[M+i][M+j]= 1-Math.min((M-j)/M,(M-i)/M)*.4;
            // map4[M-i-1][M-j-1]= (M-i-j)/M;
            // map4[M+i][M-j-1]= (M-i-j)/N;
            // map4[M-i-1][M+j]= (M-i-j)/N;
            // map4[M+i][M+j]= (M-i-j)/N;
        }
    }
}

function cutMapBorder(){
    for (let i = 0 ; i < N ; i++ ){ 
        for (let j = 0 ; j < N ; j++ ){
            // if (map1[i][j]*map3[i][j] < cutMod ){
            //     map1[i][j]=0;
            // }
            // map1[i][j] = 2*map1[i][j];
            map1[i][j] *= ( 1 -  map4[i][j] );
           // map1[i][j] *= (map3[i][j] +cutMod);
            // map1[i][j] 
        }
    }
}

function genNoise(){
    for (let i = 0 ; i < N ; i++ ){
        map[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            map[i][j] = Math.round(Math.random()*50);
        }
    }
}


function average(){
    for (let i = 1 ; i < N-1 ; i+=1 ){
        for (let j = 1 ; j < N-1 ; j+=1 ){
            map[i][j] = Math.round((map[i][j]+map[i-1][j+1]+map[i-1][j-1]+map[i-1][j+1]+map[i-1][j-1] )/5);
        }
    }
}

function pass(size){
    var add_sub = 0;
    var toggle = false;
    for (let i = 0 ; i < N ; i++ ){ 
        let temp = add_sub;
        for (let j = 0 ; j < N ; j++ ){
            if (Math.random() <= 0.25) { toggle=!toggle; }
            if (add_sub >= size){toggle = true;}
            else if (add_sub <= -size){toggle = false;}
            map[j][i] += add_sub;
            if (toggle){add_sub--;} else {add_sub++;}
        }
        add_sub = temp;
        if (toggle){add_sub--;} else {add_sub++;}
    }
}



function genEmptyGrid(){
    for (let i = 0 ; i < N ; i++ ){
        map[i] = new Array(N);
        for (let j = 0 ; j < N ; j++ ){
            map[i][j] = 0;
        }
    }
}

function getHSL_L(l){
    let r = "hsl(200,75%," +(100*l)+ "%)";
    return r;
}
function getHSL(h,l){
    let r = "hsl("+(h*180+100)+","+(100-l*100)+"%," +(l*100)+ "%)";
    return r;
}

function drawAll(){
    ctx.clearRect(0,0,600,600);
    drawMap(map1);
    //drawMapMap(map1,map2);
    // for (let i = 0 ; i < N ; i++ ){
    //     for (let j = 0 ; j < N ; j++ ){
    //         ctx.fillStyle = getHSL(map1[i][j],map2[i][j]);
    //         ctx.fillRect(i*size,j*size,size,size);
   //     }
    // }
}

function genColours(high,rich){
    if ( high < 0.09 ){ return "hsl(200,80%,"+(high*50+rich*10+10)+"%)"; }
    if ( high < 0.11 ){ return "hsl(200,70%,"+(high*50+rich*15+10)+"%)"; }
    if ( high < 0.125 ){ return "hsl(200,"+(70-high*20)+"%,"+(high*50+rich*20+15)+"%)"; }
    if ( high < 0.13 ){ return "hsl(80,20%,70%)"; }
    if ( high < 0.14 ){ return "hsl("+(baseColour+rich*60)+",30%,60%)"; }
    if ( high < 0.2 ){ return "hsl("+(baseColour+rich*80)+","+(rich*60)+"%,"+(60-rich*20)+"%)"; }
    if ( high < 0.3 ){ return "hsl("+(baseColour+rich*100)+","+(rich*80)+"%,"+(60-rich*20)+"%)"; }
    if ( high < 0.5 ){ return "hsl("+(baseColour+rich*60)+","+(rich*70)+"%,"+(70-rich*20)+"%)"; }
    if ( high < 0.6 ){ return "hsl("+(baseColour+rich*50)+","+(rich*35)+"%,"+(high*95-rich*20)+"%)"; }
    if ( high < 0.8 ){ return "hsl("+(baseColour+rich*20)+","+(rich*50)+"%,"+(high*95)+"%)"; }
    else { return "hsl(0,10%,95%)"; } 
}


function drawMap(map){
    for (let i = 0 ; i < N ; i++ ){
        for (let j = 0 ; j < N ; j++ ){
            ctx.fillStyle = genColours(map[i][j],map2[i][j]);
            ctx.fillRect(i*size,j*size,size,size);
            
        }
    }
}
function drawMapMap(map1,map2){
    for (let i = 0 ; i < N ; i++ ){
        for (let j = 0 ; j < N ; j++ ){
            ctx.fillStyle = getHSL(map2[i][j],map1[i][j]);
            ctx.fillRect(i*size,j*size,size,size);
            
        }
    }
}
      

// function myNoise1D(){
//     let seed1D = new Array(N);
//     for (let i = 0 ; i < N ; i++ ){ seed1D[i] = Math.random(); }
//     map = [];
//     for (let i = 0 ; i < N ; i++ ){ 
//         map[i]=0;
//     } 
//     var scale = 32;
//     var jump = N;
//     var sum = 0;  
//     while ( scale >= .25 && jump >= 1 ){
//      //   console.log("Scale: " + scale + "    jump: " + jump);
//         for ( let j = 0 ; j < N ; j+=jump ){
//             if (j==0){ map[j]+= seed1D[j]*scale; }
//             if (j+jump >= N){
//                 let offset = Math.floor(j+jump-1);
//                 var blend = seed1D[offset]*scale;
//                 map[offset]+= seed1D[offset]*scale;
//                 // console.log(offset);
//                 // console.log(blend);
//                 interpolate(j,offset,scale);  
//             } else {
//                 let offset = Math.floor(j+jump);
//                 var blend = seed1D[offset]*scale;
//                 // console.log(offset);
//                 // console.log(blend);
//                 map[offset] += blend;
//                 interpolate(j,offset,scale);  
//             }
//             // console.log("-");
//         }
//         jump = Math.floor(jump/2);
//         sum+=scale;
//         scale/=2;
//   //      console.log(".");
//     }
//     for (let h = 0 ; h < N ; h++ ){
//         map[h] = map[h]/sum*100;
//     }

// }


// function interpolate(start,end,scale){
//     var mid = Math.floor((start + end)/2);
//     if ( mid > start && mid < end ){
//         map[mid] = ((map[start]+map[end])/2);
//         console.log("Start: "+map[start]+"   End: "+map[end]+ "    Mid: "+map[mid]);
//         interpolate(start,mid,scale);
//         interpolate(mid,end,scale);
//     }
// }
    // map = new World(100,3);
    // map.genWorld(); 
   // genSmooth();
   // average();
// 
// function perlin1D(count,seed,octaves,array){   
//     for ( let i = 0 ; i < count ; i++ ){
//         var noise = 0.0;
//         var scale = 1.0;
//         var scale_sum = 0.0;
//         for (let j = 0 ; j < octaves ; j++ ){
//             var pitch = count >> j;
//             var sample1 = (i/pitch)*pitch;
//             var sample2 = (sample1 + pitch)%count;
//             var blend = (i-sample1)/pitch;
//             var sample3 = (1.0-blend)*seed[sample1]+blend*seed[sample2];
//             noise += sample3 * scale;
//             scale_sum += scale;
//             scale/=2;
//         }
//         array[i] = noise/scale_sum;
//     }
// }
// function getHSL(h,s,l){
//     var str = "hsl("+h+","+s+"%,"+l+"%)";
//     return str;
// } 
// function genSmooth(){
// for (let i = 0 ; i < N ; i++ ){
//     for (let j = 0 ; j < N ; j++ ){
//         ctx.fillStyle = getHSL(map[i][j]);
//         ctx.fillRect(i*size,j*size,size,size);
//     }
// }
//     var row_seed;
//     var col_seed; 
//     for (let i = 0 ; i < N ; i++ ){
//         map[i] = new Array(N);
//         for (let j = 0 ; j < N ; j++ ){
//             if (j==0){ row_seed = Math.round(Math.random()*100);      
//             } else { row_seed = map[i][j-1]; }
//             if (i==0){ col_seed = Math.round(Math.random()*100);      
//             } else { col_seed = map[i-1][j]; }

//             map[i][j] = Math.round(( col_seed + row_seed + Math.random()*100 )/3);
//         }
//     }
// }

// function perlin(){
//     let seed1D = new Array(N);
//     for ( let i = 0 ; i < N ; i++ ){
//         seed1D[i] = Math.random();
//     }
//     let seed2D = [];
//     for ( let i = 0 ; i < N ; i++ ){
//         seed2D[i] = new Array(N);
//             for ( let j = 0 ; j < N ; j++ ){
//             seed2D[i][j] = Math.random();
//         }
//     }
//     var p_1D = [];
//     for ( let i = 0 ; i < N ; i++ ){
//         p_1D[i] = 0;
//     }
//     perlin1D(N,seed1D,7,p_1D);
//     map = p_1D

    
//     for ( let i = 0 ; i < N ; i++ ){
//         ctx.fillStyle = getHSL(p_1D[i]*100);

//         ctx.fillRect(i*size,0,size,size*10);

//     }
// }

// function perlin1D(count,seed,octaves,array){   
//     for ( let i = 0 ; i < count ; i++ ){
//         var noise = 0.0;
//         var scale = 1;
//         var scale_sum = 0.0;
//         for (let j = 0 ; j < octaves ; j++ ){
//             var pitch = count >> j;
//             var sample1 = (i/pitch)*pitch;
//             var sample2 = (sample1 + pitch)%count;
//             var blend = (i-sample1)/pitch;
//             var sample3 = (1.0-blend)*seed[sample1]+blend*seed[sample2];
//             if (isNaN(sample3)) {
//                 console.log("pitch: "+pitch+"  count: "+count+"   i=" + i+ "   j="+j);
//                 console.log("s1: "+sample1+"    s2: "+sample2+"  blend:  "+blend);
//                 console.log("");
//                            }
//             noise += sample3 * scale;
//             scale_sum += scale;
//             scale/=2;
//         }
//         array[i] += noise/scale_sum;


//     }
// }