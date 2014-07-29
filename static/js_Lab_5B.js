var Sound = (function() {

	//////////PRIVATE FIELDS AND METHODS//////////
	var TWO_PI = 2.0*Math.PI;
	var PI_DIV_2 = Math.PI/2.0;

	function Player()
	{
		this.isChrome = false;
		this.isMoz = false;
		this.hasWebkitPrefix = false;
		this.audioChrome;
		this.audioMoz;
		this.dir = "/c4x/edX/DemoX/asset/js_sound_labs_sounds_"; // HACK: Static-replace not being run in js source
		this.inSignal;
		this.outSignals = [];
		this.numberChannels = 1;
		this.soundLength = 1; //In seconds
		this.sampleRate = 44100; //In Hertz
		this.numberSamples = 44100;
		this.isPlaying = false;
		this.chromeTimer;
		this.mozTimer;
		this.audioData ;
		this.playAudio;
		this.outSrc;

		//##### Test for Web Audio API #####
		//http://webaudio.github.io/web-audio-api/
		//http://caniuse.com/audio-api
		//Webkit browsers: Chrome version 10 to 33 & Safari version 6 to 7
		if (!!window.webkitAudioContext)
		{
			this.audioChrome = new webkitAudioContext();
			this.isChrome = true;
			this.hasWebkitPrefix = true;
		}
		//Chrome 34 and above & Firefox version 25 and above
		else if (!!window.AudioContext)
		{
			this.audioChrome = new AudioContext();
			this.isChrome = true;
		}
		//##### Test for Audio Data API #####
		//https://wiki.mozilla.org/Audio_Data_API
		//Firefox version 4 to 24
		else if (!!new Audio().mozSetup)
		{
			this.audioMoz = new Audio();
			this.isMoz = true;
		}
		else //Sound libraries are not supported, exit.
			throw "Neither Web Audio API nor Audio Data API is supported in this browser.";

		//To be overriden
		this.soundStarted = function()
		{
		}

		this.soundStopped = function()
		{
		}

		this.load = function(url, callback)
		{
			var request;
			var file =  this.dir + url;
			var self = this;
			request = new XMLHttpRequest();
  			request.open('GET', file, true); //Asynchronous
  			request.responseType = 'arraybuffer';

			request.onload = function()
			{
				var arrayBuffer = request.response;
   			if (arrayBuffer)
				{
					var audioDataTmp = new Int16Array(arrayBuffer, 44);
					self.audioData = new Float32Array(audioDataTmp);
					//The music has been loaded, continue execution
					callback();
				}
  		}
			request.send();
		}

		this.getAudioHeader = function(audioHeaderData)
		{
			//44 first bytes of file are the header
			return {					                               // OFFS SIZE NOTES
					chunkId      : bytesToStr(audioHeaderData, 0, 4),  // 0    4    "RIFF" = 0x52494646
    				chunkSize    : bytesToNum(audioHeaderData, 4, 4),  // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
    				format       : bytesToStr(audioHeaderData, 8, 4),  // 8    4    "WAVE" = 0x57415645
    				subChunk1Id  : bytesToStr(audioHeaderData, 12, 4), // 12   4    "fmt " = 0x666d7420
    				subChunk1Size: bytesToNum(audioHeaderData, 16, 4), // 16   4    16 for PCM
    				audioFormat  : bytesToNum(audioHeaderData, 20, 2), // 20   2    PCM = 1
    				numChannels  : bytesToNum(audioHeaderData, 22, 2), // 22   2    Mono = 1, Stereo = 2, etc.
    				sampleRate   : bytesToNum(audioHeaderData, 24, 4), // 24   4    8000, 44100, etc
    				byteRate     : bytesToNum(audioHeaderData, 28, 4), // 28   4    SampleRate*NumChannels*BitsPerSample/8
    				blockAlign   : bytesToNum(audioHeaderData, 32, 2), // 32   2    NumChannels*BitsPerSample/8
    				bitsPerSample: bytesToNum(audioHeaderData, 34, 2), // 34   2    8 bits = 8, 16 bits = 16, etc...
    				subChunk2Id  : bytesToStr(audioHeaderData, 36, 4), // 36   4    "data" = 0x64617461
    				subChunk2Size: bytesToNum(audioHeaderData, 40, 4)  // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
			};
		}

		this.bytesToStr = function(arr, offset, len)
		{
			var result = "";
			var l = 0;
			var i = offset;

			while (l < len)
			{
				result += String.fromCharCode(arr[i]);
				i++;
				l++;
			}

			return result;
		}

		//Bytes are stored as little endians
		this.bytesToNum = function(arr, offset, len)
		{
			var result = 0;
			var l = 0;;
			var i = offset + len - 1;
			var hexstr = "0x";
			var tmpstr;

			while (l < len)
			{
				if (arr[i] >= 0  && arr[i] <= 15)
					tmpstr = "0" + arr[i].toString(16);
				else
					tmpstr = arr[i].toString(16);

				hexstr += tmpstr;
				i--;
				l++;
			}

			return parseInt(hexstr, 16);
		}

		this.createBuffers = function(nOut)
		{
			this.numberSamples = this.sampleRate*this.soundLength;

			if (this.isChrome)
			{
				var b, d;

				b = this.audioChrome.createBuffer(this.numberChannels, this.numberSamples, this.sampleRate);
				d = b.getChannelData(0); //Float32Array
				this.inSignal = {buffer: b, data: d, listen: true};

				for (var i = 0; i < nOut; i++)
				{

					b = this.audioChrome.createBuffer(this.numberChannels, this.numberSamples, this.sampleRate);
					d = b.getChannelData(0); //Float32Array
					this.outSignals[i] = {buffer: b, data: d, listen: false};
				}
			}
			else if (this.isMoz)
			{
				this.inSignal = {data: new Float32Array(this.numberSamples), listen: true};
				for (var i = 0; i < nOut; i++)
				{
					this.outSignals[i] = {data: new Float32Array(this.numberSamples), listen: false};
				}
				this.audioMoz.mozSetup(this.numberChannels, this.sampleRate);
			}
		}

		this.generateZero = function()
		{
			for (var i = 0, l = this.inSignal.data.length; i < l; i++)
			{
				this.inSignal.data[i] = 0;
			}
		}

		this.generateUnitImpulse = function()
		{
			this.inSignal.data[0] = 10000;
			for (var i = 1, l = this.inSignal.data.length; i < l; i++)
			{
				this.inSignal.data[i] = 0.0;
			}
		}

		this.generateUnitStep = function()
		{
			for (var i = 0, l = this.inSignal.data.length; i < l; i++)
			{
				this.inSignal.data[i] = 1.0;
			}
		}

		this.generateSineWave = function(peakToPeak, frequency, vOffset)
		{
			var amp = 0.5*peakToPeak;

			if (vOffset != 0)
			{
				for (var i = 0, l = this.inSignal.data.length; i < l; i++)
				{
					this.inSignal.data[i] = amp * Math.sin(TWO_PI*frequency*i/this.sampleRate) + vOffset;
				}
			}
			else
			{
				for (var i = 0, l = this.inSignal.data.length; i < l; i++)
				{
					this.inSignal.data[i] = amp * Math.sin(TWO_PI*frequency*i/this.sampleRate);
				}
			}
		}

		this.generateSquareWave = function(peakToPeak, frequency, vOffset)
		{
			var amp = 0.5*peakToPeak;
			var period = 1/frequency;
			var halfPeriod = period/2;
			var itmp, sgn;


			if (vOffset != 0)
			{
				for (var i = 0, l = this.inSignal.data.length; i < l; i++)
				{
					itmp = (i/this.sampleRate) % period;
					if (itmp < halfPeriod)
						sgn = sgn = 1;
					else
						sgn = -1;
					this.inSignal.data[i] = amp * sgn + vOffset;
				}
			}
			else
			{
				for (var i = 0, l = this.inSignal.data.length; i < l; i++)
				{
					itmp = (i/this.sampleRate) % period;
					if (itmp < halfPeriod)
						sgn = sgn = 1;
					else
						sgn = -1;
					this.inSignal.data[i] = amp * sgn;
				}
			}
		}

		this.normalizeSound = function(arr)
		{
			var min = Number.POSITIVE_INFINITY;
			var max = Number.NEGATIVE_INFINITY;
			var vInMaxLocal = 10.0;
			var maxVol = 1/vInMaxLocal;

			//Find the min and max
			for (var i = 0, l = arr.length; i < l; i++)
			{
				if (arr[i] > max)
					max = arr[i];
				if (arr[i] < min)
					min = arr[i];
			}

			var vPeakToPeak = Math.abs(max - min);
			var maxVol = vPeakToPeak / vInMaxLocal;  //If we have a peak to peak voltage of 10 V, we want max sound, normalize to [-1, 1]
			var norm = Math.max(Math.abs(min), Math.abs(max));

			if (max != 0.0)
			{
				for (var i = 0, l = arr.length; i < l; i++)
				{
					arr[i] = maxVol*arr[i] / norm;
				}
			}
			else  //Fill in with zeros
			{
				for (var i = 0, l = arr.length; i < l; i++)
				{
					arr[i] = 0.0;
				}
			}
		}

		this.normalizeAllSounds = function()
		{
			//Normalize the sound buffer that will be heard
			this.normalizeSound(this.inSignal.data);
			for (var i = 0; i < this.outSignals.length; i++)
			{
				this.normalizeSound(this.outSignals[i].data);
			}
		}

		this.playTone = function()
		{
			this.soundStarted();
			var self = this;
			if (this.isChrome)
			{
				this.outSrc = this.audioChrome.createBufferSource();

				if (this.inSignal.listen)
					this.outSrc.buffer = this.inSignal.buffer;
				else
				{
					for (var i = 0; i < this.outSignals.length; i++)
					{
						if (this.outSignals[i].listen)
							this.outSrc.buffer = this.outSignals[i].buffer;
					}
				}

				this.outSrc.connect(this.audioChrome.destination);
				if (this.hasWebkitPrefix) {
					this.outSrc.noteOn(0);
				}
				else {
					this.outSrc.start(0);
				}
				this.isPlaying = true;
				this.chromeTimer = setTimeout(function(){
					self.isPlaying = false;
					self.soundStopped();
				}, this.outSrc.buffer.duration * 1000);

			}
			else if (this.isMoz)
			{
				var playedAudioData;
				var currentWritePosition = 0;
				var currentPlayPosition = 0;
				var prebufferSize = 22050 / 2; // buffer 500ms
				var tail = null;

				if (this.inSignal.listen)
					playedAudioData = this.inSignal.data;
				else
				{
					for (var i = 0; i < this.outSignals.length; i++)
					{
						if (this.outSignals[i].listen)
							playedAudioData = this.outSignals[i].data;
					}
				}

				this.isPlaying = true;

				// The function called with regular interval to populate the audio output buffer.
				this.playAudio = setInterval(function()
				{
					var written;
					currentPlayPosition = self.audioMoz.mozCurrentSampleOffset();

					// Check if some data was not written in previous attempts.
					if (tail)
					{
						written = self.audioMoz.mozWriteAudio(tail);
						currentWritePosition += written;
						if (written < tail.length)
						{
							// Not all the data was written, saving the tail...
            	tail = tail.subarray(written);
							return; //... and exit the function.
						}
						tail = null;
					}

					// Check if we need add some data to the audio output
					var available = Math.floor(currentPlayPosition + prebufferSize - currentWritePosition);
					if (available > 0)
					{
						var data = playedAudioData.subarray(currentWritePosition);
						// Writting the data
						written = self.audioMoz.mozWriteAudio(data);
						// Not all the data was written, saving the tail
						if(written <= data.length)
							tail = data.subarray(written);
						currentWritePosition += written;
					}
				}, 100);

				this.mozTimer = setTimeout(function(){
		  		clearInterval(self.playAudio);
					self.isPlaying = false;
					self.soundStopped();
				}, this.soundLength*1000);
			}
		}

		this.stopTone = function()
		{
			if (this.isPlaying)
			{
				if (this.isChrome)
				{
					clearTimeout(this.chromeTimer);
					if (this.hasWebkitPrefix) {
						this.outSrc.noteOff(0);
					}
					else {
						this.outSrc.stop(0);
					}
				}
				else if (this.isMoz)
				{
					clearTimeout(this.mozTimer);
					clearInterval(this.playAudio);
				}
				this.isPlaying = false;
			}
			this.soundStopped();
		}
	}

	//////////PUBLIC FIELDS AND METHODS//////////
	return {
		Player: Player
	};
}());

