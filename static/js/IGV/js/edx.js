/**
 SRGN
 chr10    +    70847827    70864567    70847913    70863876
 3
 70847827    70847992    0
 70856839    70856987    1
 70863626    70864567    2
 #Sequence
 70846048
 */


var geneCanvasContext;
var seqCanvasContext;
var canvasWidth = 800;
var leftMargin = 50;
var geneCanvasHeight = 110;
var seqCanvasHeight = 370;
var buttonCanvasHeight = 50;

var tracksY = 350;
var trackHeight = 20;

var buttonCanvas;
var buttonCanvasContext;
var highlightExonSequenceButton;
var showRulerButton;

var expandedGeneCenter = 90;
var sequencyY = 134;
var aaHeight = 22;

var utrHeight = 14;
var cdHeight = 14;
var geneCenter = geneCanvasHeight - cdHeight / 2;
var exonGap = 7;
var ideogramTop = 20;
var ideogramHeight = 15;


var nucAColor = "rgb(0,150,0)";
var nucCColor = "blue";
var nucTColor = "red";
var nucGColor = "rgb(209, 113, 5)";
var colorBlue = "blue";
var colorBlack = "black";
var cdsColor = "rgb(0, 0, 150)";
var utrColor = "rgb(200, 200, 200)";
var grey1 = "rgb(150, 150, 150)";
var grey2 = "rgb(190, 190, 190)";
var aaFontColor = "white";
var stopCodonColor = "rgb(255, 0, 0)";
var methioneColor = "rgb(0, 200, 0)";
var aaColor1 = "rgb(92, 92, 164)";
var aaColor2 = "rgb(12, 12, 120)";


// Mouse state
var isMouseDown = false;
var lastMouseX;

var seqScale = 14;
var geneScale;


var startPosition; // The leftmost sequence position
var originP;       // The current left-most pixel that is "in view".

var gene;
var tracks;

var chromosome;
var ideogramGeneStart;
var ideogramGeneWidth;

var cytobands;
var stainColors = new Array();

var codonTable;

var tileSize = 1000;
var tileCache = new Array();
var seqMarginImage;


function Exon(start, end, frameShift) {
    this.start = start;
    this.end = end;
    this.frameShift = frameShift;
}


function Gene(name, strand, start, end, cdStart, cdEnd, exons) {
    this.label = name;
    this.strand = strand;
    this.start = start;
    this.end = end;
    this.cdStart = cdStart;
    this.cdEnd = cdEnd;
    this.exons = exons;
}

function Cytoband(start, end, name, typestain) {
    this.start = start;
    this.end = end;
    this.label = name;
    this.stain = 0;

    // Set the type, either p, n, or c
    if (typestain == 'acen') {
        this.type = 'c';
    } else {
        this.type = typestain.charAt(1);
        if (this.type == 'p') {
            this.stain = parseInt(typestain.substring(4));
        }
    }
}


function Track(name, type) {
    this.name = name;
    this.type = type;
    this.data = new Array();
}

Track.prototype.autoScale = function () {

    var min = 0;
    var max = 0;
    for (var i = 0; i < this.data.length; i++) {
        var v = this.data[i].value;
        min = v < min ? v : min;
        max = v > max ? v : max;
    }
    this.min = min;
    this.max = max;

}

function WigValue(start, end, value) {
    this.start = start;
    this.end = end;
    this.value = value;
}


if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    }
}


/**
 * Load the problem set and related resources.  This involves a series of chained loads,  starting with the
 * gene definition file.
 */
function loadResources(geneFile) {
    loadGene(geneFile);
}


function geneMouseDown(mouseX) {
    if (mouseX >= leftMargin) {
        var px = mouseX;
        // Find x position clicked
        var firstExon = gene.exons[0];
        var lastExon = gene.exons[gene.exons.length - 1];
        if (px < firstExon.seqStartPG) {
            // Left of everything
            originP = 0;
        }
        else if (px > lastExon.seqEndPG) {
            // Right of everything
            originP = lastExon.seqEndP - canvasWidth;
        }
        else {
            for (var i = 0; i < gene.exons.length; i++) {
                var exon = gene.exons[i];
                if (px >= exon.seqStartPG && px <= exon.seqEndPG) {
                    var r = (px - exon.seqStartPG) / (exon.seqEndPG - exon.seqStartPG);
                    originP = Math.round(exon.seqStartP + r * (exon.seqEndP - exon.seqStartP)) - canvasWidth / 2;
                    break;
                }
                else if (i < (gene.exons.length - 1) && gene.exons[i + 1].seqStartPG > px) {
                    // Between exons
                    var nextExon = gene.exons[i + 1];
                    originP = Math.round((nextExon.seqStartP + exon.seqEndP) / 2 - canvasWidth / 2);
                    break;
                }
            }

        }

        redrawSeqCanvas();
    }
}

/**
 * Creates canvas elements, loads data, adds events, and draws the canvas for the first time.
 */
