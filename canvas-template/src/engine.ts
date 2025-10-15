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

import { Circle } from './shapes.ts';
import { Rectangle } from './shapes.ts';
import { updateEntity } from './physics.ts';
import { drawEntity } from './graphics.ts';

const context = canvas.getContext('2d');
if (!context) throw Error('Could not create canvas context!');

import { Entity } from './entity';

// This is the master list of all entities in the game
export const allEntities: Entity[] = [];

let previousUpdateTime = performance.now();
function updateEngine() {
    // get the current time in milliseconds
    let now = performance.now();

    // calculate the number of seconds that have passed since last update
    let deltaT = (now - previousUpdateTime) / 1000;

    // TODO: physics update loop
    for (let i = 0; i < allEntities.length; i++) {
        updateEntity(allEntities[i], deltaT);
    }

    // clear the existing contents of the canvas
    context.clearRect(0, 0, canvasSize.w, canvasSize.h);

    // TODO: draw all the Entities
    for (let i = 0; i<allEntities.length; i++){
        drawEntity(allEntities[i], context)
    }
    // store the current time for the next loop
    previousUpdateTime = now;

    requestAnimationFrame(updateEngine);
}

//setInterval(updateEngine, 1000 / 60);
requestAnimationFrame(updateEngine);