var Plotter = (function() {

	//////////PRIVATE FIELDS AND METHODS//////////
	var Utils =
	{
		TWO_PI: 2.0*Math.PI,
		PI_DIV_2: Math.PI/2.0,

		getxPix : function(fx, fleft, fwidth, wleft, wwidth)
		{
			return Math.round(wleft + wwidth * (fx - fleft) / fwidth);
		},

		getxFromPix : function(wx, wleft, wwidth, fleft, fwidth)
		{
			return fleft + fwidth * (wx - wleft) / wwidth;
		},

		getyPix : function(fy, fbottom, fheight, wbottom, wheight)
		{
			return Math.round(wbottom - wheight * (fy - fbottom) / fheight);
		},

		getyFromPix : function(wy, wbottom, wheight, fbottom, fheight)
		{
			return fbottom + fheight * (wbottom - wy) / wheight;
		},

		log10: function(x)
		{
			return Math.log(x)/Math.LN10;
		}
	};

	var Color =
	{
		//Old palette
		/*background : "rgb(0, 51, 102)", //0.0, 0.2, 0.4
		black : "rgb(0, 0, 0)", //0.0
		lodarkgray : "rgb(26, 26, 26)", //0.1 = 25.5
		darkgray : "rgb(51, 51, 51)", //0.2
		lomidgray : "rgb(102, 102, 102)", //0.4
		midgray : "rgb(128, 128, 128)", //0.5 = 127.5
		himidgray : "rgb(153, 153, 153)", //0.6
		litegray : "rgb(204, 204, 204)", //0.8
		white : "rgb(255, 255, 255)", //1.0

		red : "rgb(255, 0, 0)",
		green : "rgb(0, 255, 0)",
		blue : "rgb(255, 255, 0)",
		yellow : "rgb(255, 255, 0)",
		cyan : "rgb(0, 255, 255)",
		magenta : "rgb(255, 0, 255)",*/


		//Solarized palette: http://ethanschoonover.com/solarized
		base03 :   "#002b36",
		base02 :   "#073642",
		base015:   "#30535c",
		base01 :   "#586e75",
		base00 :   "#657b83",
		base0  :   "#839496",
		base1  :   "#93a1a1",
		base2  :   "#eee8d5",
		base3  :   "#fdf6e3",
		yellow :   "#b58900",
		orange :   "#cb4b16",
		red    :   "#dc322f",
		magenta:   "#d33682",
		violet :   "#6c71c4",
		blue   :   "#268bd2",
		cyan   :   "#2aa198",
		green  :   "#859900",
		//lightgreen: "#c3cd82
		//lightblue: "#95c6e9",
		lightblue: "#00bfff",
		lightyellow: "#ffcf48",
		lightgreen: "#1df914",
		lightmagenta: "#ff3656",
		lightbeige: "#eee8d5" //Base 2: Added to color current curve in series RLC Circuit --> Have to change
	};

	////////// GENERAL DRAWING ROUTINES //////////

	function drawLine(c, x1, y1, x2, y2)
	{
		c.beginPath();
		c.moveTo(x1 + 0.5, y1 + 0.5);
		c.lineTo(x2 + 0.5, y2 + 0.5);
		c.stroke();
	}

	//Draws a rectangle, top left corner x1, y1 and bottom right corner x2, y2
	function drawRect(c, x1, y1, x2, y2)
	{
		c.strokeRect(x1 + 0.5, y1 + 0.5, x2 - x1 + 1.0, y2 - y1 + 1.0);
	}

	function fillRect(c, x1, y1, x2, y2)
	{
		c.fillRect(x1, y1, x2 - x1 + 1.0, y2 - y1 + 1.0);
	}

	function clearRect(c, x1, y1, x2, y2)
	{
		c.clearRect(x1 + 0.5, y1 + 0.5, x2 - x1 + 1.0, y2 - y1 + 1.0);
	}

	function drawPixel(c, x, y)
	{
		c.fillRect(x, y, 1.0, 1.0);
	}

	function drawPoint(c, x, y, radius)
	{
		c.beginPath();
		c.arc(x + 0.5, y + 0.5, radius, 0, Utils.TWO_PI, true); //Last param is anticlockwise
		c.fill();
	}

	function drawHollowPoint(c, x, y, radius)
	{
		c.beginPath();
		c.arc(x + 0.5, y + 0.5, radius, 0, Utils.TWO_PI, true); //Last param is anticlockwise
		c.stroke();
	}

	function drawTriangle(c, x1, y1, x2, y2, x3, y3)
	{
		c.beginPath();
		c.moveTo(x1 + 0.5, y1 + 0.5);
		c.lineTo(x2 + 0.5, y2 + 0.5);
		c.lineTo(x3 + 0.5, y3 + 0.5);
		c.closePath();
		c.stroke();
	}

	function fillTriangle(c, x1, y1, x2, y2, x3, y3)
	{
		c.beginPath();
		c.moveTo(x1 + 0.5, y1 + 0.5);
		c.lineTo(x2 + 0.5, y2 + 0.5);
		c.lineTo(x3 + 0.5, y3 + 0.5);
		c.closePath();
		c.fill();
	}

	function drawHalfCircle(c, x, y, radius, concaveDown) //For inductance only
	{
		c.beginPath();
		if (concaveDown)
			c.arc(x + 0.5, y + 0.5, radius, 0, Math.PI, true); //Last param is anticlockwise
		else
			c.arc(x + 0.5, y + 0.5, radius, Math.PI, 0, true); //Last param is anticlockwise
		c.stroke();
	}

	function drawDiamond(c, x, y, h)
	{
		var xc = x + 0.5;
		var yc = y + 0.5;

		c.beginPath();
		c.moveTo(xc-h, yc);
		c.lineTo(xc, yc-h);
		c.lineTo(xc+h, yc);
		c.lineTo(xc, yc+h);
		c.closePath();

		c.fill();
	}

	function drawX(c, x, y, h)
	{
		var xc = x + 0.5;
		var yc = y + 0.5;

		c.beginPath();
		c.moveTo(xc+h, yc-h);
		c.lineTo(xc-h, yc+h);
		c.moveTo(xc-h, yc-h);
		c.lineTo(xc+h, yc+h);
		c.stroke();
	}

	function drawArrow(c, x1, y1, x2, y2, base, height)
	{
		var xs1 = x1 + 0.5;
		var ys1 = y1 + 0.5;
		var xs2 = x2 + 0.5;
		var ys2 = y2 + 0.5;
		var xv = x2 - x1;
		var yv = y2 - y1;
		var ang = Math.atan2(-yv, xv);

		c.beginPath();
		//Arrow line
		c.moveTo(xs1, ys1);
		c.lineTo(xs2, ys2);
		c.stroke();
		//Arrow head, first draw a triangle with top on origin then translate/rotate to orient and fit on line
		c.save();
		c.beginPath();
		c.translate(xs2, ys2);
		c.rotate(Utils.PI_DIV_2-ang);

		c.moveTo(0, 0);
		c.lineTo(-base, height);
		c.lineTo(base, height);
		c.closePath();
		c.fill();
		//c.stroke();
		c.restore();
	}

	function DrawingZone(left, top, width, height)
	{
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		this.right = left + width - 1;
		this.bottom = top + height - 1;
	}

	function Graph(x, y, width, height, canvas, buffer)
	{
		this.canvas = canvas;
		this.buffer = buffer;
		this.canvas_ctx = canvas.getContext("2d");
		this.buffer_ctx = buffer.getContext("2d");
		this.canvasColor = Color.base02; //Color.background : "rgb(0, 51, 102)"

		//Use the screen canvas
		this.ctx = this.canvas_ctx;

		this.drawingZone = new DrawingZone(x, y, width, height);
		this.drawingZoneColor = Color.base03; //Color.black;
		this.drawingZoneBorderColor = Color.base01; //Color.lomidgray;

		this.xGridColor = Color.base015; //Color.darkGray;
		this.xAxisColor = Color.base00;  //Color.himidgray;
		this.xLabelColor = Color.base1;  //Color.himidgray;
		this.xTextColor = Color.base2;   //Color.litegray;

		this.yGridColor = Color.base015; //Color.darkGray;
		this.yAxisColor = Color.base00;  //Color.himidgray;
		this.yLabelColor = Color.base1;  //Color.himidgray;
		this.yTextColor = Color.base2;   //Color.litegray;

		this.xText = "x";
		this.yText = "y";

		this.xmin = -1.0;
		this.xmax = 1.0;
		this.xspan = 2.0;
		this.ymin = -10.0;
		this.ymax = 10.0;
		this.yspan = 20.0;

		this.x0 = 0.0;
		this.y0 = 0.0;
		this.wx0 = 0;
		this.wy0 = 0;
		this.xShortTickStep = 0.1;
		this.xShortTickMin = this.xmin;
		this.xShortTickMax = this.xmax;

		this.xLongTickStep = 0.2;
		this.xLongTickMin = this.xmin;
		this.xLongTickMax = this.xmax;

		this.xLabelStep = 0.2;
		this.xLabelMin = this.xmin;
		this.xLabelMax = this.xmax;

		this.xGridStep = 0.2;
		this.xGridMin = this.xmin;
		this.xGridMax = this.xmax;

		this.formatxzero = true;
		this.formatyzero = true;

		this.yShortTickStep = 1;
		this.yShortTickMin = this.ymin;
		this.yShortTickMax = this.ymax;

		this.yLongTickStep = 2;
		this.yLongTickMin = this.ymin;
		this.yLongTickMax = this.ymax;

		this.yLabelStep = 2;
		this.yLabelMin = this.ymin;
		this.yLabelMax = this.ymax;

		this.yGridStep = 2;
		this.yGridMin = this.ymin;
		this.yGridMax = this.ymax;

		this.automaticxLabels = true;
		this.xLabelyOffset = 7;
		this.automaticyLabels = true;
		this.yLabelxOffset = -7;

		this.xTextxOffset = 9;
		this.yTextyOffset = -9;

		this.hasxLog = false;
		this.hasyLog = false;
		this.xPowerMin = 1;
		this.xPowerMax = 5;
		this.yPowerMin = 1;
		this.yPowerMax = 5;
		this.xLabelDecimalDigits = 1;
		this.yLabelDecimalDigits = 1;

		this.showxGrid = true;
		this.showyGrid = true;
		this.showBorder = true;
		this.showxShortTicks = true;
		this.showxLongTicks = true;
		this.showxLabels = true;
		this.showyShortTicks = true;
		this.showyLongTicks = true;
		this.showyLabels = true;
		this.showxAxis = true;
		this.showxText = true;
		this.showyAxis = true;
		this.showyText = true;

		this.paintOn = function(where) //On what context the drawing commands will operate
		{
			if (where == "buffer")
				this.ctx = this.buffer_ctx;
			else if (where == "canvas")
				this.ctx = this.canvas_ctx;  //Default behavior
		};

		this.paintBuffer = function() //Paints buffer on screen canvas
		{
			this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.canvas_ctx.drawImage(buffer, 0, 0);
		};

		this.paintCanvas = function() //Paints screen canvas on buffer
		{
			this.buffer_ctx.clearRect(0, 0, this.buffer.width, this.buffer.height);
			this.buffer_ctx.drawImage(canvas, 0, 0);
		};

		this.drawBorder = function()
		{
			this.ctx.strokeStyle = this.drawingZoneBorderColor;
			drawRect(this.ctx, this.drawingZone.left, this.drawingZone.top, this.drawingZone.right - 1, this.drawingZone.bottom - 1);
		};

		this.drawxAxis = function()
		{
			this.wy0 = this.getyPix(this.y0);
			this.ctx.strokeStyle = this.xAxisColor;
			drawLine(this.ctx, this.drawingZone.left, this.wy0, this.drawingZone.right + 6, this.wy0);
			drawLine(this.ctx, this.drawingZone.right + 3, this.wy0 - 3, this.drawingZone.right + 3, this.wy0 + 3);
			drawLine(this.ctx, this.drawingZone.right + 4, this.wy0 - 2, this.drawingZone.right + 4, this.wy0 + 2);
			drawLine(this.ctx, this.drawingZone.right + 5, this.wy0 - 1, this.drawingZone.right + 5, this.wy0 + 1);
		};

		/*
		if (this.hasxLog)
						wx = this.getxPix(Utils.log10(x));
		if (this.hasyLog)
						wy = this.getyPix(Utils.log10(y));
		*/

		/*
		this.ctx.textAlign = "left";
		this.ctx.textAlign = "center";
		this.ctx.textAlign = "right";
		this.ctx.textBaseline = "top";
		this.ctx.textBaseline = "middle";
		this.ctx.textBaseline = "bottom";
		this.ctx.textBaseline = "alphabetic";
		*/

		this.drawxLog = function()
		{
			var power;
			var x;
			var wx;
			var wy = this.drawingZone.bottom + 12;
			var str;

			//Don't draw grid line when on border of graph
			for(var p = this.xPowerMin; p <= this.xPowerMax; p++)
			{
				wx = this.getxPix(p);
				if(wx > this.drawingZone.right)
						wx = this.drawingZone.right;
				//Labeled grid line
				if (p != this.xPowerMin && p != this.xPowerMax) //Don't draw line on left or right border of graph
				{
					this.ctx.strokeStyle = this.xGridColor;
					drawLine(this.ctx, wx, this.drawingZone.bottom, wx, this.drawingZone.top);
				}
				//Long ticks
				this.ctx.strokeStyle = this.xLabelColor;
				drawLine(this.ctx, wx, this.drawingZone.bottom, wx, this.drawingZone.bottom + 4);
				//Now the labels
				this.ctx.fillStyle = this.xLabelColor;
				this.ctx.strokeStyle = this.xLabelColor;
				str = "10^{" + p.toFixed(0) + "}";
				this.drawSubSuperScript(this.ctx, str, wx, wy, "center", "top");

				if (p != this.xPowerMax)
				{
					for(var i = 2; i < 10; i++)
					{
						x = p + Utils.log10(i);
						wx = this.getxPix(x);
						//Grid
						this.ctx.strokeStyle = this.xGridColor;
						drawLine(this.ctx, wx, this.drawingZone.bottom, wx, this.drawingZone.top);
						//Short ticks
						this.ctx.strokeStyle = this.xLabelColor;
						drawLine(this.ctx, wx, this.drawingZone.bottom, wx, this.drawingZone.bottom + 2);
					}
				}
			}
		}

		this.drawyLog = function()
		{
			var power;
			var y;
			var wy;
			var wx = this.drawingZone.left - 7;
			var str;

			//Don't draw grid line when on border of graph
			for(var p = this.yPowerMin; p <= this.yPowerMax; p++)
			{
				wy = this.getyPix(p);
				if(wy < this.drawingZone.top)
					wy = this.drawingZone.top;
				//Labeled grid line
				if (p != this.yPowerMin && p != this.yPowerMax) //Don't draw line on left or right border of graph
				{
					this.ctx.strokeStyle = this.yGridColor;
					drawLine(this.ctx, this.drawingZone.left, wy, this.drawingZone.right, wy);
				}
				//Long ticks
				this.ctx.strokeStyle = this.yLabelColor;
				drawLine(this.ctx, this.drawingZone.left, wy, this.drawingZone.left - 4, wy);
				//Now the labels
				this.ctx.fillStyle = this.yLabelColor;
				this.ctx.strokeStyle = this.yLabelColor;
				str = "10^{" + p.toFixed(0) + "}";
				this.drawSubSuperScript(this.ctx, str, wx, wy, "right", "middle");

				if (p != this.xPowerMax)
				{
					for(var i = 2; i < 10; i++)
					{
						y = p + Utils.log10(i);
						wy = this.getyPix(y);
						//Grid
						this.ctx.strokeStyle = this.yGridColor;
						drawLine(this.ctx, this.drawingZone.left, wy, this.drawingZone.right, wy);
						//Short ticks
						this.ctx.strokeStyle = this.xLabelColor;
						drawLine(this.ctx, this.drawingZone.left, wy, this.drawingZone.left - 2, wy);
					}
				}
			}
		}

		this.drawxGrid = function()
		{
			var x;
			var wx;

			this.ctx.strokeStyle = this.xGridColor;

			if(this.xGridStep > 0)
			{
				for(x = this.xGridMin; x <= this.xGridMax; x += this.xGridStep)
				{
					wx = this.getxPix(x);
					if(wx > this.drawingZone.right)
						wx = this.drawingZone.right;
					drawLine(this.ctx, wx, this.drawingZone.bottom, wx, this.drawingZone.top);
				}
			}
		};

		this.drawxLongTicks = function()
		{
			var x;
			var wx;

			this.ctx.strokeStyle = this.xLabelColor;

			if(this.xLongTickStep > 0)
			{
				for(x = this.xLongTickMin; x <= this.xLongTickMax; x += this.xLongTickStep)
				{
					wx = this.getxPix(x);
					if(wx > this.drawingZone.right)
						wx = this.drawingZone.right;
					drawLine(this.ctx, wx, this.drawingZone.bottom, wx, this.drawingZone.bottom + 4);
				}
			}
		};

		this.drawxShortTicks = function()
		{
			var x;
			var wx;

			this.ctx.strokeStyle = this.xLabelColor;

			if(this.xShortTickStep > 0)
			{
				for(x = this.xShortTickMin; x <= this.xShortTickMax; x += this.xShortTickStep)
				{
					wx = this.getxPix(x);
					if(wx > this.drawingZone.right)
						wx = this.drawingZone.right;
					drawLine(this.ctx, wx, this.drawingZone.bottom, wx, this.drawingZone.bottom + 2);
				}
			}
		};

		this.drawyAxis = function()
		{
			this.wx0 = this.getxPix(this.x0);

			this.ctx.strokeStyle = this.yAxisColor;
			drawLine(this.ctx, this.wx0, this.drawingZone.bottom, this.wx0, this.drawingZone.top - 6);
			drawLine(this.ctx, this.wx0 - 3, this.drawingZone.top - 3, this.wx0 + 3, this.drawingZone.top - 3);
			drawLine(this.ctx, this.wx0 - 2, this.drawingZone.top - 4, this.wx0 + 2, this.drawingZone.top - 4);
			drawLine(this.ctx, this.wx0 - 1, this.drawingZone.top - 5, this.wx0 + 1, this.drawingZone.top - 5);
		};

		this.drawyLongTicks = function()
		{
			var y;
			var wy;

			this.ctx.strokeStyle = this.yLabelColor;

			if(this.yLongTickStep > 0)
			{
				for(y = this.yLongTickMin; y <= this.yLongTickMax; y += this.yLongTickStep)
				{
					wy = this.getyPix(y);
					if(wy < this.drawingZone.top)
						wy = this.drawingZone.top;
					drawLine(this.ctx, this.drawingZone.left, wy, this.drawingZone.left - 4, wy);
				}
			}
		};

		this.drawyShortTicks = function()
		{
			var y;
			var wy;

			this.ctx.strokeStyle = this.yLabelColor;

			if(this.yShortTickStep > 0)
			{
				for(y = this.yShortTickMin; y <= this.yShortTickMax; y += this.yShortTickStep)
				{
					wy = this.getyPix(y);
					if(wy < this.drawingZone.top)
						wy = this.drawingZone.top;
					drawLine(this.ctx, this.drawingZone.left, wy, this.drawingZone.left - 2, wy);
				}
			}
		};

		this.drawyGrid = function()
		{
			var y;
			var wy;

			this.ctx.strokeStyle = this.yGridColor;

			if(this.yGridStep > 0)
			{
				for(y = this.yGridMin; y <= this.yGridMax; y += this.yGridStep)
				{
					wy = this.getyPix(y);
					if(wy < this.drawingZone.top)
						wy = this.drawingZone.top;
					drawLine(this.ctx, this.drawingZone.left, wy, this.drawingZone.right, wy);
				}
			}
		};

		this.drawxLabels = function()
		{
			var x;
			var wx = 0;
			var wy = this.drawingZone.bottom + this.xLabelyOffset;
			//y coordinate of all labels
			var str;

			//this.ctx.font = "8pt Verdana bold";
			this.ctx.font = "10pt Open Sans";
			this.ctx.fillStyle = this.xLabelColor;
			this.ctx.strokeStyle = this.xLabelColor;
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "top";

			if(this.automaticxLabels)
			{
				for( x = this.xLabelMin; x <= this.xLabelMax; x += this.xLabelStep)
				{
					wx = this.getxPix(x);

					if(Math.abs(x) < 0.00001 && this.formatxzero)
						str = "0";
					else
						str = x.toFixed(this.xLabelDecimalDigits);

					//this.ctx.fillText(this.text, xmid, ymid);
					this.ctx.strokeText(str, wx, wy);
					this.ctx.fillText(str, wx, wy);
				}
			}
		}

		this.drawxText = function()
		{
			var x;
			var wx = this.drawingZone.right + this.xTextxOffset;
			var wy = this.getyPix(this.y0);

			this.ctx.fillStyle = this.xTextColor;
			this.ctx.strokeStyle = this.xTextColor;
			//this.drawSubSuperScript(this.ctx, this.xText, wx, wy, "left", "middle", "10pt Verdana bold", "8pt Verdana bold");
			this.drawSubSuperScript(this.ctx, this.xText, wx, wy, "left", "middle", "12pt Open Sans", "10pt Open Sans");
		};

		this.drawyLabels = function()
		{
			var y;
			var wy = 0;
			var wx = this.drawingZone.left + this.yLabelxOffset;
			var str;

			//this.ctx.font = "8pt Verdana bold";
			this.ctx.font = "10pt Open Sans";
			this.ctx.fillStyle = this.yLabelColor;
			this.ctx.strokeStyle = this.yLabelColor;
			this.ctx.textAlign = "right";
			this.ctx.textBaseline = "middle";

			if(this.automaticyLabels)
			{
				for( y = this.yLabelMin; y <= this.yLabelMax; y += this.yLabelStep)
				{
					wy = this.getyPix(y);

					if(Math.abs(y) < 0.00001 && this.formatyzero)
						str = "0";
					else
						str = y.toFixed(this.yLabelDecimalDigits);

					this.ctx.strokeText(str, wx, wy);
					this.ctx.fillText(str, wx, wy);
				}
			}
		};

		this.drawyText = function()
		{
			var x;
			var wx = this.getxPix(this.x0);
			var wy = this.drawingZone.top + this.yTextyOffset;

			this.ctx.fillStyle = this.yTextColor;
			this.ctx.strokeStyle = this.yTextColor;
			//this.drawSubSuperScript(this.ctx, this.yText, wx, wy, "left", "bottom", "10pt Verdana bold", "8pt Verdana bold");
			this.drawSubSuperScript(this.ctx, this.yText, wx, wy, "left", "bottom", "12pt Open Sans", "10pt Open Sans");
		};

		this.parseSubSuperScriptText = function(str)
		{
			/*var regExpSub = /_\{(.*?)\}/g;
			var regExpSup = /\^\{(.*?)\}/g;
			var subs = [];
			var sups = [];
			var text = [];
			var finalText = [];
			var isSub = false;
			var isSup = false;

			subs = str.match(regExpSub);
			for (var i = 0; i < subs.length; i++)
			{
				subs[i] = subs[i].substring(2, subs[i].length - 1); //Discard _{ and }
			}

			sups = str.match(regExpSup);
			for (var i = 0; i < sups.length; i++)
			{
				sups[i] = sups[i].substring(2, sups[i].length - 1); //Discard ^{ and }
			}*/

    	var len = str.length;
   		var i = 0;
   		var start;
   		var end;
   		found = false;
   		var text = [];
   		var type;
   		var ntext = "";

   		while (i < len)
   		{
   			if (str[i] == "_") //Encountered a potential subscript _
   				type = "sub";
   			else if (str[i] == "^")  //Encountered a potential superscript ^
   				type = "sup";

   			if (type == "sub" || type == "sup")
   			{
   				if (str[i+1] == "{")
   				{
   					i += 2; //Discard _{ or ^{
   					start = i;
   					found = false;
   					while (i < len) //Look for }
   					{
   						if (str[i] == "}")
   						{
   							found = true;
   							end = i;
   							break;
   						}
   						i++;
   					}
   					if (found && end > start) //Discard empty subscript ie _{}
   					{
   						//Store previous normal text if not empty and tag it as so
   						if (ntext.length != 0)
   						{
   							text.push({s: ntext, type: "normal"});
   							ntext = "";
   						}
   						//Store subscript or superscript and tag it as so
   						if (type == "sub")
   							text.push({s: str.substring(start, end), type: "sub"});
   						else if (type == "sup")
   							text.push({s: str.substring(start, end), type: "sup"});
   						i = end + 1;
   					}
   					else
   						i = start - 2; //Nothing was found, backtrack to _ or ^
   				}
   			}
   			ntext += str[i];
   			if (i == len - 1 && ntext.length != 0) //We've reached the end, store normal text if not empty and tag it as so
   				text.push({s: ntext, type: "normal"});
   			i++;
   		}

			return text;
		}

		this.subSuperScriptLength = function(c, text, fNormal, fSubSup)
		{
			var fontNormal = fNormal;
			var fontSubSup = fSubSup;

   		var xpos = 0;

   		for (var i = 0; i < text.length; i++)
   		{
				if (text[i].type == "normal")
					c.font = fontNormal;
				else if (text[i].type == "sub")
					c.font = fontSubSup;
				else
					c.font = fontSubSup;
				xpos += c.measureText(text[i].s).width;
			}

			return xpos;
		}

		this.drawSubSuperScript = function(c, str, x, y, xway, yway, fNormal, fSubSup)
		{
			/*var fontNormal = (typeof fNormal == 'undefined') ? "8pt Verdana bold" : fNormal;
			var fontSubSup = (typeof fSubSup == 'undefined') ? "7pt Verdana bold" : fSubSup;*/
			var fontNormal = (typeof fNormal == 'undefined') ? "12pt Open Sans" : fNormal;
			var fontSubSup = (typeof fSubSup == 'undefined') ? "10pt Open Sans" : fSubSup;

			this.ctx.textAlign = "left";
			this.ctx.textBaseline = yway;

   		var text = this.parseSubSuperScriptText(str);
   		var len = this.subSuperScriptLength(c, text, fontNormal, fontSubSup);
   		var xposIni = x;
   		var yposIni = y;
   		var xpos, ypos;

   		if (xway == "left")
   			xpos = xposIni;
   		else if (xway == "right")
   			xpos = xposIni - len;
   		else if (xway == "center")
   			xpos = xposIni - len/2;

   		//Draw the text
   		for (var i = 0; i < text.length; i++)
   		{
				if (text[i].type == "normal")
				{
					c.font = fontNormal;
					ypos = yposIni;
				}
				else if (text[i].type == "sub")
				{
					c.font = fontSubSup;
					ypos = yposIni + 3;
				}
				else
				{
					c.font = fontSubSup;
					ypos = yposIni - 5;
				}
				c.strokeText(text[i].s, xpos, ypos);
				c.fillText(text[i].s, xpos, ypos);
				//Advance x position
				xpos += c.measureText(text[i].s).width + 2;
			}
		}

		this.paint = function()
		{
			//Clears the canvas entirely with background color
			this.ctx.fillStyle = this.canvasColor;
			this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

			//Clear drawing zone
			this.ctx.fillStyle = this.drawingZoneColor;
			fillRect(this.ctx, this.drawingZone.left, this.drawingZone.top, this.drawingZone.right, this.drawingZone.bottom);

			if (!this.hasxLog)
			{
				if(this.showxGrid)
					this.drawxGrid();
			}

			if (!this.hasyLog)
			{
				if(this.showyGrid)
					this.drawyGrid();
			}

			if(this.showBorder)
				this.drawBorder();

			if (!this.hasxLog)
			{
				if(this.showxShortTicks)
					this.drawxShortTicks();
				if(this.showxLongTicks)
					this.drawxLongTicks();
				if(this.showxLabels)
					this.drawxLabels();
			}

			if (!this.hasyLog)
			{
				if(this.showyShortTicks)
					this.drawyShortTicks();
				if(this.showyLongTicks)
					this.drawyLongTicks();
				if(this.showyLabels)
					this.drawyLabels();
			}

			if (this.hasxLog)
				this.drawxLog();

			if (this.hasyLog)
				this.drawyLog();

			if(this.showxAxis)
				this.drawxAxis();
			if(this.showxText)
				this.drawxText();

			if(this.showyAxis)
				this.drawyAxis();
			if(this.showyText)
				this.drawyText();


		};

		this.drawCurve = function(f, color)
		{
			var wx, wy;
			var x, y;

			this.ctx.strokeStyle = color;
			wx = this.drawingZone.left;
			x = this.getxFromPix(wx);
			y = f(x);
			wy = this.getyPix(y);

			this.ctx.beginPath();
			this.ctx.moveTo(wx + 0.5, wy + 0.5);

			while(wx < this.drawingZone.right)
			{
				wx++;
				x = this.getxFromPix(wx);
				y = f(x);
				wy = this.getyPix(y);
				this.ctx.lineTo(wx + 0.5, wy + 0.5);
			}
			//this.ctx.closePath();

			this.ctx.stroke();
		};

		this.drawArray = function(tt, ff, color)
		{
			var wx, wy;
			var x, y;
			var l = tt.length;
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.rect(this.drawingZone.left, this.drawingZone.top, this.drawingZone.width, this.drawingZone.height);
			this.ctx.clip();
			this.ctx.strokeStyle = color;//"rgb(256, 0, 0)";// Color.orange; //yellow, orange, red, magenta, violet, blue, cyan, green

			wx = this.getxPix(tt[0]);
			wy = this.getyPix(ff[0]);
			this.ctx.beginPath();
			this.ctx.moveTo(wx + 0.5, wy + 0.5);

			for (var i = 0; i < l; i++)
			{
				wx = this.getxPix(tt[i]);
				wy = this.getyPix(ff[i]);
				//this.ctx.lineTo(wx + 0.5, wy + 0.5);
				this.ctx.lineTo(wx, wy);
			}

			//this.ctx.closePath();

			this.ctx.stroke();
			this.ctx.restore();
		};

		this.drawPoint = function(x, y, color)
		{
			this.ctx.fillStyle = color;
			drawPoint(this.ctx, this.getxPix(x), this.getyPix(y), 4);
		};

		this.drawHollowPoint = function(x, y, color)
		{
			this.ctx.strokeStyle = color;
			drawHollowPoint(this.ctx, this.getxPix(x), this.getyPix(y), 4);
		};

		this.drawDiamond = function(x, y, color)
		{
			this.ctx.fillStyle = color;
			drawDiamond(this.ctx, this.getxPix(x), this.getyPix(y), 4);
		};

		this.drawX = function(x, y, color)
		{
			this.ctx.strokeStyle = color;
			drawX(this.ctx, this.getxPix(x), this.getyPix(y), 4);
		};

		this.drawLine = function(x1, y1, x2, y2, color)
		{
			this.ctx.strokeStyle = color;
			drawLine(this.ctx, this.getxPix(x1), this.getyPix(y1), this.getxPix(x2), this.getyPix(y2));
		};

		this.drawArrow = function(x1, y1, x2, y2, color)
		{
			this.ctx.strokeStyle = color;
			this.ctx.fillStyle = color;
			drawArrow(this.ctx, this.getxPix(x1), this.getyPix(y1), this.getxPix(x2), this.getyPix(y2), 5, 10);
		};

		this.getxPix = function(x)
		{
			return Math.round(this.drawingZone.left + this.drawingZone.width * (x - this.xmin) / this.xspan);
		};

		this.getyPix = function(y)
		{
			return Math.round(this.drawingZone.bottom - this.drawingZone.height * (y - this.ymin) / this.yspan);
		};

		this.getxFromPix = function(wx)
		{
			return (this.xmin + this.xspan * (wx - this.drawingZone.left) / this.drawingZone.width);
		};

		this.getyFromPix = function(wy)
		{
			return (this.ymin + this.yspan * (this.drawingZone.bottom - wy) / this.drawingZone.height);
		};

		this.isInside = function(x, y)
		{
			if((this.drawingZone.left <= x) && (x <= this.drawingZone.right) && (this.drawingZone.top <= y) && (y <= this.drawingZone.bottom))
				return true;
			else
				return false;
		};

		this.inBounds = function(x, y)
		{
			if((this.xmin <= x) && (x <= this.xmax) && (this.ymin <= y) && (y <= this.ymax))
				return true;
			else
				return false;
		};
	}

	//////////PUBLIC FIELDS AND METHODS//////////
	return {

		Utils: Utils,
		Color: Color,
		DrawingZone: DrawingZone,
		Graph: Graph,
	};
}());