function prepareCanvas(geneFile) {
    // Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)

    var canvasDiv = document.getElementById('canvasDiv');
    var geneCanvas = document.createElement('canvas');
    geneCanvas.setAttribute('left', 0);
    geneCanvas.setAttribute('top', 0);
    geneCanvas.setAttribute('width', canvasWidth);
    geneCanvas.setAttribute('height', geneCanvasHeight);
    geneCanvas.setAttribute('id', 'geneCanvas');
    canvasDiv.appendChild(geneCanvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
        geneCanvas = G_vmlCanvasManager.initElement(geneCanvas);
    }
    geneCanvasContext = geneCanvas.getContext("2d"); // Grab the 2d canvas context
    // Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
    //     context = document.getElementById('canvas').getContext("2d");

    var seqCanvas = document.createElement('canvas');
    seqCanvas.setAttribute('left', 0);
    seqCanvas.setAttribute('top', geneCanvasHeight);
    seqCanvas.setAttribute('width', canvasWidth);
    seqCanvas.setAttribute('height', seqCanvasHeight);
    seqCanvas.setAttribute('id', 'seqCanvas');
    canvasDiv.appendChild(seqCanvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
        seqCanvas = G_vmlCanvasManager.initElement(seqCanvas);
    }
    seqCanvasContext = seqCanvas.getContext("2d"); // Grab the 2d canvas context

    buttonCanvas = document.createElement('canvas');
    buttonCanvas.setAttribute('top', geneCanvasHeight + seqCanvasHeight);
    buttonCanvas.setAttribute('left', 0);
    buttonCanvas.setAttribute('width', canvasWidth);
    buttonCanvas.setAttribute('height', buttonCanvasHeight);
    buttonCanvas.setAttribute('id', 'buttonCanvas');
    canvasDiv.appendChild(buttonCanvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
        seqCanvas = G_vmlCanvasManager.initElement(seqCanvas);
    }
    buttonCanvasContext = buttonCanvas.getContext("2d"); // Grab the 2d canvas context


    var buttons = new Array();

    highlightExonSequenceButton = new Button(10, 10, 10, 'Highlight exon sequence');
    buttons.push(highlightExonSequenceButton);

    showRulerButton = new Button(200, 10, 10, 'Show ruler');
    showRulerButton.state = 1;
    buttons.push(showRulerButton);

    buttonCanvas.buttons = buttons;


    loadResources(geneFile);

    // Add mouse events
    // ----------------

    $('#geneCanvas').mousedown(function (e) {
            var mouseX = e.pageX - this.offsetLeft;
            geneMouseDown(mouseX);
        }
    );

    geneCanvas.ontouchstart = function touchStart(event, passedName) {
        // disable the standard ability to select the touched object
        event.preventDefault();
        if (event.touches.length == 1) {
            // get the coordinates of the touch
            var mouseX = event.touches[0].pageX - this.offsetLeft;
            geneMouseDown(mouseX);
        } else {
            // more than one finger touched
        }
    }

    $('#seqCanvas').mousedown(function (e) {
        // Mouse down location
        var mouseX = e.pageX - this.offsetLeft;
        //var mouseY = e.pageY - this.offsetTop;
        isMouseDown = true;
        lastMouseX = mouseX;
    });


    $('#buttonCanvas').mousedown(function (e) {
        // Mouse down location
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        buttonMouseDown(mouseX, mouseY);
    });


    buttonCanvas.ontouchstart = function touchStart(event, passedName) {
        // disable the standard ability to select the touched object
        event.preventDefault();
        if (event.touches.length == 1) {
            // get the coordinates of the touch
            var mouseX = event.touches[0].pageX - this.offsetLeft;
            var mouseY = event.touches[0].pageY - this.offsetTop;
            buttonMouseDown(mouseX, mouseY);
        } else {
            // more than one finger touched
        }
    }

    function buttonMouseDown(mouseX, mouseY) {
        for (var i = 0; i < buttonCanvas.buttons.length; i++) {
            var button = buttons[i];
            if (button.containsPoint(mouseX, mouseY)) {
                button.toggleState();
                seqMarginImage = null;
                redrawButtonCanvas();
                clearSequenceImageCache();
                redrawSeqCanvas();
            }
        }
    }

    $('#seqCanvas').mousemove(function (e) {
        if (isMouseDown) {
            var mouseX = e.pageX - this.offsetLeft;
            //var mouseY = e.pageY - this.offsetTop;
            shiftOrigin(lastMouseX - mouseX);
            lastMouseX = mouseX;
            redrawSeqCanvas();
        }

    });

    $('#seqCanvas').mouseup(function (e) {
        isMouseDown = false;
    });

    $('#seqCanvas').mouseleave(function (e) {
    });

//iOS events
    seqCanvas.ontouchmove = function touchMove(event) {
        event.preventDefault();
        if (event.touches.length == 1) {
            var mouseX = event.touches[0].pageX - this.offsetLeft;
            shiftOrigin(lastMouseX - mouseX);
            lastMouseX = mouseX;
            redrawSeqCanvas();
        } else {
            //touchCancel(event);
        }
    };

    seqCanvas.ontouchstart = function touchStart(event, passedName) {
        // disable the standard ability to select the touched object
        event.preventDefault();
        if (event.touches.length == 1) {
            // get the coordinates of the touch
            var mouseX = event.touches[0].pageX - this.offsetLeft;
            //var mouseY = e.pageY - this.offsetTop;
            isMouseDown = true;
            lastMouseX = mouseX;
            // store the triggering element ID
            //triggerElementID = passedName;
        } else {
            // more than one finger touched so cancel
            //touchCancel(event);
        }
    }

// Constrain shift to land in covered region (i.e. an expanded exon)
    function shiftOrigin(pixels) {

        originP = Math.max(0, originP + pixels);

    }

}


/*
 SRGN
 chr10	+	70847827	70864567	70847913	70863876
 3
 70847827	70847992	0
 70856839	70856987	1
 70863626	70864567	2
 var exons = new Array();
 exons[0] = new Exon(70847827, 70847992);
 exons[1] = new Exon(70856839, 70856987);
 exons[2] = new Exon(70863626, 70864567);

 gene = new Gene(70847827, 70864567, 70847913, 70863876, exons);
 */
