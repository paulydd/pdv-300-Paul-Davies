import { allEntities } from './engine';
import { Entity, Vec2 } from './entity';
import { DrawableShape } from './graphics';
import { PhysicalBody } from './physics';
import { Circle } from './shapes';
// create an Entity at (10, 10)
let aMovingEntity = new Entity(new Vec2(10, 10));
// add a Drawable to the Entity
let aDrawable = new DrawableShape(new Circle(40));
aDrawable.fillColor = 'maroon';
aMovingEntity.drawable = aDrawable;
// add a PhysicalBody to the Entity
let aBody = new PhysicalBody();
aBody.velocity = new Vec2(20, 20);
aMovingEntity.body = aBody;
// add the Entity to the array of Entities!
allEntities.push(aMovingEntity)




/*
import { draw, DrawableCircle, DrawableShape } from './graphics';
console.log('Hello, Paulyd!');
import { Circle } from './shapes';
import {Rectangle} from './shapes';
import {Entity} from './entity';
import {Vec2} from './entity';
import { drawEntity } from './graphics';

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
const context = canvas.getContext('2d');
        if (!context) throw Error('Could not create canvas context!');
        
    
/*const myPath = new Path2D();
myPath.rect(0, 0, 1000, 1000);
context.fillStyle = 'blue'; // set the fill color
context.fill(myPath); // do the actual filling

// get a reference to the context, where we do our drawing
function thousandsmiles() {
    for (let i = 0; i<1000;i++){
        const context = canvas.getContext('2d');
        if (!context) throw Error('Could not create canvas context!');
        
        let Xcenter = Math.ceil(Math.random() * 1000)
        let Ycenter = Math.ceil(Math.random() * 1000)
        let radius = Math.ceil(Math.random() * 90 + 20)

        const face = new Path2D();
        face.arc(Xcenter, Ycenter, radius, 0, Math.PI * 2);
        context.strokeStyle = 'black';
        context.lineWidth = 11;
        context.stroke(face);
        context.fillStyle = 'yellow'; // set the fill color
        context.fill(face); 
        
        const eye = new Path2D();
       eye.arc(Xcenter - (radius * 0.4), Ycenter - (radius * 0.38), radius * (30 / 200), 0, Math.PI * 2);
        context.strokeStyle = 'black';
        context.lineWidth = 11;
        context.stroke(eye);
        context.fillStyle = 'black'; // set the fill color
        context.fill(eye); 
        
        
        
        const wink = new Path2D();
        wink.rect(Xcenter + (radius * 0.3), Ycenter - (radius * 0.38), radius * (70 / 200), radius * (15 / 200));
        context.fillStyle = 'black'; // set the fill color
        context.fill(wink); // do the actual filling
        
        const smile = new Path2D();
        smile.arc(Xcenter, Ycenter + (0.1 * radius), radius * (150 / 200), 0, Math.PI);
        context.strokeStyle = 'black';
        context.lineWidth = 3.5;
        context.stroke(smile);
        context.fillStyle = 'black'; // set the fill color
    
    

}
}
const drawableCircle = new DrawableShape(new Circle(90));
drawableCircle.fillColor = 'magenta';
draw(drawableCircle, context, 300, 300);

const drawableRectangle = new DrawableShape(new Rectangle(120, 80));
drawableRectangle.fillColor = 'cyan';
draw(drawableRectangle, context, 100, 300);
//thousandsmiles()

let myFirstEntity = new Entity(new Vec2(400, 250));
let aDrawableCircle = new DrawableShape(new Circle(90));
aDrawableCircle.fillColor = 'chartreuse';
myFirstEntity.drawable = aDrawableCircle;

drawEntity(myFirstEntity, context);


*/