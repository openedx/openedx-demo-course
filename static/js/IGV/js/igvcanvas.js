// canvas extensions to ease porting of igv code


CanvasRenderingContext2D.prototype.drawLine = function (x1, y1, x2, y2, lineWidth) {

    this.beginPath();
    var lw = this.lineWidth;
    if (lineWidth) {
        this.lineWidth = lineWidth;
    }
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.lineWidth = lw;
}


CanvasRenderingContext2D.prototype.drawArrowhead = function (x, y, lineWidth, size) {

    var lw = this.lineWidth;

    if (lineWidth) {
        this.lineWidth = lineWidth;
    }
    if (!size) {
        size = 5;
    }
    this.beginPath();
    this.moveTo(x, y - size / 2);
    this.lineTo(x, y + size / 2);
    this.lineTo(x + size, y);
    this.lineTo(x, y - size / 2);
    this.closePath();
    this.fill();

    this.lineWidth = lw;
}


CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    if (stroke) {
        this.stroke();
    }
    if (fill) {
        this.fill();
    }
}

CanvasRenderingContext2D.prototype.polygon = function (x, y, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }

    this.beginPath();
    var len = x.length;
    this.moveTo(x[0], y[0]);
    for (var i = 1; i < len; i++) {
        this.lineTo(x[i], y[i]);
        // ctx.moveTo(x[i], y[i]);
    }

    this.closePath();
    if (stroke) {
        this.stroke();
    }
    if (fill) {
        this.fill();
    }
}

if(!String.prototype.startsWith) {
    String.prototype.startsWith = function(aString) {
        if(this.length < aString.length) {
            return false;
        }
        else {
            return (this.substr(0, aString.length) == aString);
        }
    }
}

if(!String.prototype.endsWith) {
    String.prototype.endsWith = function(aString) {
        if(this.length < aString.length) {
            return false;
        }
        else {
            return (this.substr(this.length - aString.length, aString.length) == aString);
        }
    }
}


function Button(x, y, size, label) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.label = label;
    this.state = 0;

}

Button.prototype.containsPoint = function(mouseX, mouseY) {
    return (mouseX >= this.x && mouseX <= this.x + this.size &&
        mouseY >= this.y && mouseY <= this.y + this.size);
}

Button.prototype.toggleState = function() {
    this.state = (this.state == 0 ? 1 : 0);
}


// crude number formatting function, smallish integers only
function formatNumber(number) {

    if(number < 1000) {
        return number;
    }
    if(number < 100000) {
        var t2 = Math.floor(number / 1000);
        var t1 = (number - t2 * 1000).toString();

        while(t1.length < 3) {
            t1 = '0' + t1;
        }

        return t2 + "," + t1;
    }

    return number;

}

