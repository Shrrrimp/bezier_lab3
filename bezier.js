class Point {
    constructor(...coordinates) {
        coordinates.forEach(c => {
            for(let axis in c) {
                this[axis.toString()] = c[axis.toString()];
            }
        });
    }
}

class PointList {
    constructor() {
        this.pointList = [];
    }
}

const factorial = num => {
    return (num <= 1) ? 1 : num * factorial(num - 1);
}

class BeizierCoords {
    constructor(step = 0.1, ...points) {
        this.pointList = [];
        this.addPoint(...points);
        this.step = step;
        this.startPoint = this.pointList;
    }

    set step(step) {
        if (step<0 || step>1) step = 0.1;
        this._step = step;
    }

    set startPoint(pointList) {
        this._startPoint = {};
        for(let key in pointList[0]) {
            this._startPoint[key.toString()] = 0;
        }
    }

    get step() {return this._step;}
    get startPoint() {return this._startPoint;}

    getBezierBasis(i, t) {
        let n = this.pointList.length - 1;
        return factorial(n) / (factorial(i)*factorial(n-i))*Math.pow(t, i)*Math.pow(1-t, n-i);
    }

    getBezierCurve() {
        let res = [];
        let coeffB = 1;

        for (let t = 0; t <= 1; t+= this.step) {
            let newPoint = new Point(this.startPoint);

            for(let i = 0; i<this.pointList.length; ++i) {
                coeffB = this.getBezierBasis(i, t);
                for (let axis in this.pointList[i]) {
                    newPoint[axis.toString()] += this.pointList[i][axis.toString()] * coeffB;
                }
            }
            res.push(newPoint);
        }
        return res;
    }

    addPoint(...points) {
        points.forEach(point => {
            this.pointList.push(new Point(point));
        });
    }
}

class BezierCanvas {
    constructor(width, height, elem) {
        this.canvas = elem;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.color = 'blue';
        this.ctx.fillStyle = 'red';
        this.points = [];
    }

    getPoints() {
        return this.points;
    }

    drawCurve(curve, delay, pause) {
        if(!delay) delay = 3;
        if(!pause) pause = delay;
        let i = 0;

        let draw = () => {
            if(i >= curve.length - 1) return;
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.color;
            this.ctx.moveTo(curve[i].x, curve[i].y);
            this.ctx.lineTo(curve[i + 1].x, curve[i + 1].y);
            this.ctx.stroke();

            ++i;
            setTimeout(draw, delay);
        }

        setTimeout(draw, pause);
    }

    mouseDownHandler() {
        let bezier = null;
        let points = [];
        let buildBezier = () => {
            if (bezier === null) bezier = new BeizierCoords(0.01, { x: event.offsetX, y: event.offsetY });
            else bezier.addPoint({ x: event.offsetX, y: event.offsetY });

            this.points.push({ x: event.offsetX, y: event.offsetY });
            points.push({ x: event.offsetX, y: event.offsetY });
            this.drawCurve(bezier.getBezierCurve(), 10, 10, points.length);

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            points.forEach(point => {
                this.ctx.fillRect(point.x, point.y, 8, 8);
            });
        }
        this.canvas.addEventListener('mousedown', buildBezier);
    }
}

let element = document.querySelector('#canvas');

let canvas = new BezierCanvas(400, 400, element);
canvas.mouseDownHandler();