function loadGene(geneFile) {

    //$.get(geneFile, {},
    //    function (data) {

    $.ajax({
        type:"GET",
        url: geneFile,
        dataType:"text",
        success:function (data) {
            var tmp = new Array();
            var lines = data.split("\n");
            var len = lines.length;

            // TODO -- error handling, how should errors be handled in javascript?
            var lineNo = 0;
            var geneName = lines[lineNo++].trim();

            // Gene (actually transcript) definition
            tmp = lines[lineNo++];
            var tokens = tmp.split("\t");
            chromosome = tokens[0];
            var strand = tokens[1];
            var geneStart = parseInt(tokens[2]);
            var geneEnd = parseInt(tokens[3]);
            var cdStart = parseInt(tokens[4]);
            var cdEnd = parseInt(tokens[5]);

            // Exons
            var exonCount = parseInt(lines[lineNo++]);
            var exons = new Array();
            var cdLength = 0;
            for (var i = 0; i < exonCount; i++) {
                tokens = lines[lineNo++].split("\t");
                var exonStart = parseInt(tokens[0]);
                var exonEnd = parseInt(tokens[1]);
                var frameShift = parseInt(tokens[2]);
                exons[i] = new Exon(exonStart, exonEnd, frameShift);

                // Store transcript coordinate of first coding base (for DNA -> transciprt coordinate mapping).  The
                // transcript coordinate is == the cumulative coding length of previous exons.

                exons[i].transcriptCoord = cdLength;
                var e = Math.min(cdEnd, exonEnd);
                var s = Math.max(cdStart, exonStart);
                cdLength += e - s;
                exons[i].cdStart = s;
                exons[i].cdEnd = e;
            }

            // DNA sequence.  We associated these with exons for convenience.  Must be same # in same order as exons
            var nextPixelStart = 0;
            for (var i = 0; i < exonCount; i++) {
                var exon = exons[i];
                tokens = lines[lineNo++].split("\t");
                exon.seqStart = parseInt(tokens[0]);
                exon.seqEnd = parseInt(tokens[1]);
                exon.sequence = tokens[2];
                exon.seqStartP = nextPixelStart;
                exon.seqEndP = nextPixelStart + exon.sequence.length * seqScale;
                nextPixelStart = exon.seqEndP + 20;

                exon.seqCdOffset = Math.max(exon.start, cdStart) - exon.seqStart;

                if (i == 0) {
                    startPosition = exon.seqStart;
                }
            }

            gene = new Gene(geneName, strand, geneStart, geneEnd, cdStart, cdEnd, exons);
            originP = (cdStart - startPosition - 2) * seqScale + 2;  // Not sure why the fudge factors are  needed

            // Optionally load tracks
            if (lines.length >= lineNo) {
                loadTracks(lines, lineNo);
            }


            loadCytoband(geneFile);
        }
    });
}

// Load tracks,
function loadTracks(lines, lineNo) {

    tracks = new Array();

    var track;  // The current track
    var wigType = 'bedGraph';  // The current wiggle type (fixedStep, variableStep, bedGraph)
    var chr;
    var step = 1;
    var span = 1;


    while (lineNo < lines.length) {

        var line = lines[lineNo++];

        if (line.startsWith('#')) continue;

        else if (line.startsWith('track')) {

            // If there was a previous track, finalize it.
            if (track) {
                tracks.push(track);
                // Reset defaults
                wigType = 'bedGraph';  // The current wiggle type (fixedStep, variableStep, bedGraph)
                step = 1;
                span = 1;
            }


            // e.g. track type=wiggle_0 name="Primate Cons" description="Primate Basewise Conservation by PhyloP"

            var tokens = line.split(' ');
            var name;
            var type;
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].startsWith('name')) {

                    var nameTokens = tokens[i].split('=');
                    name = nameTokens[1];
                    if (name.startsWith('"')) {
                        var j = i + 1;
                        while (j < tokens.length) {
                            name = name + ' ' + tokens[j];
                            if (tokens[j].endsWith('"')) break;
                            j++;
                        }
                    }
                }
                else if (tokens[i].startsWith('type')) {
                    var typeTokens = tokens[i].split('=');
                    type = typeTokens[1];

                }
            }
            track = new Track(name, type);

        }

        else if (track && line.startsWith('variableStep')) {

            wigType = 'variableStep';

            //variableStep chrom=chr10 span=1
            var tokens = line.split(' ');
            for (var i = 1; i < tokens.length; i++) {
                var tmp = tokens[i].split('=');
                switch (tmp[0]) {
                    case 'chrom':
                        chr = tmp[1];
                        break;
                    case 'step':
                        step = parseInt(tmp[1]);
                        break;
                    case 'span':
                        span = parseInt(tmp[1]);
                }
            }
        }

        else if (line.length > 0) {
            // Must be data -- interpret according to wigtype
            switch (wigType) {

                case 'variableStep':
                    //70847827	0.67211
                    var tokens = line.split('\t');
                    var start = parseInt(tokens[0]);
                    var end = start + span;
                    var value = parseFloat(tokens[1]);
                    var wigValue = new WigValue(start, end, value);
                    track.data.push(wigValue);

                default:
                // Ignore, don't know how to parse

            }

        }
    }

    // Add last track
    if (track) tracks.push(track);

    for (var i = 0; i < tracks.length; i++) {
        tracks[i].autoScale();
    }

    return tracks;

}

function loadCytoband(geneFile) {

    var re = /\/([^\/]*)$/
    var cytobandFile = geneFile.replace(re, "/" + chromosome + ".txt");
    $.ajax({
        type:"GET",
        url:cytobandFile,
        dataType:"text",
        success:function (data) {
            var tmp = new Array();
            var lines = data.split("\n");
            var len = lines.length;
            for (var i = 0; i < len; i++) {
                var tokens = lines[i].split("\t");
                if (tokens.length == 5) {
                    //10	0	3000000	p15.3	gneg
                    var chr = tokens[0];
                    var start = parseInt(tokens[1]);
                    var end = parseInt(tokens[2]);
                    var name = tokens[3];
                    var stain = tokens[4];
                    tmp[i] = new Cytoband(start, end, name, stain);
                }
            }
            cytobands = tmp;  // Do this last to prevent premature access during redraw
            loadCodonTable(geneFile);
        },
        error: function () {
            console.log("Failed to load cytoband. Trying codon table...");
            loadCodonTable(geneFile);
        }
    });
}

function loadCodonTable(geneFile) {

    var re = /\/([^\/]*)$/
    var codonFile = geneFile.replace(re, "/codonTable.txt");

    $.ajax({
        type:"GET",
        url: codonFile,
        dataType:"text",
        success:function (data) {
            codonTable = new Object();
            // alert("Data Loaded: " + data);
            var lines = data.split("\n");
            var len = lines.length;
            for (var i = 0; i < len; i++) {
                var tokens = lines[i].split("\t");
                var key = tokens[0];
                var aa = tokens[tokens.length - 1];
                codonTable[key] = aa;
            }

            computeAASequence(gene);
            for (var i = 0; i < gene.exons.length; i++) {
                var exon = gene.exons[i];
                computeAAFrames(exon);
            }

            redraw();
        }
    });
}