var Circuit = (function() {

	var Color =
	{
		background : "rgb(0, 51, 102)", //0.0, 0.2, 0.4
		black : "rgb(0, 0, 0)", //0.0
		lodarkgray : "rgb(26, 26, 26)", //0.1 = 25.5
		darkgray : "rgb(51, 51, 51)", //0.2
		lomidgray : "rgb(102, 102, 102)", //0.4
		midgray : "rgb(128, 128, 128)", //0.5 = 127.5
		himidgray : "rgb(153, 153, 153)", //0.6
		litegray : "rgb(204, 204, 204)", //0.8
		white : "rgb(255, 255, 255)", //1.0

		red : "rgb(255, 0, 0)",
		green : "rgb(0, 255, 0)",
		blue : "rgb(0, 0, 255)",
		yellow : "rgb(255, 255, 0)",
		cyan : "rgb(0, 255, 255)",
		magenta : "rgb(255, 0, 255)"
	};

	var Utils =
	{
		TWO_PI: 2.0*Math.PI,
		PI_DIV_2: Math.PI/2.0
	};

	function distance(x1, y1, x2, y2)
	{
		var dx = x2 - x1;
		var dy = y2 - y1;

		return Math.sqrt(dx * dx + dy * dy);
	}

	function transform(x, y, xt, yt, rot)
	{
		//First translate
		x -= xt;
		y -= yt;
		//Then rotate
		return {x: x * Math.cos(rot) - y * Math.sin(rot), y: x * Math.sin(rot) + y * Math.cos(rot)};
	}

	function closestGridPoint(gridStep, x)
	{
		return gridStep * Math.round(x / gridStep);
	}

	function getMousePosition(diagram, event)
	{
		var mouseX = event.pageX - (parseInt(diagram.element.offset().left) + parseInt(diagram.element.css('paddingLeft')) + parseInt(diagram.element.css('borderLeftWidth')));
		var mouseY = event.pageY - (parseInt(diagram.element.offset().top) + parseInt(diagram.element.css('paddingTop')) + parseInt(diagram.element.css('borderTopWidth')));
		return {x : mouseX,	y : mouseY};
	}

	function diagramMouseDown(event)
	{
		if (!event) event = window.event;
	  else event.preventDefault();
	  var canvas = (window.event) ? event.srcElement : event.target;
	  var diagram = canvas.diagram;
		var mpos = getMousePosition(diagram, event);

		for(var i = 0, len = diagram.components.length; i < len; i++)
		{
			if(diagram.components[i].isInside(mpos.x, mpos.y))
			{
				diagram.components[i].selected = true;
				diagram.startx = closestGridPoint(diagram.gridStep, mpos.x);
				diagram.starty = closestGridPoint(diagram.gridStep, mpos.y);
			}
		}

		return false;
	}

	function diagramMouseMove(event)
	{
		if (!event) event = window.event;
	  else event.preventDefault();
	  var canvas = (window.event) ? event.srcElement : event.target;
	  var diagram = canvas.diagram;
	  var mpos = getMousePosition(diagram, event);
		var componentSelected = false;

		//First check if any component if selected
		for(var i = 0, len = diagram.components.length; i < len; i++)
		{
			if(diagram.components[i].selected)
			{
				diagram.endx = closestGridPoint(diagram.gridStep, mpos.x);
				diagram.components[i].x += (diagram.endx - diagram.startx);
				diagram.startx = diagram.endx;
				diagram.endy = closestGridPoint(diagram.gridStep, mpos.y);
				diagram.components[i].y += (diagram.endy - diagram.starty);
				diagram.starty = diagram.endy;
				diagram.paint();
				componentSelected = true;
			}
		}

		if(!componentSelected)
		{
			for(var i = 0, len = diagram.components.length; i < len; i++)
			{
				if(diagram.components[i].isInside(mpos.x, mpos.y))
					diagram.components[i].selectable = true;
				else
					diagram.components[i].selectable = false;
				//Repaint only once, on a mouse enter or mouse leave
				if(diagram.components[i].previousSelectable != diagram.components[i].selectable)
				{
					diagram.components[i].previousSelectable = diagram.components[i].selectable;
					diagram.paint();
				}
			}
		}

		return false;
	}

	function diagramMouseUp(event)
	{
		if (!event) event = window.event;
	  else event.preventDefault();
	  var canvas = (window.event) ? event.srcElement : event.target;
	  var diagram = canvas.diagram;
		var mpos = getMousePosition(diagram, event);

		for(var i = 0, len = diagram.components.length; i < len; i++)
		{
			//Unselect all
			diagram.components[i].selected = false;
		}
		diagram.startx = 0;
		diagram.endx = diagram.startx;
		diagram.starty = 0;
		diagram.endx = diagram.starty;

		return false;
	}

	function diagramDoubleClick(event)
	{
		if (!event) event = window.event;
	  else event.preventDefault();
	  var canvas = (window.event) ? event.srcElement : event.target;
	  var diagram = canvas.diagram;

		alert(diagram.toString());

		return false;
	}

	function copyPrototype(descendant, parent)
	{
		var sConstructor = parent.toString();
		var aMatch = sConstructor.match(/\s*function (.*)\(/);
		if(aMatch != null)
		{
			descendant.prototype[aMatch[1]] = parent;
		}
		for(var m in parent.prototype)
		{
			descendant.prototype[m] = parent.prototype[m];
		}
	}

	function Diagram(element, frozen)
	{
		this.element = element;
		this.frozen = frozen;
		this.canvas = element[0];
		this.canvas.diagram = this;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.ctx = this.canvas.getContext("2d");
		this.background = Color.black;
		if (!this.frozen)
		{
			this.canvas.addEventListener('mousedown', diagramMouseDown, false);
			this.canvas.addEventListener('mousemove', diagramMouseMove, false);
			this.canvas.addEventListener('mouseup', diagramMouseUp, false);
			this.canvas.addEventListener('dblclick', diagramDoubleClick, false);
		}
		//To disable text selection outside the canvas
		this.canvas.onselectstart = function(){return false;};
		this.components = [];
		this.gridStep = 5;
		this.startx = 0;
		this.endx = 0;
		this.starty = 0;
		this.endy = 0;
		this.showGrid = false;
		this.xGridMin = 10;
		this.xGridMax = 500;
		this.yGridMin = 10;
		this.yGridMax = 500;
		this.xOrigin = 0;
		this.yOrigin = 0;
		this.scale = 2; //Scaling is the same in x and y directions
		this.fontSize = 6;
		//this.fontType = 'sans-serif';
		this.fontType = 'Open Sans';
	}

	Diagram.prototype.toString = function()
	{
		var result = "";
		for(var i = 0, len = this.components.length; i < len; i++)
		{
			result += this.components[i].toString();
		}

		return result;
	}

	Diagram.prototype.addNode = function(x, y)
	{
		var n = new Node(x, y);
		n.ctx = this.ctx;
		n.diagram = this;
		n.updateBoundingBox();
		this.components.push(n);
		return n;
	}

	Diagram.prototype.addWire = function(x1, y1, x2, y2)
	{
		var w = new Wire(x1, y1, x2, y2)
		w.ctx = this.ctx;
		w.diagram = this;
		w.updateBoundingBox();
		this.components.push(w);
		return w;
	}

	Diagram.prototype.addLabel = function(x, y, value, textAlign)
	{
		var l = new Label(x, y, value, textAlign)
		l.ctx = this.ctx;
		l.diagram = this;
		l.updateBoundingBox();
		this.components.push(l);
		return l;
	}

	Diagram.prototype.addCurrentLabel = function(x, y, value)
	{
		var cl = new CurrentLabel(x, y, value)
		cl.ctx = this.ctx;
		cl.diagram = this;
		cl.updateBoundingBox();
		this.components.push(cl);
		return cl;
	}

	Diagram.prototype.addResistor = function(x, y, value)
	{
		var r = new Resistor(x, y, value)
		r.ctx = this.ctx;
		r.diagram = this;
		r.updateBoundingBox();
		this.components.push(r);
		return r;
	}

	Diagram.prototype.addInductor = function(x, y, value)
	{
		var l = new Inductor(x, y, value)
		l.ctx = this.ctx;
		l.diagram = this;
		l.updateBoundingBox();
		this.components.push(l);
		return l;
	}

	Diagram.prototype.addCapacitor = function(x, y, value)
	{
		var c = new Capacitor(x, y, value)
		c.ctx = this.ctx;
		c.diagram = this;
		c.updateBoundingBox();
		this.components.push(c);
		return c;
	}

	Diagram.prototype.addMosfet = function(x, y, value, type)
	{
		var m = new Mosfet(x, y, value, type)
		m.ctx = this.ctx;
		m.diagram = this;
		m.updateBoundingBox();
		this.components.push(m);
		return m;
	}

	Diagram.prototype.addGround = function(x, y)
	{
		var g = new Ground(x, y)
		g.ctx = this.ctx;
		g.diagram = this;
		g.updateBoundingBox();
		this.components.push(g);
		return g;
	}

	Diagram.prototype.addDiode = function(x, y, value)
	{
		var d = new Diode(x, y, value)
		d.ctx = this.ctx;
		d.diagram = this;
		d.updateBoundingBox();
		this.components.push(d);
		return d;
	}

	Diagram.prototype.addSource = function(x, y, value, type)
	{
		var v = new Source(x, y, value, type)
		v.ctx = this.ctx;
		v.diagram = this;
		v.updateBoundingBox();
		this.components.push(v);
		return v;
	}

	Diagram.prototype.paint = function()
	{
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		if (this.showGrid)
			this.drawGrid();

		for(var i = 0, len = this.components.length; i < len; i++)
		{
			this.components[i].paint();
		}
	}

	Diagram.prototype.drawGrid = function()
	{
		this.ctx.fillStyle = Color.black;
		for(x = this.xGridMin; x <= this.xGridMax; x += this.gridStep)
		{
			for( y = this.yGridMin; y <= this.yGridMax; y += this.gridStep)
			{
				this.drawPixel(this.ctx, x, y);
			}
		}
	}
	//Drawing routines from schematic
	Diagram.prototype.drawLine = function(c, x1, y1, x2, y2)
	{
		c.beginPath();
		c.moveTo((x1 - this.xOrigin) * this.scale, (y1 - this.yOrigin) * this.scale);
		c.lineTo((x2 - this.xOrigin) * this.scale, (y2 - this.yOrigin) * this.scale);
		c.stroke();
	}

	Diagram.prototype.drawArc = function(c, x, y, radius,startRadians, endRadians, anticlockwise, width, filled)
	{
		c.lineWidth = width;
		c.beginPath();
		c.arc((x - this.xOrigin)*this.scale, (y - this.yOrigin)*this.scale, radius*this.scale, startRadians, endRadians, anticlockwise);
		if (filled) c.fill();
		else c.stroke();
	}

	Diagram.prototype.drawCircle = function(c, x, y, radius, filled)
	{
		this.drawArc(c, x, y, radius, 0, 2*Math.PI, false, 1, filled);
	}

	Diagram.prototype.drawText = function(c, str, x, y)
	{
		c.font = this.scale*this.fontSize + "pt " + this.fontType;
		c.fillText(str, (x - this.xOrigin) * this.scale, (y - this.yOrigin) * this.scale);
	}
	//End drawing routines

	Diagram.prototype.parseSubSuperScriptText = function(str)
	{
		/*var regExpSub = /_\{(.*?)\}/g;
		var regExpSup = /\^\{(.*?)\}/g;
		var subs = [];
		var sups = [];
		var text = [];
		var finalText = [];
		var isSub = false;
		var isSup = false;

		subs = str.match(regExpSub);
		for (var i = 0; i < subs.length; i++)
		{
			subs[i] = subs[i].substring(2, subs[i].length - 1); //Discard _{ and }
		}

		sups = str.match(regExpSup);
		for (var i = 0; i < sups.length; i++)
		{
			sups[i] = sups[i].substring(2, sups[i].length - 1); //Discard ^{ and }
		}*/

    var len = str.length;
   	var i = 0;
   	var start;
   	var end;
   	found = false;
   	var text = [];
   	var type;
   	var ntext = "";

   	while (i < len)
   	{
   		if (str[i] == "_") //Encountered a potential subscript _
   			type = "sub";
   		else if (str[i] == "^")  //Encountered a potential superscript ^
   			type = "sup";

   		if (type == "sub" || type == "sup")
   		{
   			if (str[i+1] == "{")
   			{
   				i += 2; //Discard _{ or ^{
   				start = i;
   				found = false;
   				while (i < len) //Look for }
   				{
   					if (str[i] == "}")
   					{
   						found = true;
   						end = i;
   						break;
   					}
   					i++;
   				}
   				if (found && end > start) //Discard empty subscript ie _{}
   				{
   					//Store previous normal text if not empty and tag it as so
   					if (ntext.length != 0)
   					{
   						text.push({s: ntext, type: "normal"});
   						ntext = "";
   					}
   					//Store subscript or superscript and tag it as so
   					if (type == "sub")
   						text.push({s: str.substring(start, end), type: "sub"});
   					else if (type == "sup")
   						text.push({s: str.substring(start, end), type: "sup"});
   					i = end + 1;
   				}
   				else
   					i = start - 2; //Nothing was found, backtrack to _ or ^
   			}
   		}
   		ntext += str[i];
   		if (i == len - 1 && ntext.length != 0) //We've reached the end, store normal text if not empty and tag it as so
   			text.push({s: ntext, type: "normal"});
   		i++;
   	}

		return text;
	}

  Diagram.prototype.subSuperScriptLength = function(c, text)
	{
		var fontNormal = this.scale*this.fontSize + "pt " + this.fontType;
    var fontSubSup = this.scale*(this.fontSize-1) + "pt " + this.fontType;

   	var xpos = 0;

   	for (var i = 0; i < text.length; i++)
   	{
			if (text[i].type == "normal")
				c.font = fontNormal;
			else if (text[i].type == "sub")
				c.font = fontSubSup;
			else
				c.font = fontSubSup;
			xpos += c.measureText(text[i].s).width;
		}

		return xpos;
	}

	Diagram.prototype.drawSubSuperScript = function(c, str, x, y, way)
	{
		var fontNormal = this.scale*this.fontSize + "pt " + this.fontType;
    var fontSubSup = this.scale*(this.fontSize-1) + "pt " + this.fontType;

   	var text = this.parseSubSuperScriptText(str);
   	var len = this.subSuperScriptLength(c, text);
   	var xposIni = (x - this.xOrigin) * this.scale;
   	var yposIni = (y - this.yOrigin) * this.scale;
   	var xpos, ypos;

   	if (way == "left")
   		xpos = xposIni;
   	else if (way == "right")
   		xpos = xposIni - len;
   	else if (way == "center")
   		xpos = xposIni - len/2;

   	//Draw the text
   	for (var i = 0; i < text.length; i++)
   	{
			if (text[i].type == "normal")
			{
				c.font = fontNormal;
				ypos = yposIni;
			}
			else if (text[i].type == "sub")
			{
				c.font = fontSubSup;
				ypos = yposIni + 3;
			}
			else
			{
				c.font = fontSubSup;
				ypos = yposIni - 5;
			}
			c.fillText(text[i].s, xpos, ypos);
			//Advance x position
			xpos += c.measureText(text[i].s).width;
		}
	}

	//Draws a rectangle, top left corner x1, y1 and bottom right corner x2, y2
	Diagram.prototype.drawCrispLine = function(c, x1, y1, x2, y2)
	{
		c.beginPath();
		c.moveTo(x1 + 0.5, y1 + 0.5);
		c.lineTo(x2 + 0.5, y2 + 0.5);
		c.stroke();
	}

	Diagram.prototype.drawRect = function(c, x1, y1, x2, y2)
	{
		c.strokeRect(x1 + 0.5, y1 + 0.5, x2 - x1 + 1.0, y2 - y1 + 1.0);
	}

	Diagram.prototype.fillRect = function(c, x1, y1, x2, y2)
	{
		c.fillRect(x1, y1, x2 - x1 + 1.0, y2 - y1 + 1.0);
	}

	Diagram.prototype.clearRect = function(c, x1, y1, x2, y2)
	{
		c.clearRect(x1 + 0.5, y1 + 0.5, x2 - x1 + 1.0, y2 - y1 + 1.0);
	}

	Diagram.prototype.drawPixel = function(c, x, y)
	{
		c.fillRect(x, y, 1.0, 1.0);
	}

	Diagram.prototype.drawPoint = function(c, x, y, radius)
	{
		c.beginPath();
		c.arc(x + 0.5, y + 0.5, radius, 0, Utils.TWO_PI, true); //Last param is anticlockwise
		c.fill();
	}

	Diagram.prototype.drawHollowPoint = function(c, x, y, radius)
	{
		c.beginPath();
		c.arc(x + 0.5, y + 0.5, radius, 0, Utils.TWO_PI, true); //Last param is anticlockwise
		c.stroke();
	}

	Diagram.prototype.drawTriangle = function(c, x1, y1, x2, y2, x3, y3)
	{
		c.beginPath();
		c.moveTo(x1 + 0.5, y1 + 0.5);
		c.lineTo(x2 + 0.5, y2 + 0.5);
		c.lineTo(x3 + 0.5, y3 + 0.5);
		c.closePath();
		c.stroke();
	}

	Diagram.prototype.fillTriangle = function(c, x1, y1, x2, y2, x3, y3)
	{
		c.beginPath();
		c.moveTo(x1 + 0.5, y1 + 0.5);
		c.lineTo(x2 + 0.5, y2 + 0.5);
		c.lineTo(x3 + 0.5, y3 + 0.5);
		c.closePath();
		c.fill();
	}

	Diagram.prototype.drawHalfCircle = function(c, x, y, radius, concaveDown) //For inductance only
	{
		c.beginPath();
		if (concaveDown)
			c.arc(x + 0.5, y + 0.5, radius, 0, Math.PI, true); //Last param is anticlockwise
		else
			c.arc(x + 0.5, y + 0.5, radius, Math.PI, 0, true); //Last param is anticlockwise
    c.stroke();
	}

	Diagram.prototype.drawDiamond = function(c, x, y, h)
	{
		var xc = x + 0.5;
		var yc = y + 0.5;

		c.beginPath();
		c.moveTo(xc-h, yc);
		c.lineTo(xc, yc-h);
		c.lineTo(xc+h, yc);
		c.lineTo(xc, yc+h);
		c.closePath();

		c.fill();
	}

	Diagram.prototype.drawX = function(c, x, y, h)
	{
		var xc = x + 0.5;
		var yc = y + 0.5;

		c.beginPath();
		c.moveTo(xc+h, yc-h);
		c.lineTo(xc-h, yc+h);
		c.moveTo(xc-h, yc-h);
		c.lineTo(xc+h, yc+h);
		c.stroke();
	}

	Diagram.prototype.drawArrow = function(c, x1, y1, x2, y2, base, height)
	{
		var xs1 = x1 + 0.5;
		var ys1 = y1 + 0.5;
		var xs2 = x2 + 0.5;
		var ys2 = y2 + 0.5;
		var xv = x2 - x1;
		var yv = y2 - y1;
		var ang = Math.atan2(-yv, xv);

		c.beginPath();
		//Arrow line
		c.moveTo(xs1, ys1);
		c.lineTo(xs2, ys2);
		c.stroke();
		//Arrow head, first draw a triangle with top on origin then translate/rotate to orient and fit on line
		c.save();
		c.beginPath();
		c.translate(xs2, ys2);
		c.rotate(Utils.PI_DIV_2-ang);

		c.moveTo(0, 0);
		c.lineTo(-base, height);
		c.lineTo(base, height);
		c.closePath();
		c.fill();
		//c.stroke();
		c.restore();
	}

	//***** COMPONENT *****//
	function Component(x, y, width, height)
	{
		this.x = x;
		this.y = y;

		this.boundingBox = [0, 0, 0, 0];
		this.transBoundingBox = [0, 0, 0, 0];
		this.xMiddle = 0;
		this.yMiddle = 0;

		this.previousSelectable = false;
		this.selectable = false;
		this.selected = false;
		this.ctx;
		this.diagram;
		this.color = Color.white;
		this.selectedColor = Color.red;
		this.eventListeners = {};
		//Label to the left
		this.label = {str: "", x: 0, y: 0, position: "left", show: true, color: Color.white}; //color: Color.lodarkgray
		//String representing value to the right
		this.valueString = {x: 0, y: 0, position: "right", show: true, suffix: "", decimal: -1, color: Color.white}; //color: Color.lodarkgray

		this.lineWidth = 1;
		this.rotation = 0;
		this.value = 0;
	}

	Component.prototype.addEventListener = function(type, eventListener)
	{
		if(!(type in this.eventListeners))
			this.eventListeners[type] = eventListener;
	}

	Component.prototype.removeEventListener = function(type, eventListener)
	{
		for(var i in this.eventListeners)
		{
			if(this.eventListeners[i] === eventListener)
				delete this.eventListeners[i].eventListener;
		}
	}

	Component.prototype.fireEvent = function(event)
	{
		if( typeof event == "string")
			(this.eventListeners[event])();
		else
			throw new Error("Event object missing 'type' property.");
	}

	Component.prototype.updateBoundingBox = function()
	{
		//Apply global transform
		this.transBoundingBox[0] = (this.boundingBox[0] - this.diagram.xOrigin) * this.diagram.scale;
		this.transBoundingBox[1] = (this.boundingBox[1] - this.diagram.yOrigin) * this.diagram.scale;
		this.transBoundingBox[2] = (this.boundingBox[2] - this.diagram.xOrigin) * this.diagram.scale;
		this.transBoundingBox[3] = (this.boundingBox[3] - this.diagram.yOrigin) * this.diagram.scale;
		//this.getMiddle();
		this.label.x = this.transBoundingBox[0]- 5;
		this.label.y = (this.transBoundingBox[3] - this.transBoundingBox[1]) / 2;
		this.valueString.x = this.transBoundingBox[2] + 5;
		this.valueString.y = (this.transBoundingBox[3] - this.transBoundingBox[1]) / 2;
	}

	Component.prototype.initPaint = function()
	{
		if(this.selectable)
		{
			this.ctx.strokeStyle = this.selectedColor;
			this.ctx.fillStyle = this.selectedColor;
		}
		else
		{
			this.ctx.strokeStyle = this.color;
			this.ctx.fillStyle = this.color;
		}
	}

	Component.prototype.transform = function()
	{
		this.ctx.translate(this.x, this.y);
		if(this.rotation != 0)
			this.ctx.rotate(-this.rotation);
	}

	Component.prototype.getMiddle = function()
	{
		this.xMiddle = (this.boundingBox[2] - this.boundingBox[0]) / 2;
		this.yMiddle = (this.boundingBox[3] - this.boundingBox[1]) / 2;
	}

	Component.prototype.drawLabel = function()
	{
		if (this.label.show)
		{
			var textAlign;
			this.ctx.save();
			this.ctx.fillStyle = this.label.color;
			this.ctx.textAlign = "left";
			if (this.rotation == 0) //Component is vertical
			{
				if (this.label.position == "left") //Label is on left
				{
					this.ctx.textBaseline = "middle";
					textAlign = "right";
				}
				else if (this.label.position == "right") //Label is on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "left";
				}
			}
			else if (this.rotation == Math.PI/2) //Component is horizontal
			{
				if (this.label.position == "left") //Label now on bottom
				{
					this.ctx.textBaseline = "top";
					textAlign = "center";
				}
				else if (this.label.position == "right") //Label on top
				{
					this.ctx.textBaseline = "bottom";
					textAlign = "center";
				}
			}
			else if (this.rotation == Math.PI) //Component is horizontal
			{
				if (this.label.position == "left") //Label now on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "left";
				}
				else if (this.label.position == "right") //Label now on left
				{
					this.ctx.textBaseline = "middle";
					textAlign = "right";
				}
			}
			else if (this.rotation == 2*Math.PI/3) //Component is vertical
			{
				if (this.label.position == "left") //Label is on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "left";
				}
				else if (this.label.position == "right") //Label is on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "right";
				}
			}
			this.ctx.translate(this.label.x, this.label.y);
			this.ctx.rotate(this.rotation);
			this.diagram.drawSubSuperScript(this.ctx, this.label.str, 0, 0, textAlign);
			this.ctx.restore();
		}
	}

	Component.prototype.drawValueString = function()
	{
		if (this.valueString.show)
		{
			var textAlign;
			this.ctx.save();
			this.ctx.fillStyle = this.valueString.color;
			this.ctx.textAlign = "left";
			if (this.rotation == 0) //Component is vertical
			{
				if (this.valueString.position == "left") //Label is on left
				{
					this.ctx.textBaseline = "middle";
					textAlign = "right";
				}
				else if (this.valueString.position == "right") //Label is on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "left";
				}
			}
			else if (this.rotation == Math.PI/2) //Component is horizontal
			{
				if (this.valueString.position == "left") //Label now on bottom
				{
					this.ctx.textBaseline = "top";
					textAlign = "center";
				}
				else if (this.valueString.position == "right") //Label on top
				{
					this.ctx.textBaseline = "bottom";
					textAlign = "center";
				}
			}
			else if (this.rotation == Math.PI) //Component is horizontal
			{
				if (this.valueString.position == "left") //Label now on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "left";
				}
				else if (this.valueString.position == "right") //Label now on left
				{
					this.ctx.textBaseline = "middle";
					textAlign = "right";
				}
			}
			else if (this.rotation == 2*Math.PI/3) //Component is vertical
			{
				if (this.valueString.position == "left") //Label is on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "left";
				}
				else if (this.valueString.position == "right") //Label is on right
				{
					this.ctx.textBaseline = "middle";
					textAlign = "right";
				}
			}
			this.ctx.translate(this.valueString.x, this.valueString.y);
			this.ctx.rotate(this.rotation);
			var str;
			if (this.valueString.decimal < 0)
				str = this.value + " " + this.valueString.suffix;
			else //Force a certain number of digits
				str = (this.value).toFixed(this.valueString.decimal) + " " + this.valueString.suffix;

			this.diagram.drawSubSuperScript(this.ctx, str, 0, 0, textAlign);
			this.ctx.restore();
		}
	}

	Component.prototype.isInside = function(x, y)
	{
		var pt = transform(x, y, this.x, this.y, this.rotation);
		if((this.transBoundingBox[0] <= pt.x) && (pt.x <= this.transBoundingBox[2]) && (this.transBoundingBox[1] <= pt.y) && (pt.y <= this.transBoundingBox[3]))
			return true;
		else
			return false;
	}

	//***** NODE COMPONENT *****//
	function Node(x, y)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-2, -2, 2, 2];
		this.nodeRadius = 2;
	}

	copyPrototype(Node, Component);
	Node.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawCircle(this.ctx, 0, 0, this.nodeRadius, true);
		this.drawLabel();
		this.ctx.restore();
	}

	Node.prototype.toString = function()
	{
	    return "<Node (" + this.x + "," + this.y + ")>";
	}

	//***** WIRE COMPONENT *****//
	function Wire(x1, y1, x2, y2)
	{
		//Call super class
		this.Component(x1, y1);
		this.dx = x2 - x1;
		this.dy = y2 - y1;
		this.boundingBox = [-5, -5, this.dx + 5, this.dy + 5];
	}

	copyPrototype(Wire, Component);
	Wire.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, this.dx, this.dy);
		this.ctx.restore();
	}

	Wire.prototype.toString = function()
	{
	    return "<Wire (" + this.x + "," + this.y + "," + (this.x + this.dx) + "," + (this.y + this.dy) + ")>";
	}

	//***** LABEL *****//
	function Label(x, y, value, textAlign)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-10, -10, 10, 10];
		this.value = value;
		this.textAlign = textAlign;
	}

	copyPrototype(Label, Component);
	Label.prototype.paint = function()
	{
		this.ctx.save();
		this.ctx.textAlign = "left";
		this.ctx.translate(this.x, this.y);
		this.ctx.rotate(this.rotation);
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawSubSuperScript(this.ctx, this.value, 0, 0, this.textAlign);
		this.ctx.restore();
	}

	Label.prototype.toString = function()
	{
	    return "<Label (" + this.x + "," + this.y + ")>";
	}

	//***** CURRENT LABEL COMPONENT *****//
	function CurrentLabel(x, y, value)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-3, 0, 3, 3];
		this.value = value;
	}

	copyPrototype(CurrentLabel, Component);
	CurrentLabel.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 3, 3);
		this.diagram.drawLine(this.ctx, 0, 0, -3, 3);
		this.drawLabel();
		this.drawValueString();
		this.ctx.restore();
	}

	CurrentLabel.prototype.toString = function()
	{
	    return "<Current Label (" + this.x + "," + this.y + ")>";
	}

	//***** CAPACITOR COMPONENT *****//
	function Capacitor(x, y, value)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-8, 0, 8, 48];
		this.value = value;
	}

	copyPrototype(Capacitor, Component);
	Capacitor.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 0, 22);
		this.diagram.drawLine(this.ctx, -8, 22, 8, 22);
		this.diagram.drawLine(this.ctx, -8, 26, 8, 26);
		this.diagram.drawLine(this.ctx, 0, 26, 0, 48);
		this.drawLabel();
		this.drawValueString();
		this.ctx.restore();
	}

	Capacitor.prototype.toString = function()
	{
	    return "<Capacitor (" + this.x + "," + this.y + ")>";
	}

	//***** RESISTOR COMPONENT *****//
	function Resistor(x, y, value)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-5, 0, 5, 48];
		this.value = value;
	}

	copyPrototype(Resistor, Component);
	Resistor.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 0, 12);
		this.diagram.drawLine(this.ctx, 0, 12, 4, 14);
		this.diagram.drawLine(this.ctx, 4, 14, -4, 18);
		this.diagram.drawLine(this.ctx, -4, 18, 4, 22);
		this.diagram.drawLine(this.ctx, 4, 22, -4, 26);
		this.diagram.drawLine(this.ctx, -4, 26, 4, 30);
		this.diagram.drawLine(this.ctx, 4, 30, -4, 34);
		this.diagram.drawLine(this.ctx, -4, 34, 0, 36);
		this.diagram.drawLine(this.ctx, 0, 36, 0, 48);
		this.drawLabel();
		this.drawValueString();
		this.ctx.restore();
	}

	Resistor.prototype.toString = function()
	{
	    return "<Resistor (" + this.x + "," + this.y + ")>";
	}

	//***** INDUCTOR COMPONENT *****//
	function Inductor(x, y, value)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-4, 0, 5, 48];
		this.value = value;
	}

	copyPrototype(Inductor, Component);
	Inductor.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 0, 14);
		this.diagram.drawArc(this.ctx, 0, 18, 4, 6*Math.PI/4, 3*Math.PI/4);
		this.diagram.drawArc(this.ctx, 0, 24, 4, 5*Math.PI/4, 3*Math.PI/4);
		this.diagram.drawArc(this.ctx, 0, 30, 4, 5*Math.PI/4, 2*Math.PI/4);
		this.diagram.drawLine(this.ctx, 0, 34, 0, 48);
		this.drawLabel();
		this.drawValueString();
		this.ctx.restore();
	}

	Inductor.prototype.toString = function()
	{
	    return "<Inductor (" + this.x + "," + this.y + ")>";
	}

	//***** N-CHANNEL AND P-CHANNEL MOSFET COMPONENT *****//
	function Mosfet(x, y, value, type)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-24, 0, 8, 48];
		this.value = value;
		this.type = type;
	}

	copyPrototype(Mosfet, Component);
	Mosfet.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 0, 16);
		this.diagram.drawLine(this.ctx, -8, 16, 0, 16);
		this.diagram.drawLine(this.ctx, -8, 16, -8, 32);
		this.diagram.drawLine(this.ctx, -8, 32, 0, 32);
		this.diagram.drawLine(this.ctx, 0, 32, 0, 48);
		if (this.type == "n")
		{
			this.diagram.drawLine(this.ctx,-24,24,-12,24);
			this.diagram.drawLine(this.ctx,-12,16,-12,32);
		}
		else if (this.type == "p")
		{
			this.diagram.drawLine(this.ctx, -24, 24, -16, 24);
			this.diagram.drawCircle(this.ctx, -14, 24, 2, false);
			this.diagram.drawLine(this.ctx, -12, 16, -12, 32);
		}
		this.drawLabel();
		this.drawValueString();
		this.ctx.restore();
	}

	Mosfet.prototype.toString = function()
	{
	    if (this.type = "n")
	    	return "<Mosfet N Channel (" + this.x + "," + this.y + ")>";
	    else if (this.type = "p")
	    	return "<Mosfet P Channel (" + this.x + "," + this.y + ")>";
	}

	//***** VOLTAGE AND CURRENT SOURCE COMPONENT *****//
	function Source(x, y, value, type)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-12, 0, 12, 48];
		this.value = value;
		this.type = type;
	}

	copyPrototype(Source, Component);
	Source.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 0, 12);
		this.diagram.drawCircle(this.ctx, 0, 24, 12, false);
		this.diagram.drawLine(this.ctx, 0, 36, 0, 48);
		if (this.type == "v")
		{
			//Plus sign, vertical bar
			this.ctx.save();
			this.ctx.translate(0, this.diagram.scale*18);
			this.ctx.rotate(this.rotation);
			this.diagram.drawLine(this.ctx, 0, -3, 0, 3); //this.diagram.drawLine(this.ctx, 0, 15, 0, 21);
			this.ctx.restore();

			//Plus sign, horizontal bar
			this.ctx.save();
			this.ctx.translate(0, this.diagram.scale*18);
			this.ctx.rotate(this.rotation);
			this.diagram.drawLine(this.ctx, -3, 0, 3, 0); //this.diagram.drawLine(this.ctx, -3, 18, 3, 18);
			this.ctx.restore();
			//Minus sign
			this.ctx.save();
			this.ctx.translate(0, this.diagram.scale*30);
			this.ctx.rotate(this.rotation);
			this.diagram.drawLine(this.ctx, -3, 0, 3, 0);	//this.diagram.drawLine(this.ctx, -3, 30, 3, 30);
			this.ctx.restore();
		}
		else if (this.type == "i")
		{
			this.diagram.drawLine(this.ctx, 0, 15, 0, 32);
			this.diagram.drawLine(this.ctx,-3, 26, 0, 32);
			this.diagram.drawLine(this.ctx,3, 26, 0, 32);
		}
		this.drawLabel();
		this.drawValueString();
		this.ctx.restore();
	}

	Source.prototype.toString = function()
	{
			if (this.type = "v")
				return "<Voltage Source (" + this.x + "," + this.y + ")>";
	    else if (this.type = "i")
				return "<Current Source (" + this.x + "," + this.y + ")>";
	}

	//***** GROUND COMPONENT *****//
	function Ground(x, y)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-6, 0, 6, 8];
	}

	copyPrototype(Ground, Component);
	Ground.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 0, 8);
	  this.diagram.drawLine(this.ctx, -6, 8, 6, 8);
	  this.ctx.restore();
	}

	Ground.prototype.toString = function()
	{
	    return "<Ground (" + this.x + "," + this.y + ")>";
	}

	//***** DIODE COMPONENT *****//
	function Diode(x, y, value)
	{
		//Call super class
		this.Component(x, y);
		this.boundingBox = [-8, 0, 8, 48];
		this.value = value;
	}

	copyPrototype(Diode, Component);
	Diode.prototype.paint = function()
	{
		this.initPaint();
		this.ctx.save();
		this.transform();
		this.drawLabel();
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;
		this.diagram.drawLine(this.ctx, 0, 0, 0, 16);
		this.diagram.drawLine(this.ctx, -8, 16, 8, 16);
		this.diagram.drawLine(this.ctx, -8, 16, 0, 32);
		this.diagram.drawLine(this.ctx, 8, 16, 0, 32);
		this.diagram.drawLine(this.ctx, -8, 32, 8, 32);
		this.diagram.drawLine(this.ctx,0 , 32, 0, 48);
		this.ctx.restore();
	}

	Diode.prototype.toString = function()
	{
	    return "<Diode (" + this.x + "," + this.y + ")>";
	}

