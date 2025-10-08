export interface Shape {
    path(): Path2D;
    }
    export class Circle implements Shape {
        radius: number;
        constructor(radius: number) {
            
        this.radius = radius;
        }
        path(): Path2D {
            const thePath = new Path2D();
            thePath.arc(0, 0, this.radius, 0, Math.PI * 2);
            return thePath;
        }
    }