function computeAASequence(gene) {
    // TODO -- (+) strand only for now, do (-) strand.
    var exons = gene.exons;
    var codon = null;
    var aaSeq = new Array();
    for (var i = 0; i < exons.length; i++) {
        var exon = exons[i];
        if (gene.cdStart >= exon.end) {
            continue;
        }
        else if (gene.cdEnd <= gene.cdStart) {
            continue;
        }
        var s = Math.max(gene.cdStart, exon.start);
        var e = Math.min(gene.cdEnd, exon.end);
        var cdLength = e - s;
        var offset = s - exon.seqStart;
        for (var j = offset; j < (offset + cdLength); j++) {
            var base = exon.sequence[j];
            codon = (codon == null ? base : codon + base);
            if (codon.length == 3) {
                var aa = codonTable[codon];
                aaSeq.push(aa);
                codon = null;
            }
        }
        gene.aaSeq = aaSeq;
    }

}

// Compute the amino acid sequence for the exon and all frames
function computeAAFrames(exon) {

    var seq = exon.sequence;
    var seqLen = seq.length;

    var aaPosFrames = new Array();
    // + strand, 3 frames
    for (var f = 0; f < 3; f++) {
        var aaSeq = new Array();
        for (var j = f; j < seqLen - 3; j += 3) {
            var codon = seq.substr(j, 3);
            var aa = codonTable[codon];
            aaSeq.push(aa);
        }
        aaPosFrames.push(aaSeq);
    }
    exon.aaPosFrames = aaPosFrames;

    var aaNegFrames = new Array();
    // - strand
    for (var f = 0; f < 3; f++) {
        var aaSeq = new Array();
        for (var j = f; j < seqLen - 3; j += 3) {
            var c1 = complementBase(seq.charAt(j + 2));
            var c2 = complementBase(seq.charAt(j + 1));
            var c3 = complementBase(seq.charAt(j));
            var codon = c1 + c2 + c3;
            var aa = codonTable[codon];
            if (aa == undefined) {
                aa = '*';
            }
            aaSeq.push(aa);
        }
        aaNegFrames.push(aaSeq);
    }
    exon.aaNegFrames = aaNegFrames;

}

function drawIdeogram() {

    if (!cytobands) return;

    geneCanvasContext.font = "bold 12px Arial";
    geneCanvasContext.fillStyle = "Black";
    geneCanvasContext.fillText("Chromosome 10", leftMargin, 12);

    var center = (ideogramTop + ideogramHeight / 2);

    var xC = new Array();
    var yC = new Array();

    var len = cytobands.length;
    if (len == 0) return;

    var chrLength = cytobands[len - 1].end;

    var scale = (canvasWidth - leftMargin) / chrLength;

    var lastPX = -1;
    var armStart = leftMargin;
    for (var i = 0; i < cytobands.length; i++) {
        var cytoband = cytobands[i];

        var start = leftMargin + scale * cytoband.start;
        var end = leftMargin + scale * cytoband.end;
        if (end > lastPX) {


            if (cytoband.type == 'c') { // centermere: "acen"

                if (cytoband.label.charAt(0) == 'p') {
                    xC[0] = start;
                    yC[0] = ideogramHeight + ideogramTop;
                    xC[1] = start;
                    yC[1] = ideogramTop;
                    xC[2] = end;
                    yC[2] = center;
                } else {
                    xC[0] = end;
                    yC[0] = ideogramHeight + ideogramTop;
                    xC[1] = end;
                    yC[1] = ideogramTop;
                    xC[2] = start;
                    yC[2] = center;
                }
                geneCanvasContext.fillStyle = "rgb(150, 0, 0)"; //g2D.setColor(Color.RED.darker());
                geneCanvasContext.strokeStyle = "rgb(150, 0, 0)"; //g2D.setColor(Color.RED.darker());
                geneCanvasContext.polygon(xC, yC, 1, 0);
                // g2D.fillPolygon(xC, yC, 3);
            } else {

                geneCanvasContext.fillStyle = getCytobandColor(cytoband); //g2D.setColor(getCytobandColor(cytoband));
                geneCanvasContext.fillRect(start, ideogramTop, (end - start), ideogramHeight);
                // context.fillStyle = "Black"; //g2D.setColor(Color.BLACK);
                // context.strokeRect(start, y, (end - start), height);
            }
        }

        geneCanvasContext.strokeStyle = colorBlack;
        geneCanvasContext.roundRect(leftMargin, ideogramTop, canvasWidth - leftMargin, ideogramHeight, ideogramHeight / 2, 0, 1);
        //context.strokeRect(margin, y, canvasWidth-2*margin, height);
        lastPX = end;

    }

    // Draw gene location
    ideogramGeneStart = Math.floor(leftMargin + scale * gene.start);
    ideogramGeneWidth = Math.max(3, Math.floor(scale * (gene.end - gene.start)));
    geneCanvasContext.fillStyle = "rgb(255,0,0)";
    geneCanvasContext.fillRect(ideogramGeneStart, ideogramTop - 3, ideogramGeneWidth, ideogramHeight + 6);

    // Draw gene name
    geneCanvasContext.fillStyle = "Black";
    var w = geneCanvasContext.measureText(gene.label).width;
    geneCanvasContext.fillText(gene.label, ideogramGeneStart - w / 2, ideogramTop + ideogramHeight + 15);

    function getCytobandColor(data) {
        if (data.type == 'c') { // centermere: "acen"
            return "rgb(150, 10, 10)"

        } else {
            var stain = data.stain; // + 4;

            var shade = 230;
            if (data.type == 'p') {
                shade = Math.floor(230 - stain / 100.0 * 230);
            }
            var c = stainColors[shade];
            if (c == null) {
                c = "rgb(" + shade + "," + shade + "," + shade + ")";
                stainColors[shade] = c;
            }
            return c;

        }
    }

}

