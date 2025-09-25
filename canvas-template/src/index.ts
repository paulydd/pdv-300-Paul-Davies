console.log('Hello, Paulyd!');

// ### SETUP ###

// define our "screen" size in "pixels"
const canvasSize = {
    w: 1000,
    h: 1000
};
console.log('Canvas size:', canvasSize.w, 'by', canvasSize.h);

// get a reference to the canvas itself
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

// this sets the size of the canvas on the screen in CSS pixels
canvas.style.width = canvasSize.w + 'px';
canvas.style.height = canvasSize.h + 'px';

// this sets the number of pixels WITHIN the canvas (resolution)
canvas.width = canvasSize.w;
canvas.height = canvasSize.h;

// get a reference to the context, where we do our drawing
const context = canvas.getContext('2d');
if (!context) throw Error('Could not create canvas context!');

// ### YOUR DRAWING CODE GOES HERE ###

const myPath = new Path2D();
myPath.rect(0, 0, 350, 400);
context.fillStyle = 'blue'; // set the fill color
context.fill(myPath); // do the actual filling

const myCircle = new Path2D();
myCircle.arc(425, 440, 30, 0, Math.PI * 2);
context.strokeStyle = 'black';
context.lineWidth = 11;
context.stroke(myCircle);
context.fillStyle = 'black'; // set the fill color
context.fill(myCircle); 


const myRect = new Path2D();
myPath.rect(535, 440, 70, 15);
context.fillStyle = 'black'; // set the fill color
context.fill(myPath); // do the actual filling

const mySmile = new Path2D();
myCircle.arc(0, 0, 150, 0, Math.PI * 0.1);
context.strokeStyle = 'black';
context.lineWidth = 11;
context.stroke(mySmile);
context.fillStyle = 'black'; // set the fill color
context.fill(mySmile); 