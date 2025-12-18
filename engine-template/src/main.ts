
import type { Collision } from './engine/collisions';
import { Body, Circle, Polygon, Engine, Entity, Rectangle, Vec2, DrawableShape, Sprite, Interaction } from './engine/engine';
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
engine.world.gravity = new Vec2(0, 1000);

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

let sfcmLogoEntity1 = new Entity('block');
sfcmLogoEntity1.position = new Vec2(W / 2 + 199, H / 2 - 200);
const radius = 40;
let sfcmLogoBody1 = new Body(new Circle(radius));
sfcmLogoBody1.velocity = new Vec2(-100, 60);
sfcmLogoEntity1.body = sfcmLogoBody1;
let sfcmLogoSprite1 = new Sprite('./sfcm.png', new Vec2(2 * radius, 2 * radius));
sfcmLogoEntity1.drawable = sfcmLogoSprite1;
engine.addEntity(sfcmLogoEntity1);

let sfcmLogoEntity2 = new Entity('block');
sfcmLogoEntity2.position = new Vec2(W / 2 - 199, H / 2 - 200);
let sfcmLogoBody2 = new Body(new Circle(radius));
sfcmLogoBody2.velocity = new Vec2(100, 60);
sfcmLogoEntity2.body = sfcmLogoBody2;
let sfcmLogoSprite2 = new Sprite('./sfcm.png', new Vec2(2 * radius, 2 * radius));
sfcmLogoEntity2.drawable = sfcmLogoSprite2;
engine.addEntity(sfcmLogoEntity2);

let rectEntity = new Entity('block');
rectEntity.position = new Vec2(W / 2 - 200, H / 2 - 60);
let rectBody = new Body(new Rectangle(150, 150));
rectBody.velocity = new Vec2(100, 0);
rectEntity.body = rectBody;
let rectDrawable = new DrawableShape(rectBody.shape);
rectDrawable.fillColor = 'maroon';
rectEntity.drawable = rectDrawable;
engine.addEntity(rectEntity);

let polygonEntity = new Entity('block');
polygonEntity.position = new Vec2(W / 2 + 200, H / 2 + 60);
let polyBody = new Body(new Polygon([new Vec2(-60, -40), new Vec2(-15, -75), new Vec2(28, -45), new Vec2(45, 0), new Vec2(30, 30), new Vec2(0, 45), new Vec2(-40, 20),]));
polyBody.velocity = new Vec2(-100, 0);
polygonEntity.body = polyBody;
let polyDrawable = new DrawableShape(polyBody.shape);
polyDrawable.fillColor = 'maroon';
polygonEntity.drawable = polyDrawable;
engine.addEntity(polygonEntity);

// Make an interaction that adds more Entities to the scene
let mainInteraction = new Interaction(new Rectangle(W, H)); // the interaction's hitbox is the whole canvas
// each time we recieve a mouse down, we add a new Entity:
mainInteraction.onMouseDown = function (clickLocation: Vec2) {
  let newEntity = new Entity('block');
  newEntity.position = clickLocation;
  newEntity.transform.rotation = Math.random() * Math.PI;
  let newDrawable = new DrawableShape(new Rectangle(50, 120));
  newDrawable.fillColor = 'lightblue';
  newEntity.drawable = newDrawable;
  let newBody = new Body(newDrawable.shape);
  newEntity.body = newBody;
  engine.addEntity(newEntity);
};

// put the interaction on an Entity and add it to the engine
let mainInteractionEntity = new Entity('interaction');
mainInteractionEntity.position = new Vec2(W / 2, H / 2);
mainInteractionEntity.interaction = mainInteraction;
engine.addEntity(mainInteractionEntity);

// ##### YOUR CODE GOES BELOW THIS LINE ######

// TODO: Create the canon Entity as described in the assignment

let cannon = new Entity('cannon')
cannon.position = new Vec2(50, H-50);
let cannonDrawable = new Sprite('/canon.png', new Vec2(100,100) )
cannon.drawable = cannonDrawable
engine.addEntity(cannon)


mainInteraction.onKeyDown = function (key: string) {
  console.log('onKeyDown: "' + key + '"');
if(key==='ArrowUp')
cannon.transform.rotation -= Math.PI / 24
if(key==='ArrowDown')
cannon.transform.rotation += Math.PI / 24


  // TODO: Add keyboard interactions as described in the assignment
};

// TODO: write the makeProjectile function as described!
function MakeProjectile() {
  let projectile = new Entity('projectile');
  projectile.position = new Vec2(50, H-50);
}







engine.onCollision = function (collision: Collision) {
  // TODO: if the Collision contains one projectile and one block, remove them both from the engine
  return true;
};