function drawGene() {


    var exons = gene.exons;
    var len = exons.length;
    var pixelEnd;
    var geneBottom = geneCenter + cdHeight / 2;


    // Promoter
    geneCanvasContext.fillStyle = "black";
    geneCanvasContext.strokeStyle = "black";
    geneCanvasContext.drawLine(leftMargin - 10, geneBottom, leftMargin - 10, geneBottom - 30, 3);
    geneCanvasContext.drawLine(leftMargin - 12, geneBottom - 30, leftMargin, geneBottom - 30, 3);
    geneCanvasContext.drawArrowhead(leftMargin, geneBottom - 30, 2, 10);


    // Total BP covered.
    var bp = 0;
    for (var i = 0; i < len; i++) {
        bp += exons[i].seqEnd - exons[i].seqStart;
    }
    // Compute scale
    var pixels = canvasWidth - len * exonGap - leftMargin;
    geneScale = bp / pixels;
    var lastEnd = leftMargin;
    for (var i = 0; i < len; i++) {

        exons[i].seqStartPG = lastEnd;
        var startPG = lastEnd + Math.round((exons[i].start - exons[i].seqStart) / geneScale);
        var endPG = lastEnd + Math.round((exons[i].end - exons[i].seqStart) / geneScale);
        exons[i].seqEndPG = lastEnd + Math.round((exons[i].sequence.length) / geneScale);
        var pixelIntronEndPosition = lastEnd + Math.round((exons[i].seqEnd - exons[i].seqStart) / geneScale);
        lastEnd = pixelIntronEndPosition + 10;

        // UTRs
        var pixelStart = startPG;
        pixelEnd = endPG;

        geneCanvasContext.fillStyle = "rgb(0,0,150)";
        geneCanvasContext.strokeStyle = "rgb(0,0,150)";

        if (i > 0) {
            geneCanvasContext.drawLine(exons[i].seqStartPG, geneCenter, pixelStart, geneCenter);

            // Draw "break" indicator
            geneCanvasContext.drawLine(exons[i].seqStartPG - 3, geneCenter - 3, exons[i].seqStartPG + 3, geneCenter + 3);
        }

        if (i < exons.length - 1) {
            var rightIntronPixelEnd = pixelIntronEndPosition;
            geneCanvasContext.drawLine(pixelEnd, geneCenter, rightIntronPixelEnd, geneCenter);

            // Draw "break" indicator
            geneCanvasContext.drawLine(rightIntronPixelEnd - 3, geneCenter - 3, rightIntronPixelEnd + 3, geneCenter + 3);
        }

        if (gene.cdStart > exons[i].start) {
            var pixelUtrEnd = startPG + Math.ceil((gene.cdStart - exons[i].start) / geneScale);
            geneCanvasContext.fillStyle = utrColor;
            var pw = Math.min(pixelUtrEnd, endPG) - startPG;
            geneCanvasContext.fillRect(pixelStart, geneCenter - utrHeight / 2, pw, utrHeight);
            pixelStart += pw;
        }
        if (gene.cdEnd < exons[i].end) {
            var pixelUtrStart = endPG - Math.floor((exons[i].end - gene.cdEnd) / geneScale);
            geneCanvasContext.fillStyle = utrColor;
            var pw = endPG - pixelUtrStart;
            geneCanvasContext.fillRect(pixelUtrStart, geneCenter - utrHeight / 2, pw, utrHeight);
            pixelEnd = pixelUtrStart;
        }

        if (pixelEnd > pixelStart) {
            geneCanvasContext.fillStyle = cdsColor;
            geneCanvasContext.fillRect(pixelStart, geneCenter - cdHeight / 2, pixelEnd - pixelStart, cdHeight);
        }

    }

    // Zoom line -> ideogram
    geneCanvasContext.strokeStyle = "rgb(150,150,150)";
    var p0 = exons[0].startPG;
    var p1 = exons[exons.length - 1].endPG;


    geneCanvasContext.drawLine(p0, geneCenter - 10, ideogramGeneStart, ideogramTop + ideogramHeight + 5);
    geneCanvasContext.drawLine(p1, geneCenter - 10, ideogramGeneStart + ideogramGeneWidth, ideogramTop + ideogramHeight + 5);

}


function redrawSeqCanvas() {

    clearSeqCanvas();

    var from = originP;
    var to = originP + canvasWidth - leftMargin;

    var startTile = Math.floor(from / tileSize);
    var endTile = Math.floor(to / tileSize);
    computeSequenceTiles(startTile, endTile);

    for (var t = startTile; t <= endTile; t++) {
        var tile = tileCache[t];
        var offset = tile.start - originP;
        seqCanvasContext.drawImage(tile.image, offset, 0);
        //seqCanvasContext.drawLine(offset-1, 0, offset-1, seqCanvasHeight);  <= for debugging
    }

    // Mask margin
    seqCanvasContext.drawImage(getSeqMarginImage(), 0, 0);
    //seqCanvasContext.fillStyle = '#ffffff'; // Work around for Chrome
    //seqCanvasContext.fillRect(0, 0, leftMargin, seqCanvasHeight); // Fill in the canvas with white

    //Zoom line -> gene
    var exons = gene.exons;
    var len = exons.length;
    var startExon;
    var endExon;
    for (var i = 0; i < len; i++) {
        if (!startExon) {
            if (exons[i].seqEndP > from) {
                startExon = exons[i];
                endExon = startExon;
            }
        }
        if (exons[i].seqStartP > to) {
            break;
        }
        else {
            endExon = exons[i];
        }
    }

    if (startExon) {
        var startBP = startExon.seqStart + ((from - startExon.seqStartP) / seqScale);
        var genePx = startExon.seqStartPG + Math.floor((startBP - startExon.seqStart) / geneScale);
        var y = expandedGeneCenter - aaHeight
        seqCanvasContext.strokeStyle = "rgb(150,150,150)";
        seqCanvasContext.beginPath();
        seqCanvasContext.moveTo(leftMargin, y);
//        seqCanvasContext.lineTo(genePx, 5);
//        seqCanvasContext.lineTo(genePx, 0);
        seqCanvasContext.bezierCurveTo(leftMargin, y - 30, genePx, 30, genePx, 0)
        seqCanvasContext.stroke();


        var endBP = endExon.seqStart + ((to - endExon.seqStartP) / seqScale);
        var genePx = endExon.seqStartPG + Math.floor((endBP - endExon.seqStart) / geneScale);
        seqCanvasContext.beginPath();
        seqCanvasContext.moveTo(canvasWidth, y);
//        seqCanvasContext.lineTo(genePx, 5);
//        seqCanvasContext.lineTo(genePx, 0);
        seqCanvasContext.bezierCurveTo(canvasWidth, 30, genePx, 30, genePx, 0)
        seqCanvasContext.stroke();

    }
//
//    genePx = Math.floor((rightBPInView - startPositionBP)/ geneScale);
//    seqCanvasContext.moveTo(px + 0, sequencyY - 20);
//    seqCanvasContext.lineTo(genePx, 0 + 20);
//    seqCanvasContext.lineTo(genePx, 0 + 10);
//    seqCanvasContext.stroke();
}

