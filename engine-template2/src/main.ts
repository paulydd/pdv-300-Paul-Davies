import type { Collision } from './engine/collisions';
import { Body, Circle, Polygon, Engine, Entity, Rectangle, Vec2, DrawableShape, Sprite, Interaction } from './engine/engine';
import { isZero } from './engine/geometry';
import { HUDConsole } from './util/HUDConsole';

// ####### CANVAS SETUP #######

// create the Engine and set up the canvas
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas);
const pixelScale = 2; // a higher pixel scale for hi-res screen
const width = 1920 / 2;
const height = 1080 / 2;
engine.resize(width, height, pixelScale);


// this line starts the engine
engine.isRunning = true;

// set up the pause button 
document.getElementById('pauseGame')?.addEventListener('click', () => {
  engine.isRunning = !engine.isRunning;
});

// update the fps label twice a second
const fpsLabel = document.getElementById('fpsLabel') as HTMLParagraphElement;
setInterval(() => {
  fpsLabel.innerHTML = `fps: ${engine.fps.toFixed(1)}`;
}, 1000 / 2);

// overal dimensions of canvas, for convenience
const W = engine.size.width;
const H = engine.size.height;

// ####### GAME SETUP #######

// set the world gravity to the downward direction
engine.world.gravity = new Vec2(0, 0);
engine.gameUpdate=function(){
  for (let entity of engine.entities){
    if (entity.name.startsWith('ball') && entity.body){
      // apply some friction to the ball
      const FRICTION_COEFFICIENT = 0.003; // adjust as needed
      let frictionForce = entity.body.velocity.scaled(FRICTION_COEFFICIENT);
      entity.body.velocity = entity.body.velocity.minus(frictionForce);
      // entity.body.F = entity.body.F.plus(frictionForce);

      // Stop the ball if its speed is very low
      if (entity.body.velocity.mag < 25) {
        entity.body.velocity = Vec2.zero;
      }
    }
  }
  // any per-frame game logic would go here
}

// create four walls around the sides
const wallThickness = 100;

let topWall = new Entity('wall');
topWall.position = new Vec2(W / 2, -wallThickness / 2);
let topWallBody = new Body(new Rectangle(W, wallThickness));
topWallBody.isFixed = true;
topWall.body = topWallBody;
engine.addEntity(topWall);

let bottomWall = new Entity('wall');
bottomWall.position = new Vec2(W / 2, H + wallThickness / 2);
let bottomWallBody = new Body(new Rectangle(W, wallThickness));
bottomWallBody.isFixed = true;
bottomWall.body = bottomWallBody;
engine.addEntity(bottomWall);

let leftWall = new Entity('wall');
leftWall.position = new Vec2(-wallThickness / 2, H / 2);
let leftWallBody = new Body(new Rectangle(wallThickness, H));
leftWallBody.isFixed = true;
leftWall.body = leftWallBody;
engine.addEntity(leftWall);

let rightWall = new Entity('wall');
rightWall.position = new Vec2(W + wallThickness / 2, H / 2);
let rightWallBody = new Body(new Rectangle(wallThickness, H));
rightWallBody.isFixed = true;
rightWall.body = rightWallBody;
engine.addEntity(rightWall);

// Add four entities to bounce around:




// Make an interaction that adds more Entities to the scene
let mainInteraction = new Interaction(new Rectangle(W, H)); // the interaction's hitbox is the whole canvas


// put the interaction on an Entity and add it to the engine
let mainInteractionEntity = new Entity('interaction');
mainInteractionEntity.position = new Vec2(W / 2, H / 2);
mainInteractionEntity.interaction = mainInteraction;
engine.addEntity(mainInteractionEntity);

// ##### YOUR CODE GOES BELOW THIS LINE ######

// TODO: Create the canon Entity as described in the assignment

mainInteraction.onKeyDown = function (key: string) {
  console.log('onKeyDown: "' + key + '"');
  // TODO: Add keyboard interactions as described in the assignment
};

mainInteraction.onMouseDown = function (loc: Vec2) {
// caluculate the direction from the cue ball to the mouse location
// find the distance from cue ball position, to mouse location (loc)
// set the velocity of the cue ball to that direction
}

// ===== POOL BALL SETUP ===== //

const BALL_RADIUS = 15;
const RACK_START_X = W / 2 + 100;   // shift to the right
const RACK_START_Y = H / 2;         // center vertically
const ROW_SPACING = BALL_RADIUS * Math.sqrt(3); // vertical offset between rows
const COL_SPACING = BALL_RADIUS * 2;            // horizontal offset

// Standard 8-ball ordering
const BALL_COLORS = {
    1: 'yellow', 2: 'blue', 3: 'red', 4: 'purple', 5: 'orange', 6: 'green', 7: 'maroon',
    8: 'black',
    9: 'yellow', 10: 'blue', 11: 'red', 12: 'purple', 13: 'orange', 14: 'green', 15: 'maroon'
};





// Triangle rack layout
const RACK_LAYOUT = [
    [1],
    [2, 3],
    [4, 8, 5],
    [6, 9, 10, 7],
    [11, 12, 13, 14, 15]
];




function createBall(num, x, y, color) {
    let ballEntity = new Entity('ball' + num);
    ballEntity.position = new Vec2(x, y);

    let body = new Body(new Circle(BALL_RADIUS));
    body.velocity = new Vec2(0, 0);
    ballEntity.body = body;

    let drawable = new DrawableShape(body.shape);
    drawable.fillColor = color;
    ballEntity.drawable = drawable;


    engine.addEntity(ballEntity);
    return ballEntity;
}