//////////PUBLIC FIELDS AND METHODS//////////
	return {

		Utils: Utils,
		Color: Color,
		Diagram: Diagram,
	};
}());

function initGraph()
{
    //Test if canvas is supported. If not, exit.
    var testCanvas = document.createElement("canvas")
    if (!testCanvas.getContext)
        throw "Canvas element is not supported in this browser."
    //Get canvas
    var canvas = $('#graph')[0];
    //To disable text selection outside the canvas
    canvas.onselectstart = function(){return false;};
    //Create an offscreen buffer
    var buffer = document.createElement('canvas');
    buffer.width = canvas.width;
    buffer.height = canvas.height;
    graph = new Plotter.Graph(50, 50, 400, 400, canvas, buffer);
}

var diagram, VS, VIn, VBias, R;

function initDiagram()
{
    //Test if canvas is supported. If not, exit.
    var testCanvas = document.createElement("canvas")
    if (!testCanvas.getContext)
        throw "Canvas element is not supported in this browser."

    var element = $('#diag1');
    diagram = new Circuit.Diagram(element, true);

    //Lines
    var wirev1 = diagram.addWire(100, 289, 100, 361);
    var wirev2 = diagram.addWire(100, 78, 100, 135.5);
    var wirev3 = diagram.addWire(380, 78.5, 380, 89.5);
    var wirev4 = diagram.addWire(380, 290, 380, 361.5);

    var wireh1 = diagram.addWire(100, 78, 240, 78);
    var wireh2 = diagram.addWire(240, 243, 286, 243);
    var wireh3 = diagram.addWire(100, 433, 240, 433);

    var vOutPlus = diagram.addLabel(396, 219, "\u002B", "left");
    var vOutLabel = diagram.addLabel(396, 244, "v_{OUT}", "left");
    var vOutMinus = diagram.addLabel(396, 274, "\u2212", "left");
    vOutPlus.color = Plotter.Color.lightyellow;
    vOutLabel.color = Plotter.Color.lightyellow;
    vOutMinus.color = Plotter.Color.lightyellow;

    var vRPlus = diagram.addLabel(310, 127, "\u002B", "left");
    var vRLabel = diagram.addLabel(310, 152, "v_{R}", "left");
    var vRMinus = diagram.addLabel(310, 182, "\u2212", "left");
    vRPlus.color = Plotter.Color.lightgreen;
    vRLabel.color = Plotter.Color.lightgreen;
    vRMinus.color = Plotter.Color.lightgreen;

    //vin
    //Plotter.Color.lightblue);
    //vout
    //Plotter.Color.lightyellow);
    //vr
    //Plotter.Color.lightgreen);

    //Ground
    var ground = diagram.addGround(240, 433);

    //Resistor
    R = diagram.addResistor(380, 99.5, 10);
    R.label.str = "R";
    R.valueString.suffix = "k\u03A9";

    //Voltage sources
    VS = diagram.addSource(100, 193, 1.6, "v");
    VS.label.str = "V_{S}";
    VS.valueString.suffix = "V";
    VIn = diagram.addSource(240, 243, 3, "v");
    VIn.label.str = "v_{IN}";
    VIn.label.color = Plotter.Color.lightblue;
    VIn.valueString.suffix = "V";
    VIn.valueString.color = Plotter.Color.lightblue;
    VBias = diagram.addSource(240, 338, 2.5, "v");
    VBias.label.str = "v_{BIAS}";
    VBias.valueString.suffix = "V";

    //Mosfet
    var nMosfet = diagram.addMosfet(380, 195, "", "n");

    //diagram.showGrid = true;
    //diagram.gridStep = 1;
    diagram.paint();
}

