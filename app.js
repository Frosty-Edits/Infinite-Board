class InfiniteBoard {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.elements = [];
        this.currentTool = 'rectangle';
        this.isDrawing = false;
        this.currentElement = null;
        this.pan = { x: 0, y: 0 };
        this.scale = 1;
        this.selectedElements = [];
        this.isDragging = false;
        this.isPanning = false;
        this.history = [];

        this.resize();
        this.setupListeners();
        
        this.render();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.render();
    }

    getMouse(e) {
        return {
            x: (e.clientX - this.pan.x) / this.scale,
            y: (e.clientY - this.pan.y) / this.scale
        };
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.scale, this.scale);
        this.elements.forEach(el => this.drawElement(el));
        if (this.currentElement) this.drawElement(this.currentElement);
        
        this.ctx.restore();
    }

    drawElement(el) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = el.stroke || '#1e1e1e';
        this.ctx.fillStyle = el.fill || 'transparent';
        this.ctx.lineWidth = el.width || 2;
        if (el.type === 'rectangle') {
            this.ctx.strokeRect(el.x, el.y, el.w, el.h);
            if (!el.isHollow) this.ctx.fillRect(el.x, el.y, el.w, el.h);
        }
        else if (el.type === 'pen') {
            el.points.forEach((point, index) => {
                if (index === 0) this.ctx.moveTo(point.x, point.y);
                else this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.stroke();
        }
        else if (el.type === 'ellipse') {
            this.ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2,
                Math.abs(el.w / 2), Math.abs(el.h / 2), 0, 0, Math.PI * 2);
            this.ctx.stroke();
            if (!el.isHollow) this.ctx.fill();
        } else if (el.type === 'arrow') {
            const x2 = el.x + el.w;
            const y2 = el.y + el.h;
            const angle = Math.atan2(y2 - el.y, x2 - el.x);
            this.ctx.moveTo(el.x, el.y);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x2 - 15 * Math.cos(angle - Math.PI / 6),
                y2 - 15 * Math.sin(angle - Math.PI / 6));
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - 15 * Math.cos(angle + Math.PI / 6),
                y2 - 15 * Math.sin(angle + Math.PI / 6));
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
    }
    createElement(pos) {
        return {
            type: this.currentTool,
            x: pos.x,
            y: pos.y,
            w: 0,
            h: 0,
            stroke: document.getElementById('strokeColor')?.value || '#1e1e1e',
            fill: document.getElementById('fillColor')?.value || '#ffffff',
            width: parseInt(document.getElementById('strokeWidth')?.value || 2),
            style: document.getElementById('strokeStyle')?.value || 'solid',
            opacity: parseFloat(document.getElementById('opacity')?.value || 1),
            isHollow: document.getElementById('toggleFill')?.dataset.hollow !== 'false',
            points: this.currentTool === 'pen' ? [pos] : []
        };
    }

    setupListeners() {
        window.onresize = () => this.resize();

        document.querySelectorAll('.tool').forEach(button => {
            button.onclick = () => {
                document.querySelectorAll('.tool').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                this.currentTool = button.dataset.tool;
            };
        });

        this.canvas.onmousedown = (e) => {
            const pos = this.getMouse(e);
            this.startPos = pos;
            
            if (this.currentTool === 'text') {
                const text = prompt('Text:');
                if (text) {
                    const el = this.createElement(pos);
                    el.text = text;
                    this.elements.push(el);
                    
                    this.render();
                }
                return;
            }
            this.isDrawing = true;
            this.currentElement = this.createElement(pos);
        };

        window.onmousemove = (e) => {
            const pos = this.getMouse(e);
            
            if (this.isDragging) {
                const dx = pos.x - this.startPos.x;
                const dy = pos.y - this.startPos.y;
                this.selectedElements.forEach(el => {
                    el.x += dx;
                    el.y += dy;
                    if (el.points) el.points.forEach(point => {
                        point.x += dx;
                        point.y += dy;
                    });
                });
                this.startPos = pos;
                this.render();
            } else if (this.isDrawing && this.currentElement) {
                if (this.currentElement.type === 'pen') this.currentElement.points.push(pos);
                else {
                    this.currentElement.w = pos.x - this.currentElement.x;
                    this.currentElement.h = pos.y - this.currentElement.y;
                }
                this.render();
            }
        };

        window.onmouseup = () => {
            if (this.isDrawing && this.currentElement) {
                this.elements.push(this.currentElement);
                
            }
            if (this.isDragging) 
            this.isDrawing = false;
            this.isDragging = false;
            this.isPanning = false;
            this.currentElement = null;
            this.render();
        };

        
        
        
        
        
        
    }



}

new InfiniteBoard();