// Create racked balls
for (let row = 0; row < RACK_LAYOUT.length; row++) {
    const ballsInRow = RACK_LAYOUT[row];
    const rowY = RACK_START_Y + row * ROW_SPACING;

    // center the row
    const totalWidth = (ballsInRow.length - 1) * COL_SPACING;
    const rowStartX = RACK_START_X - totalWidth / 2;

    for (let i = 0; i < ballsInRow.length; i++) {
        const ballNum = ballsInRow[i];
        const x = rowStartX + i * COL_SPACING;
        const y = rowY;

        createBall(ballNum, x, y, BALL_COLORS[ballNum]);
    }
}

// Create white cue ball with black border

let cueX = W / 2 - 200;  
let cueY = H / 2;

let cueBall = createBall(0, cueX, cueY, 'tan');
let cueBallInteraction = new Interaction(new Circle(BALL_RADIUS));
cueBall.interaction = cueBallInteraction;
cueBallInteraction.onMouseDown = 

// TODO: write the makeProjectile function as described!
function (loc: Vec2) {
  // caluculate the direction from the cue ball to the mouse location
  const direction = loc.minus(cueBall.position).normalized;
  const speed = 600; // adjust speed as needed
  cueBall.body!.velocity = direction.scaled(speed);
};
engine.onCollision = function (collision: Collision) {
  // TODO: if the Collision contains one projectile and one block, remove them both from the engine
  return true;
};

function createPocket(x: number, y: number, radius: number) {
  let pocket = new Entity('pocket');
  pocket.position = new Vec2(x, y);
  let pocketBody = new Body(new Circle(radius));
  pocketBody.isFixed = true;
  pocket.body = pocketBody;
  engine.addEntity(pocket);
}

const POCKET_RADIUS = 30;
createPocket(0, 0, POCKET_RADIUS); // top-left
createPocket(W / 2, 0, POCKET_RADIUS); // top-center
createPocket(W, 0, POCKET_RADIUS); // top-right
createPocket(0, H, POCKET_RADIUS); // bottom-left
createPocket(W / 2, H, POCKET_RADIUS); // bottom-center
createPocket(W, H, POCKET_RADIUS); // bottom-right

engine.onCollision = function (collision: Collision) {
  let entities = [collision.entityA, collision.entityB];
  let pocket = entities.find(e => e.name === 'pocket');
  let ball = entities.find(e => e.name.startsWith('ball'));

  if (pocket && ball) {
    engine.removeEntity(ball);
  }
  return true;
};




function createVisualPocket(x: number, y: number, radius: number) {
  let pocketEntity = new Entity('pocketVisual');
  pocketEntity.position = new Vec2(x, y);
  let drawable = new DrawableShape(new Circle(radius));
  drawable.fillColor = 'black';
  pocketEntity.drawable = drawable;
  engine.addEntity(pocketEntity);
}
// Create visual pockets
createVisualPocket(0, 0, POCKET_RADIUS); // top-left
createVisualPocket(W / 2, 0, POCKET_RADIUS); // top-center
createVisualPocket(W, 0, POCKET_RADIUS); // top-right
createVisualPocket(0, H, POCKET_RADIUS); // bottom-left
createVisualPocket(W / 2, H, POCKET_RADIUS); // bottom-center
createVisualPocket(W, H, POCKET_RADIUS); // bottom-right


engine.onCollision = function (collision: Collision) {
  let entities = [collision.entityA, collision.entityB];
  let pocket = entities.find(e => e.name === 'pocket');
  let ball = entities.find(e => e.name.startsWith('ball'));

  if (pocket && ball) {
    engine.removeEntity(ball);
  } else {
    
    for (let entity of entities) {
      if (entity.body && entity.name.startsWith('ball')) {
        entity.body.velocity = entity.body.velocity.scaled(0.3);
      }
    }
  }
  return true;
};

 
let hudConsole = new HUDConsole(engine);
hudConsole.log("Welcome to Pool Game! Use mouse to aim and shoot the cue ball.");
hudConsole.log("Pocket all the balls to win!");
engine.onCollision = function (collision: Collision) {
  let entities = [collision.entityA, collision.entityB];
  let pocket = entities.find(e => e.name === 'pocket');
  let ball = entities.find(e => e.name.startsWith('ball'));
  let cueBall = entities.find(e => e.name === 'ball0');

  if (pocket && ball) {
    engine.removeEntity(ball);
    if (ball === cueBall) {
      hudConsole.log("Scratch! The cue ball was pocketed.");
    }
  }
  return true;
};


engine.onCollision = function (collision: Collision) {
  let entities = [collision.entityA, collision.entityB];
  let pocket = entities.find(e => e.name === 'pocket');
  let ball = entities.find(e => e.name.startsWith('ball'));
  let cueBall = entities.find(e => e.name === 'ball0');
  let blackBall = entities.find(e => e.name === 'ball8');

  if (pocket && ball) {
    engine.removeEntity(ball);
    if (ball === cueBall) {
      hudConsole.log("Scratch! The cue ball was pocketed. Resetting game...");
      setTimeout(() => {
        location.reload(); // simple way to reset the game
      }, 2000);
    } else if (ball === blackBall) {
      hudConsole.log("Black ball pocketed! Resetting game...");
      setTimeout(() => {
        location.reload(); // simple way to reset the game
      }, 2000);
    }
  }
  return true;
};