function setGraph()
{
    var lticks = 1;
    var sticks = 0.5;
    //x axis
    graph.xText = xLab;
    graph.yText = "V_{MAX} (Volts)";
    graph.xmin = 0;
    graph.xmax = maxTime;
    graph.xspan = maxTime;
    graph.xShortTickMin = 0;
    graph.xShortTickMax = maxTime;
    graph.xShortTickStep = maxTime/20;
    graph.xLongTickMin = 0;
    graph.xLongTickMax = maxTime;
    graph.xLongTickStep = maxTime/10;
    graph.xLabelMin = 0;
    graph.xLabelMax = maxTime;
    graph.xLabelStep = maxTime/10;
    graph.xGridMin = 0;
    graph.xGridMax = maxTime;
    graph.xGridStep = maxTime/10;
    //y axis
    graph.ymin = -maxVolt;
    graph.ymax = maxVolt;
    graph.yspan = 2*maxVolt;
    graph.yShortTickMin = -maxVolt + (maxVolt % sticks);
    graph.yShortTickMax = maxVolt - (maxVolt % sticks);
    graph.yShortTickStep = sticks;
    graph.yLongTickMin = -maxVolt + (maxVolt % lticks);
    graph.yLongTickMax = maxVolt - (maxVolt % lticks);
    graph.yLongTickStep = lticks;
    graph.yLabelMin = -maxVolt + (maxVolt % lticks);
    graph.yLabelMax = maxVolt - (maxVolt % lticks);
    graph.yLabelStep = lticks;
    graph.yGridMin = -maxVolt + (maxVolt % lticks);
    graph.yGridMax = maxVolt - (maxVolt % lticks);
    graph.yGridStep = lticks;
}