function Tile(start, image) {
    this.start = start;
    this.image = image;
}

function computeSequenceTiles(startTile, endTile) {

    for (var t = startTile; t <= endTile; t++) {
        if (!tileCache[t]) {
            var buffer = document.createElement('canvas');
            buffer.width = tileSize;
            buffer.height = seqCanvasHeight;

            var tileStart = t * tileSize;
            var tileEnd = tileStart + tileSize;

            var context = buffer.getContext('2d'), tileStart, tileEnd;
            drawSequenceImage(context, tileStart, tileEnd);

            if (tracks) drawTracks(context, tracksY, tileStart, tileEnd);

            tileCache[t] = new Tile(tileStart, buffer);
        }
    }
}

function getSeqMarginImage() {

    if (!seqMarginImage || seqMarginImage == null) {
        seqMarginImage = document.createElement('canvas');
        seqMarginImage.width = leftMargin;
        seqMarginImage.height = seqCanvasHeight;

        // Clear canvas
        var context = seqMarginImage.getContext('2d');
        context.fillStyle = '#ffffff'; // Work around for Chrome
        context.fillRect(0, 0, leftMargin, seqCanvasHeight); // Fill in the canvas with white

        context.fillStyle = "Black";

        // Strand arrows
        context.fillStyle = "Black";
        context.strokeStyle = "Black";
        var y = sequencyY + 3 * aaHeight - 5;
        context.drawLine(leftMargin - 30, y, leftMargin - 20, y, 3);
        context.drawArrowhead(leftMargin - 20, y, 2, 10);

        y += (showRulerButton.state ? 57 : 18);
        context.drawLine(leftMargin - 20, y, leftMargin - 10, y, 3);
        context.drawArrowhead(leftMargin - 20, y, 2, -10);


        // Track labels
        if (tracks) {
            context.font = "bold 12px Arial";
            y = tracksY + trackHeight - 8;
            for (var i = 0; i < tracks.length; i++) {
                context.fillText(tracks[i].name, 5, y);
                y += trackHeight;
            }

        }

    }
    return seqMarginImage;

}

function drawTracks(context, y, fromPixel, toPixel) {

    if (!tracks) return;

    context.fillStyle = cdsColor;

    // Find leftmost exon.  If we're in a gap we'll use the next exon
    var exons = gene.exons;
    var len = exons.length;
    var startExonIdx = -1;
    for (var i = 0; i < len; i++) {
        if (exons[i].seqEndP > fromPixel) {
            startExonIdx = i;
            break;
        }
    }
    if (startExonIdx < 0) {
        // Off the right edge, nothing to draw
        return;
    }

    var exonIdx = startExonIdx;

    for (var i = 0; i < tracks.length; i++) {

        var track = tracks[i];
        var data = track.data;

        for (var j = 0; j < data.length; j++) {

            var wigDatum = data[j];
            var x0 = wigDatum.start;
            var x1 = wigDatum.end;
            if (x1 < gene.exons[exonIdx]) continue;  // skip ahead


            while (exonIdx < gene.exons.length && x0 > gene.exons[exonIdx].seqEnd) {
                exonIdx++;
            }
            if (exonIdx >= gene.exons.length) {
                break;
            }  // Done with this track (off the right end).

            var exon = gene.exons[exonIdx];
            var px0 = exon.seqStartP + (x0 - exon.seqStart) * seqScale;

            if (px0 > toPixel) return;

            var px1 = Math.min(exon.seqEndP, exon.seqStartP + (wigDatum.end - exon.seqStart) * seqScale);

            var min = 0;  // track.min   TODO -- just ignoring negative values for now
            var ph = Math.max(1, Math.round((wigDatum.value - min) * trackHeight / (track.max - min)));
            context.fillRect(px0 - fromPixel, y + trackHeight - ph, (px1 - px0), ph);


        }


        y += trackHeight;

    }


}

