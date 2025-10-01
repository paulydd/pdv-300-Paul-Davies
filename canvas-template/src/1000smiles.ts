

const canvasSize = { w: 1000, h: 1000 };
console.log('Canvas size:', canvasSize.w, 'by', canvasSize.h);

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.style.width = canvasSize.w + 'px';
canvas.style.height = canvasSize.h + 'px';
canvas.width = canvasSize.w;
canvas.height = canvasSize.h;
class SmileyFace {
    x: number;
    y: number;
    radius: number;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const { x, y, radius } = this;

        // Face circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.lineWidth = radius * 0.055;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // Eyes
        const eyeRadius = radius * 0.15;
        const eyeOffsetX = radius * 0.4;
        const eyeOffsetY = radius * 0.3;

        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y - eyeOffsetY, eyeRadius, 0, Math.PI * 2); // Left eye
        ctx.fillStyle = 'black';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + eyeOffsetX, y - eyeOffsetY, eyeRadius, 0, Math.PI * 2); // Right eye
        ctx.fill();

        // Smile
        ctx.beginPath();
        ctx.arc(x, y + radius * 0.1, radius * 0.6, 0, Math.PI);
        ctx.stroke();
    }
}

// ### GENERATE 1000 RANDOM SMILEYS ###
const smileys: SmileyFace[] = [];

for (let i = 0; i < 1000; i++) {
    const radius = Math.random() * 20 + 10; // radius between 10 and 30
    const x = Math.random() * (canvasSize.w - radius * 2) + radius;
    const y = Math.random() * (canvasSize.h - radius * 2) + radius;
    smileys.push(new SmileyFace(x, y, radius));
}

// ### DRAW THEM ALL ###
for (const smiley of smileys) {
    smiley.draw(context);
}