function generateBuffer()
{
    //Draw on offscreen image buffer
    graph.paintOn("buffer");
    graph.paint();
}

function draw()
{
    //Paint buffer on canvas
    graph.paintBuffer();

    //Draw on canvas
    graph.paintOn("canvas"); //Draw on screen image

    if (vinChecked)
        graph.drawArray(time, insig, Plotter.Color.lightblue);
    if (voutChecked)
        graph.drawArray(time, outsig, Plotter.Color.lightyellow);
    if (vrChecked)
        graph.drawArray(time, rsig, Plotter.Color.lightgreen);
}

function initSound()
{
    sp = new Sound.Player();
    sp.soundStarted = function()
    {
        $('#playButton').prop('value', "Stop");
    }

    sp.soundStopped = function()
    {
        $('#playButton').prop('value', "Play");
    }
}

function communSlide()
{
    if (labEnabled)
    {
        if (sp.isPlaying)
            sp.stopTone();
        calculateSignals();
        draw();
        diagram.paint();
    }
}


function getCheckboxesState()
{
    if($('#vinCheckbox').prop('checked'))
        vinChecked = true;
    else
        vinChecked = false;
    if($('#voutCheckbox').prop('checked'))
        voutChecked = true;
    else
        voutChecked = false;
    if($('#vrCheckbox').prop('checked'))
        vrChecked = true;
    else
        vrChecked = false;
}