function drawSequenceImage(context, fromPixel, toPixel) {

    context.font = "bold 14px Arial";

    var negFrameOffset = showRulerButton.state ? 40 : 0;

    // Uncomment to mark tile boundary (for debugging)
    //context.drawLine(fromPixel, 0, fromPixel, 300);

    // Find leftmost exon.  If we're in a gap we'll use the next exon
    var exons = gene.exons;
    var len = exons.length;
    var startExonIdx = -1;
    for (var i = 0; i < len; i++) {
        if (exons[i].seqEndP > fromPixel) {
            startExonIdx = i;
            break;
        }
    }
    if (startExonIdx < 0) {
        // Off the right edge, nothing to draw
        return;
    }

    drawExpandedGene(context, fromPixel, toPixel, startExonIdx)

    var startBaseIdx = Math.floor(Math.max(0, (fromPixel - exons[startExonIdx].seqStartP) / seqScale - 2));

    for (var j = startExonIdx; j < exons.length; j++) {

        ex = exons[j];

        var sequence = ex.sequence;
        var px = (ex.seqStartP - fromPixel) + startBaseIdx * seqScale;

        // Background for sequence highlight
        if (highlightExonSequenceButton.state) {

            // UTRs
            var c0 = Math.max(0, ex.seqStartP + (ex.start - ex.seqStart) * seqScale - fromPixel);
            var c1 = Math.min(toPixel, ex.seqStartP + (ex.cdStart - ex.seqStart) * seqScale - fromPixel);
            var y = (gene.strand == "+") ? sequencyY + 3 * aaHeight - 14 : sequencyY;
            if (c1 > c0) {
                context.fillStyle = "rgba(100,100,100,0.2)";
                context.fillRect(c0 - 2, y, c1 - c0 + 2, 18);
            }

            var c0 = Math.max(0, ex.seqStartP + (ex.cdEnd - ex.seqStart) * seqScale - fromPixel);
            var c1 = Math.min(toPixel, ex.seqStartP + (ex.end - ex.seqStart) * seqScale - fromPixel);
            if (c1 > c0) {
                context.fillStyle = "rgba(100,100,100,0.2)";
                context.fillRect(c0 - 2, y, c1 - c0 + 2, 18);
            }

            // Coding sequence
            var c0 = Math.max(0, ex.seqStartP + (ex.cdStart - ex.seqStart) * seqScale - fromPixel);
            var c1 = Math.min(toPixel, ex.seqStartP + (ex.cdEnd - ex.seqStart) * seqScale - fromPixel);
            if (c1 > c0) {
                context.fillStyle = cdsColor; // "rgba(0,0,255,0.2)";
                context.fillRect(c0 - 2, y, c1 - c0 + 2, 18);
            }
        }

        // Background for initial (incomplete) codons
        context.fillStyle = grey2;
        context.fillRect(px - 2, sequencyY - 13, 3 * seqScale, 3 * aaHeight);
        context.fillRect(px - 2, sequencyY + 4 * aaHeight + negFrameOffset, 3 * seqScale, 3 * aaHeight);


        for (var i = startBaseIdx; i < sequence.length; i++) {

            // Nucleotide (+) strand
            var base = sequence[i];

            //Amino acid  (+) strand
            var frameNumber = i % 3;
            var aaIdx = (i - frameNumber) / 3;
            var aaSeq = ex.aaPosFrames[frameNumber ];
            if (aaSeq) {
                var aa = aaSeq[aaIdx];

                var aPX = px - 2;
                var aPY = sequencyY + frameNumber * aaHeight - 13;

                var bgColor = (aaIdx % 2 == 0 ? grey1 : grey2);
                if (aa == 'M') bgColor = methioneColor;
                else if (aa == '*') bgColor = stopCodonColor;

                var w = Math.min(3, sequence.length - i) * seqScale;
                context.fillStyle = bgColor;
                context.fillRect(aPX, aPY, w, aaHeight);

                if (aa) {
                    context.fillStyle = "White";
                    context.fillText(aa, aPX + seqScale - 2, aPY + 13);
                }
            }

            context.fillStyle = baseColor(base);
            context.fillText(base, px, sequencyY + 3 * aaHeight);

            if (showRulerButton.state) {
                // Ticks
                context.strokeStyle = "Gray";
                context.fillStyle = "Black";
                var xTick = px + 5;
                context.drawLine(xTick, sequencyY + 5 + 3 * aaHeight, xTick, sequencyY + 10 + 3 * aaHeight);
                context.drawLine(xTick, sequencyY + 35 + 3 * aaHeight, xTick, sequencyY + 40 + 3 * aaHeight);

                var tickCoord = ex.seqStart + i - gene.start;
                if (tickCoord % 10 == 0) {
                    var lineWidth = context.lineWidth;
                    var font = context.font;

                    context.lineWidth = 2;
                    context.drawLine(xTick, sequencyY + 3 + 3 * aaHeight, xTick, sequencyY + 13 + 3 * aaHeight);
                    context.drawLine(xTick, sequencyY + 32 + 3 * aaHeight, xTick, sequencyY + 42 + 3 * aaHeight);

                    context.font = "12px Arial";
                    var label = formatNumber(tickCoord);
                    var w = Math.round(context.measureText(label).width / 2);
                    context.fillText(formatNumber(tickCoord), px + 4 - w, sequencyY + 27 + 3 * aaHeight);

                    context.lineWidth = lineWidth;
                    context.font = font;
                }
            }

            // Nucleotide (-) strand
            var comp = complementBase(base);
            context.fillStyle = baseColor(comp);
            context.fillText(comp, px, sequencyY + 18 + negFrameOffset + 3 * aaHeight);

            //Amino acid  (-) strand
            var frameNumber = i % 3;
            var aaIdx = (i - frameNumber) / 3;
            var aaSeq = ex.aaNegFrames[frameNumber ];
            if (aaSeq) {
                var aa = aaSeq[aaIdx];

                var aPX = px - 2;
                var aPY = sequencyY + (6 - frameNumber) * aaHeight + negFrameOffset;

                var bgColor = (aaIdx % 2 == 0 ? grey1 : grey2);
                if (aa == 'M') bgColor = methioneColor;
                else if (aa == '*') bgColor = stopCodonColor;

                var w = Math.min(3, sequence.length - i);
                context.fillStyle = bgColor;
                context.fillRect(aPX, aPY, w * seqScale, aaHeight);

                if (aa) {
                    context.fillStyle = "White";
                    context.fillText(aa, aPX + seqScale, aPY + 16);
                }
            }


            px += seqScale


            if (px > (toPixel - fromPixel)) break;
        }

        if (px > (toPixel - fromPixel)) break;
        startBaseIdx = 0;  // Start at the beginning of the next exon
    }

}

