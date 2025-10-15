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
    export interface Shape {
        path(): Path2D;
    }
    
    export class Rectangle implements Shape {
        width: number;
        height: number;
    
        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
        }
    
        path(): Path2D {
            const thePath = new Path2D();
            thePath.rect(0, 0, this.width, this.height);
            return thePath;
        }
    }
    
    let bob = new Rectangle(10,20)