function getRadioButtonsState()
{
    if($('#vinRadioButton').prop('checked'))
        sp.inSignal.listen = true;
    else
        sp.inSignal.listen = false;
    if($('#voutRadioButton').prop('checked'))
        sp.outSignals[0].listen = true;
    else
        sp.outSignals[0].listen = false;
    if($('#vrRadioButton').prop('checked'))
        sp.outSignals[1].listen = true;
    else
        sp.outSignals[1].listen = false;
}

function onSelectChange()
{
    if (labEnabled)
    {
        musicType = $("#musicTypeSelect").val();
        sp.stopTone();
        if (musicType == 0) //Zero Input
        {
            $("#vinSlider").slider( "option", "disabled", true);
            $("#freqSlider").slider( "option", "disabled", true);
            maxTime = 10; //ms
            xLab = "t (ms)";
            musicLoaded();
        }
        else if (musicType == 1) //Unit Impulse
        {
            $("#vinSlider").slider( "option", "disabled", true);
            $("#freqSlider").slider( "option", "disabled", true);
            maxTime = 10; //ms
            xLab = "t (ms)";
            musicLoaded();
        }
        else if (musicType == 2) //Unit Step
        {
            $("#vinSlider").slider( "option", "disabled", true);
            $("#freqSlider").slider( "option", "disabled", true);
            maxTime = 10; //ms
            xLab = "t (ms)";
            musicLoaded();
        }
        if (musicType == 3) //Sine Wave
        {
            $("#vinSlider").slider( "option", "disabled", false);
            $("#freqSlider").slider( "option", "disabled", false);
            maxTime = 10; //ms
            xLab = "t (ms)";
            musicLoaded();
        }
        else if (musicType == 4) //Square Wave
        {
            $("#vinSlider").slider( "option", "disabled", false);
            $("#freqSlider").slider( "option", "disabled", false);
            maxTime = 10; //ms
            xLab = "t (ms)";
            musicLoaded();
        }
        else if (musicType == 5 || musicType == 6 || musicType == 7 || musicType == 8) //Music
        {
            $("#vinSlider").slider( "option", "disabled", false);
            $("#freqSlider").slider( "option", "disabled", true);
            maxTime = 20; //s
            xLab = "t (s)";

            if (musicType == 5)
                sp.load("classical.wav", musicLoaded);
            else if (musicType == 6)
                sp.load("folk.wav", musicLoaded);
            else if (musicType == 7)
                sp.load("jazz.wav", musicLoaded);
            else
                sp.load("reggae.wav", musicLoaded);
        }
    }
}