function drawExpandedGene(context, fromPixel, toPixel, startExonIdx) {

    for (var e = startExonIdx; e < gene.exons.length; e++) {

        var exon = gene.exons[e];

        var pixelStart = exon.seqStartP + Math.round((exon.start - exon.seqStart ) * seqScale) - fromPixel;
        if (pixelStart > toPixel) return;

        var pixelEnd = pixelStart + Math.round((exon.end - exon.start) * seqScale);

        // Uncomment to see tile boundary (for debugging)
        //context.drawLine(0, 0, 0, seqCanvasHeight);

        // Right intron
        if (e > 0) {
            context.strokeStyle = cdsColor;

            var pixelIntronStart = exon.seqStartP - fromPixel;
            context.drawLine(pixelIntronStart, expandedGeneCenter, pixelStart, expandedGeneCenter);

            // Draw "break" indicator
            context.drawLine(pixelIntronStart - 3, expandedGeneCenter - 3, pixelIntronStart, expandedGeneCenter + 3);
        }

        // Left intron
        if (e < gene.exons.length - 1) {
            context.strokeStyle = cdsColor;

            var rightIntronPixelEnd = exon.seqStartP + (exon.sequence.length * seqScale) - fromPixel;
            context.drawLine(pixelEnd, expandedGeneCenter, rightIntronPixelEnd, expandedGeneCenter);

            // Draw "break" indicator
            context.drawLine(rightIntronPixelEnd - 3, expandedGeneCenter - 3, rightIntronPixelEnd + 3, expandedGeneCenter + 3);
        }

        // Left UTR
        if (gene.cdStart > exon.start) {
            var pixelUtrEnd = exon.seqStartP + Math.round((gene.cdStart - exon.seqStart ) * seqScale - fromPixel);
            var pw = pixelUtrEnd - pixelStart;
            if (pw > 0) {
                context.fillStyle = utrColor;
                context.fillRect(pixelStart, expandedGeneCenter - aaHeight / 2, pw, aaHeight);
                pixelStart = pixelUtrEnd;
            }

        }

        // Right UTR
        if (gene.cdEnd < exon.end) {
            var pixelUtrStart = exon.seqStartP + Math.round((gene.cdEnd - exon.seqStart ) * seqScale - fromPixel);
            var pw = pixelEnd - pixelUtrStart;
            if (pw > 0) {
                context.fillStyle = utrColor;
                context.fillRect(pixelUtrStart, expandedGeneCenter - aaHeight / 2, pw, aaHeight);
                pixelEnd = pixelUtrStart;
            }
        }

        // Coding section
        if (pixelEnd > pixelStart) {

            var shift = exon.frameShift;

            var t = exon.transcriptCoord;
            var b = exon.cdStart;
            var bP;
            if (shift > 0) {
                var aIdx = Math.floor(t / 3);
                var aa = gene.aaSeq[aIdx];
                t += (3 - shift);
                b += (3 - shift);

                bP = exon.seqStartP + ((b - exon.seqStart) * seqScale) - fromPixel;
                if (bP > 0) {
                    var color = (aIdx % 2 == 0) ? aaColor1 : aaColor2;
                    if (aa == 'M' && aIdx == 0) color = methioneColor;
                    else if (aa == '*') color = stopCodonColor;

                    context.fillStyle = color;
                    context.fillRect(pixelStart, expandedGeneCenter - aaHeight / 2, bP - pixelStart, aaHeight);

                    // Label if frameShift == 1
                    if (shift == 1) {
                        context.fillStyle = "White";
                        context.fillText(aa, pixelStart + 2, expandedGeneCenter - aaHeight / 2 + 16);
                    }

                }

                pixelStart = bP;
            }

            while (b < exon.cdEnd) {

                var aIdx = t / 3;
                var aa = gene.aaSeq[aIdx];

                var step = Math.min(3, exon.cdEnd - b);
                b += step;
                t += step;
                bP = exon.seqStartP + ((b - exon.seqStart) * seqScale) - fromPixel;

                if (bP > 0) {
                    var color = (aIdx % 2 == 0) ? aaColor1 : aaColor2;
                    if (aa == 'M' && aIdx == 0) color = methioneColor;
                    else if (aa == '*') color = stopCodonColor;


                    context.fillStyle = color;
                    context.fillRect(pixelStart, expandedGeneCenter - aaHeight / 2, bP - pixelStart, aaHeight);

                    // Label if at least 2 bases (it will be 3 except possibly at ends)
                    if (bP - pixelStart >= 2) {
                        context.fillStyle = "White";
                        context.fillText(aa, pixelStart + seqScale + 2, expandedGeneCenter - aaHeight / 2 + 16);
                    }

                }
                pixelStart = bP;
                if (pixelStart > toPixel) return;
            }


        }


    }


}


function baseColor(base) {

    switch (base) {
        case 'A':
            return nucAColor;
        case 'C':
            return nucCColor;
        case 'T':
            return nucTColor;
        case 'G':
            return nucGColor;
        default :
            return colorBlack;
    }
}


/**
 *
 * Redraws all canvas.
 */
function redraw() {

    clearGeneCanvas()
    geneCanvasContext.fillStyle = colorBlue;
    geneCanvasContext.strokeStyle = colorBlue;
    // Must be done in this order
    drawIdeogram();
    drawGene();
    redrawSeqCanvas();
    redrawButtonCanvas();
}


function clearGeneCanvas() {
    geneCanvasContext.fillStyle = '#ffffff'; // Work around for Chrome
    geneCanvasContext.fillRect(0, 0, canvasWidth, geneCanvasHeight); // Fill in the canvas with white
}
function clearSeqCanvas() {
    seqCanvasContext.fillStyle = '#ffffff'; // Work around for Chrome
    seqCanvasContext.fillRect(0, 0, canvasWidth, seqCanvasHeight); // Fill in the canvas with white
}

function redrawButtonCanvas() {
    buttonCanvasContext.fillStyle = '#ffffff'; // Work around for Chrome
    buttonCanvasContext.fillRect(0, 0, canvasWidth, seqCanvasHeight); // Fill in the canvas with white
    buttonCanvasContext.strokeStyle = 'Black';
    buttonCanvasContext.lineWidth = 1;
    buttonCanvasContext.drawLine(0, 0, canvasWidth, 0);

    //Sequence backgound button
    for (var i = 0; i < buttonCanvas.buttons.length; i++) {
        var button = buttonCanvas.buttons[i];
        var buttonSize = button.size;
        var buttonX = button.x;
        var buttonY = button.y;
        buttonCanvasContext.strokeRect(buttonX, buttonY, buttonSize, buttonSize);
        if (button.state) {
            buttonCanvasContext.drawLine(buttonX, buttonY, buttonX + buttonSize, buttonY + buttonSize);
            buttonCanvasContext.drawLine(buttonX + buttonSize, buttonY, buttonX, buttonY + buttonSize);
        }
        buttonCanvasContext.font = "bold 12px Arial";
        buttonCanvasContext.fillStyle = 'Black';
        buttonCanvasContext.fillText(button.label, buttonX + 20, buttonY + 9);
    }

}

function clearSequenceImageCache() {
    tileCache = new Object();
}

function complementBase(base) {
    switch (base) {
        case 'A':
            return 'T';
        case 'T':
            return 'A';
        case 'G':
            return 'C';
        case 'C':
            return 'G';
        default:
            return 'N';
    }
}