function musicLoaded()
{
    setGraph();
    generateBuffer();
    calculateSignals();
    draw();
}

function checkboxClicked()
{
    if (labEnabled)
    {
        getCheckboxesState();
        draw();
    }
}

function radioButtonClicked()
{
    if (labEnabled)
    {
        if (sp.isPlaying)
            sp.stopTone();
        getRadioButtonsState();
    }
}

function playButtonClicked()
{
    if (labEnabled)
    {
        if (sp.isPlaying)
            sp.stopTone();
        else
            sp.playTone();
    }
}

//TO DO: PUT ALL THE FOLLOWING GLOBAL VARIABLES IN A NAMESPACE
var labEnabled = true;
//Graph
var graph;
var maxTime = 10; //In ms
var xLab = "t (ms)";
var maxVolt = 2;
var time;
var insig;
var outsig;
//Sound Player
var sp;

//Drop variable down for Type of Input
var musicType = 3;
//Checkboxes variables for Graph
var vinChecked = true;
var voutChecked = true;
var vrChecked = false;
//Slider variables
var vS = 1.6;
var vIn = 3.0;
var vInMax = 5.0;
var freq = 1000;
var vBias = 2.5;
var r = 10000;
var k = 0.001;
var vt = 1;
var vMax = 2;

function calculateSignals()
{
    if (musicType == 0 || musicType == 1 || musicType == 2 || musicType == 3)
    {
        sp.soundLength = 1;
        sp.sampleRate = 50000;
    }
    else if (musicType == 4)
    {
        sp.soundLength = 1;
        sp.sampleRate = 88200;
    }
    else if (musicType == 5 || musicType == 6 || musicType == 7 || musicType == 8) //Classical, Folk, Jazz, Reggae
    {
        sp.soundLength = 20;
        sp.sampleRate = 22050;
    }

    sp.createBuffers(2); //We have two outputs, first one is the voltage across Drain, Source, the second across resistor R
    getRadioButtonsState(); //Set what we are listening to, input, or one of the above

    if (musicType == 0) //Zero Input
        sp.generateZero();
    else if (musicType == 1) //Unit Impulse
        sp.generateUnitImpulse();
    else if (musicType == 2) //Unit Step
        sp.generateUnitStep();
    else if (musicType == 3) //Sine Wave
        sp.generateSineWave(vIn, freq, 0);
    else if (musicType == 4) //Square Wave
        sp.generateSquareWave(vIn, freq, 0);
    else if (musicType == 5 || musicType == 6 || musicType == 7 || musicType == 8) //Classical, Folk, Jazz, Reggae
    {
        //TO DO: MOVE OUT
        var max = Number.NEGATIVE_INFINITY;
        var amp = 0.0;

        //Find the max and normalize
        for (var i = 0, l = sp.inSignal.data.length; i < l; i++)
        {
            amp = Math.abs(sp.audioData[i]);
            if (amp > max)
                max = amp;
        }
        max /= 0.5;
        if (max != 0.0)
        {
            for (var i = 0, l = sp.inSignal.data.length; i < l; i++)
            {
                sp.inSignal.data[i] = vIn*sp.audioData[i] / max;
            }
        }
        else //Fill in with zeros
        {
            for (var i = 0, l = sp.inSignal.data.length; i < l; i++)
            {
                sp.inSignal.data[i] = 0.0;
            }
        }
    }

    getVDS(sp.inSignal.data, sp.outSignals[0].data, vBias, vS, r, k, vt);
    getVr(sp.outSignals[0].data, sp.outSignals[1].data);

    time = [];
    insig = [];
    outsig = [];
    rsig = [];
    var i = 0;
    var ii;
    var imult;
    var imax;
    var x = 0;
    var xinc;


    //Scale of graph is 500 px
    //All generated sound (sine wave etc.) except square wave have sampling rate of 50000 Hz, length 1s. We will plot the first 10 ms. That's 500       samples for 10 ms and 500 px
    if (musicType == 0 || musicType == 1 || musicType == 2 || musicType == 3)
    {
        xinc = 10/500;
        imax = 500;
        imult = 1;
    }
    else if (musicType == 4) //At 50000 Hz, square wave plays very poorly, we use 88200 Hz
    {
        xinc = 10/882;
        imax = 882;
        imult = 1;
    }
    else if (musicType == 5 || musicType == 6 || musicType == 7 || musicType == 8) //All music files have a sampling rate 22050 Hz, length 20s. 20s/500px --> get value every 0.04 s ie every 882 samples.
    {
        xinc = 20/500;
        imax = 500;
        imult = 882;
    }

    while (i <= imax)
    {
        ii = imult*i;
        time[i] = x;
        insig[i] = sp.inSignal.data[ii];
        outsig[i] = sp.outSignals[0].data[ii];
        rsig[i] = sp.outSignals[1].data[ii];
        x += xinc;
        i++;
    }

    sp.normalizeAllSounds();
}

var resistance = [0.1, 0.11, 0.12, 0.13, 0.15, 0.16, 0.18, 0.2, 0.22, 0.24, 0.27, 0.3, 0.33, 0.36, 0.39, 0.43, 0.47, 0.51, 0.56, 0.62, 0.68, 0.75, 0.82, 0.91, 1, 1.1, 1.2, 1.3, 1.50, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1, 10];

function getResistance(value)
{
    var distance;
    var minDistance = Number.POSITIVE_INFINITY;
    var minIndex;

    for (var i = 0, l = resistance.length; i < l; i++)
    {
        distance = Math.abs(value - resistance[i]);
        if (distance < minDistance)
        {
            minDistance = distance;
            minIndex = i;
        }
    }
    return resistance[minIndex];
}

function kiloToUnit(k)
{
    return k*1000;
}

function getVDS(inData, outData, VBIAS, VS, R, K, VT)
{
    // Given vector of inputs (VGS), compute vector of outputs (VDS)
    // VGS: input source in vector
    // VDS: voltage across MOSFET
    // VS: Supply Voltage
    // R: load resistor
    // VC: gate-to-source below above which MOSFET is in saturation
    // K, VT: mosfet parameters

    var b;
    var VC = getVC(VS, R, K, VT);
    var indata;

    for (var i = 0, l = inData.length; i < l; i++)
    {
        indata = inData[i] + VBIAS;

        if (indata < VT)
            outData[i] = VS;
        else if (indata < VC)
            outData[i] = VS - R*(K/2)*Math.pow(indata - VT, 2);
            else
        {
                    b = -R*K*(indata - VT) - 1;
            outData[i] = (-b - Math.sqrt(b*b - 2*R*K*VS))/(R*K);
        }
    }
};

// Solve for VC, where VC is the VGS below which the MOSFET is in saturation
function getVC(VS, R, K, VT)
{
    return VT + (-1 + Math.sqrt(1 + 2*VS*R*K))/(R*K);
}

function getVr(inData, outData)
{
    for (var i = 0, l = outData.length; i < l; i++)
    {
        outData[i] = vS - inData[i];
    }
}

$("#vsSlider" ).slider({value: vS, min: 0, max: 10, step: 0.01,
                slide: function(event, ui)
                {
                    $("#vs").html("V<sub>S</sub> = " + ui.value + " V");
                    vS = ui.value;
                    VS.value = vS;
                    communSlide();
                }
            });
$("#vs").html("V<sub>S</sub> = "+ $("#vsSlider").slider("value") + " V");

$("#vinSlider").slider({value: vIn, min: 0, max: 5, step: 0.01,
                slide: function(event, ui)
                {
                    $("#vin").html("Peak-to-Peak Voltage = " + ui.value + " V");
                    vIn = ui.value;
                    VIn.value = vIn;
                    communSlide();
                }
            });
$("#vin").html("Peak-to-Peak Voltage = " + $("#vinSlider").slider("value") + " V");

$("#freqSlider").slider({value: freq, min: 0, max: 5000, step: 100,
                slide: function(event, ui)
                {
                    $("#freq").html("Frequency = " + ui.value + " Hz");
                    freq = ui.value;
                    communSlide();
                }
            });
$("#freq").html("Frequency = " + $("#freqSlider").slider("value") + " Hz");

$("#vbiasSlider").slider({value: vBias, min: 0, max: 10, step: 0.01,
                slide: function(event, ui)
                {
                    $("#vbias").html("V<sub>BIAS</sub> = " + ui.value + " V");
                    vBias = ui.value;
                    VBias.value = vBias;
                    communSlide();
                }
            });
$("#vbias").html("V<sub>BIAS</sub> = " + $("#vbiasSlider").slider("value") + " V");

$("#rSlider").slider({value: 1, min: 0.1, max: 10, step: 0.01,
                slide: function(event, ui)
                {
                    //Values of slider are in Kilo Ohms
                    var val = getResistance(ui.value);
                    $(this).slider("value", val);
                    if (val >= 1.0) //kOhms
                    {
                        $("#r").html("R = " +  val + " k&Omega;");
                        R.value = val;
                        R.valueString.suffix = "k\u03A9";
                    }
                    else
                    {
                        $("#r").html("R = " +  kiloToUnit(val) + " &Omega;");
                        R.value = kiloToUnit(val);
                        R.valueString.suffix = "\u03A9";
                    }

                    r = kiloToUnit(val);
                    communSlide();
                    //return false; //Blocks keystrokes if enabled
                }
            });
$("#r").html("R = " + $("#rSlider").slider("value") + " k&Omega;");

$("#kSlider").slider({value: k*1000, min: 0, max: 10, step: 0.01,
                slide: function(event, ui)
                {
                    $("#k").html("k = " + ui.value + " mA/V<sup>2</sup>");
                    k = ui.value / 1000; //Values are in mA
                    communSlide();
                }
            });
$("#k").html("k = " + $("#kSlider").slider("value") + " mA/V<sup>2</sup>");

    $("#vtSlider").slider({value: vt, min: 0, max: 10, step: 0.01,
                slide: function(event, ui)
                {
                    $("#vt").html("V<sub>T</sub> = " + ui.value + " V");
                    vt = ui.value;
                    communSlide();
                }
            });
$("#vt").html("V<sub>T</sub> = " + $("#vtSlider").slider("value") + " V");

$("#vmaxSlider" ).slider({value: vMax, min: 1, max: 20, step: 0.1,
                slide: function(event, ui)
                {
                    $("#vmax").html("V<sub>MAX</sub> = " + ui.value + " V");
                    maxVolt = ui.value;
                    if (labEnabled)
                    {
                        if (sp.isPlaying)
                            sp.stopTone();
                        setGraph();
                        generateBuffer();
                        calculateSignals();
                        draw();
                    }
                }
            });
$("#vmax").html("V<sub>MAX</sub> = " + $("#vmaxSlider").slider("value") + " V");

//The try catch block checks if canvas and audio libraries are present. If not, we exit and alert the user.
try
{
    //Add corresponding listener to various UI elements
    $('#musicTypeSelect').change(onSelectChange);
    $('input:checkbox').click(checkboxClicked);
    $('input:radio').click(radioButtonClicked);
    $('#playButton').click(playButtonClicked);
    initSound();
    initDiagram();
    initGraph();
    setGraph();
    generateBuffer();
    calculateSignals();
    draw();
    labEnabled = true;
}
catch(err)
{
    labEnabled = false;
    alert(err + " The tool is disabled.");
}
